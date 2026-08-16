# 🐛 Bug Fix: Cannot read properties of undefined (reading 'trim')

## Error Description
```
Uncaught TypeError: Cannot read properties of undefined (reading 'trim')
at loadNewSentence (PrecisionMode.tsx:74:55)
```

## Root Cause
Ketika user yang sudah punya data lama (tanpa field `customText` dan `useCustomText`) membuka aplikasi, settings di localStorage tidak memiliki field baru tersebut, sehingga `settings.customText` adalah `undefined`.

Saat mencoba `settings.customText.trim()`, error muncul karena tidak bisa call `.trim()` pada `undefined`.

## Solution

### 1. ✅ Defensive Null Checking
Menambahkan pengecekan yang lebih robust di `PrecisionMode.tsx` dan `BlindMode.tsx`:

**Before:**
```typescript
if (settings.useCustomText && settings.customText.trim()) {
  // ❌ Error jika settings.customText undefined
}
```

**After:**
```typescript
if (settings.useCustomText && settings.customText && settings.customText.trim()) {
  // ✅ Aman, cek existence sebelum call .trim()
}
```

### 2. ✅ Settings Migration System
Membuat sistem migration otomatis di `src/lib/migration.ts`:

```typescript
export function migrateSettings(savedSettings: Partial<Settings>): Settings {
  const defaultSettings: Settings = {
    // ... all default values including new fields
    maxHearts: 3,
    customText: '',
    useCustomText: false,
  };

  // Merge: defaults + saved settings
  return { ...defaultSettings, ...savedSettings };
}
```

### 3. ✅ Backward Compatible Settings Load
Update `AppContext.tsx` untuk merge settings lama dengan defaults:

```typescript
const [settings, setSettings] = useState<Settings>(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      // ✅ Merge untuk ensure all fields exist
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
});
```

### 4. ✅ Auto Migration on App Load
Migration berjalan otomatis sekali saat app pertama kali dibuka:

```typescript
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Run migration on mount
  useEffect(() => {
    upgradeLocalStorageSchema();
  }, []);
  // ...
}
```

## Testing

### Test Case 1: User Baru (Fresh Install)
```bash
1. Clear localStorage
2. Refresh app
3. ✅ Onboarding muncul
4. ✅ Settings memiliki semua default values
5. ✅ No errors
```

### Test Case 2: User Lama (Legacy Data)
```bash
1. User dengan settings lama (tanpa maxHearts, customText)
2. Refresh app
3. ✅ Migration otomatis running
4. ✅ Settings ter-upgrade dengan field baru
5. ✅ Data lama tetap preserved
6. ✅ No errors
```

### Test Case 3: Custom Text Mode
```bash
1. Enable "Use Custom Text" di Settings
2. Leave textarea EMPTY or undefined
3. Go to Precision Mode
4. ✅ Fallback ke WORD_LISTS
5. ✅ No errors
```

## Files Changed
- ✅ `src/components/PrecisionMode.tsx` - Add null check
- ✅ `src/components/BlindMode.tsx` - Add null check
- ✅ `src/context/AppContext.tsx` - Merge defaults with saved settings
- ✅ `src/lib/migration.ts` - NEW: Migration utilities
- ✅ `src/types.ts` - Add new Settings fields

## Verification Commands
```bash
# Check TypeScript errors
npm run lint

# Check in browser console
localStorage.getItem('blindtype_settings')
# Should show all fields including maxHearts, customText, useCustomText

localStorage.getItem('blindtype_schema_version')
# Should show "2.0.0"
```

## Prevention Strategy
For future schema changes:

1. **Always add null/undefined checks** when accessing new optional fields
2. **Always provide default values** in DEFAULT_SETTINGS
3. **Always merge** saved settings with defaults during load
4. **Update migration.ts** when adding new fields
5. **Increment CURRENT_VERSION** in migration.ts

## Related Issues
- ✅ Onboarding tidak muncul → Fixed by changing default `onboardingCompleted: false`
- ✅ Settings undefined fields → Fixed by migration system
- ✅ Backward compatibility → Fixed by merge strategy

---

**Status**: ✅ RESOLVED  
**Version**: 2.0.0  
**Date**: August 16, 2026
