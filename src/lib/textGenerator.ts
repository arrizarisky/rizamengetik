import { Difficulty, Language, DrillType } from '../types';
import { getGeminiInstance } from './gemini';

interface CachedTexts {
  texts: string[];
  timestamp: number;
  expiresIn: number; // milliseconds
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const STORAGE_KEY_PREFIX = 'blindtype_generated_';

class TextGeneratorService {
  private cache: Map<string, CachedTexts> = new Map();

  constructor() {
    this.loadCacheFromStorage();
  }

  private getCacheKey(language: Language, difficulty: Difficulty): string {
    return `${language}_${difficulty}`;
  }

  private getDrillCacheKey(drillType: DrillType): string {
    return `drill_${drillType}`;
  }

  private loadCacheFromStorage(): void {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data) as CachedTexts;
            const cacheKey = key.replace(STORAGE_KEY_PREFIX, '');
            
            // Check if cache is still valid
            if (Date.now() - parsed.timestamp < parsed.expiresIn) {
              this.cache.set(cacheKey, parsed);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error loading cache from storage:', error);
    }
  }

  private saveCacheToStorage(key: string, data: CachedTexts): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving cache to storage:', error);
    }
  }

  private getCachedTexts(key: string): string[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.expiresIn;
    if (isExpired) {
      this.cache.delete(key);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`);
      return null;
    }

    return cached.texts;
  }

  private setCachedTexts(key: string, texts: string[]): void {
    const cachedData: CachedTexts = {
      texts,
      timestamp: Date.now(),
      expiresIn: CACHE_DURATION,
    };
    this.cache.set(key, cachedData);
    this.saveCacheToStorage(key, cachedData);
  }

  async generateTexts(
    language: Language,
    difficulty: Difficulty,
    forceRefresh: boolean = false
  ): Promise<string[]> {
    const cacheKey = this.getCacheKey(language, difficulty);

    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCachedTexts(cacheKey);
      if (cached) {
        console.log(`Using cached texts for ${cacheKey}`);
        return cached;
      }
    }

    // Generate new texts
    console.log(`Generating new texts for ${cacheKey}`);
    try {
      const gemini = getGeminiInstance();
      const count = difficulty === 'code' ? 6 : 8;
      const texts = await gemini.generateTexts({
        language,
        difficulty,
        count,
      });

      // Cache the results
      this.setCachedTexts(cacheKey, texts);
      return texts;
    } catch (error) {
      console.error('Error generating texts:', error);
      throw error;
    }
  }

  async generateDrillTexts(
    drillType: DrillType,
    forceRefresh: boolean = false
  ): Promise<string[]> {
    // Don't generate for custom drill type
    if (drillType === 'custom') {
      return [];
    }

    const cacheKey = this.getDrillCacheKey(drillType);

    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCachedTexts(cacheKey);
      if (cached) {
        console.log(`Using cached drill texts for ${drillType}`);
        return cached;
      }
    }

    // Generate new drill texts
    console.log(`Generating new drill texts for ${drillType}`);
    try {
      const gemini = getGeminiInstance();
      const texts = await gemini.generateDrillText(drillType, 3);

      // Cache the results
      this.setCachedTexts(cacheKey, texts);
      return texts;
    } catch (error) {
      console.error('Error generating drill texts:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('Cache cleared');
  }

  clearCacheForKey(language: Language, difficulty: Difficulty): void {
    const cacheKey = this.getCacheKey(language, difficulty);
    this.cache.delete(cacheKey);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${cacheKey}`);
    console.log(`Cache cleared for ${cacheKey}`);
  }
}

// Export singleton instance
export const textGeneratorService = new TextGeneratorService();
