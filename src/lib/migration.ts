/**
 * Migration utilities for upgrading localStorage schema
 * This ensures backward compatibility when adding new fields
 */

import { Settings, UserProfile } from '../types';

export const CURRENT_VERSION = '2.1.0';

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

export function migrateProfile(savedProfile: Partial<UserProfile>): Partial<UserProfile> {
  // If avatar is emoji (starts with emoji characters), convert to icon
  if (savedProfile.avatar && !savedProfile.avatarType) {
    // Check if avatar is emoji (non-ASCII character) or already an icon name
    const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(savedProfile.avatar);
    
    if (isEmoji) {
      // Convert emoji to default icon
      return {
        ...savedProfile,
        avatar: 'User',
        avatarType: 'icon',
      };
    } else if (savedProfile.avatar.startsWith('data:image') || savedProfile.avatar.startsWith('http')) {
      // Already an uploaded image
      return {
        ...savedProfile,
        avatarType: 'upload',
      };
    } else {
      // Already an icon name
      return {
        ...savedProfile,
        avatarType: 'icon',
      };
    }
  }

  return savedProfile;
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

  // Upgrade profile (migrate emoji avatars to icons)
  try {
    const profileRaw = localStorage.getItem('blindtype_profile');
    if (profileRaw) {
      const oldProfile = JSON.parse(profileRaw);
      const newProfile = migrateProfile(oldProfile);
      localStorage.setItem('blindtype_profile', JSON.stringify(newProfile));
      console.log('[Migration] Profile upgraded successfully');
    }
  } catch (e) {
    console.error('[Migration] Failed to upgrade profile:', e);
  }

  // Mark as upgraded
  localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
  console.log('[Migration] Schema upgrade complete');
}
