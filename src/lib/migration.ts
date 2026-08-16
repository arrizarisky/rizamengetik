/**
 * Migration utilities for upgrading localStorage schema
 * This ensures backward compatibility when adding new fields
 */

import { Settings } from '../types';

export const CURRENT_VERSION = '2.0.0';

export function migrateSettings(savedSettings: Partial<Settings>): Settings {
  const defaultSettings: Settings = {
    soundProfile: 'thock',
    soundVolume: 0.75,
    ttsRate: 0.95,
    ttsPitch: 1.0,
    enableErrorChime: true,
    enableTTSVoice: true,
    strictBackspaceMode: true,
    zenMode: false,
    showVirtualKeyboard: true,
    showFingerGuides: true,
    blindfoldCurtain: true,
    fontFamily: 'mono',
    maxHearts: 3,
    customText: '',
    useCustomText: false,
  };

  // Merge saved settings with defaults (defaults for any missing fields)
  return { ...defaultSettings, ...savedSettings };
}

export function upgradeLocalStorageSchema(): void {
  const STORAGE_VERSION_KEY = 'blindtype_schema_version';
  const currentVersion = localStorage.getItem(STORAGE_VERSION_KEY);

  if (currentVersion === CURRENT_VERSION) {
    return; // Already up to date
  }

  console.log(`[Migration] Upgrading from ${currentVersion || 'legacy'} to ${CURRENT_VERSION}`);

  // Upgrade settings
  try {
    const settingsRaw = localStorage.getItem('blindtype_settings');
    if (settingsRaw) {
      const oldSettings = JSON.parse(settingsRaw);
      const newSettings = migrateSettings(oldSettings);
      localStorage.setItem('blindtype_settings', JSON.stringify(newSettings));
      console.log('[Migration] Settings upgraded successfully');
    }
  } catch (e) {
    console.error('[Migration] Failed to upgrade settings:', e);
  }

  // Mark as upgraded
  localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
  console.log('[Migration] Schema upgrade complete');
}
