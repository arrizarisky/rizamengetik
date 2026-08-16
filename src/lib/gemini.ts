import { Difficulty, Language } from '../types';

interface GeminiConfig {
  apiKey: string;
  model?: string;
}

interface GenerateTextOptions {
  language: Language;
  difficulty: Difficulty;
  count?: number;
  customPrompt?: string;
}

class GeminiTextGenerator {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-2.5-flash';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  private async callGemini(prompt: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  private getPromptForDifficulty(options: GenerateTextOptions): string {
    const { language, difficulty, count = 5 } = options;
    const lang = language === 'id' ? 'Bahasa Indonesia' : 'English';

    const basePrompts = {
      easy: `Generate ${count} typing practice sentences in ${lang} for EASY level.
Requirements:
- Use common, everyday words
- Sentence length: 8-15 words
- Focus on basic vocabulary and simple sentence structures
- Use academic and professional tone
- Avoid complex punctuation
- Each sentence should teach touch typing fundamentals
- Topics: work habits, learning, focus, discipline, daily routines

Format: Return only the sentences, one per line, no numbering or bullet points.`,

      medium: `Generate ${count} typing practice sentences in ${lang} for MEDIUM level.
Requirements:
- Sentence length: 15-25 words
- Use more complex vocabulary and compound sentences
- Include academic and professional terminology
- Use proper punctuation (commas, semicolons, periods)
- Topics: productivity, technology, skill development, professional growth, cognitive processes
- Maintain formal academic tone

Format: Return only the sentences, one per line, no numbering or bullet points.`,

      hard: `Generate ${count} typing practice sentences in ${lang} for HARD level.
Requirements:
- Sentence length: 20-35 words
- Include numbers, dates, percentages, and special characters
- Use technical terminology and complex sentence structures
- Include abbreviations, acronyms, and professional jargon
- Mix letters, numbers, and symbols (%, &, @, #, -, etc.)
- Topics: technical specifications, research findings, statistical data, historical facts
- Maintain academic and formal tone

Format: Return only the sentences, one per line, no numbering or bullet points.`,

      code: `Generate ${count} code snippets for typing practice.
Requirements:
- Mix of JavaScript, TypeScript, PHP, and Laravel code
- Include common patterns: functions, classes, interfaces, constants
- Length: 60-120 characters per line
- Use modern syntax (ES6+, TypeScript types, Laravel 10+)
- Include realistic code: API calls, state management, validation, database queries
- Proper indentation and formatting
- Mix of frontend (React/TS) and backend (Laravel/PHP) code

Examples of what to include:
- TypeScript: interfaces, type definitions, React hooks, async/await, fetch calls
- JavaScript: arrow functions, destructuring, array methods, template literals
- PHP/Laravel: Eloquent queries, route definitions, controllers, validation rules

Format: Return only the code lines, one per line, no explanations or comments.`,
    };

    return basePrompts[difficulty];
  }

  async generateTexts(options: GenerateTextOptions): Promise<string[]> {
    const prompt = options.customPrompt || this.getPromptForDifficulty(options);
    const response = await this.callGemini(prompt);

    // Parse response into array of sentences
    const texts = response
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !line.match(/^[\d\.\-\*\#]+[\s\.\)]/)); // Remove numbered or bulleted items

    return texts;
  }

  async generateDrillText(drillType: string, count: number = 3): Promise<string[]> {
    const drillPrompts: Record<string, string> = {
      home_row: `Generate ${count} typing drill lines focusing on HOME ROW keys (A S D F J K L ;).
Requirements:
- Use ONLY letters from home row: a, s, d, f, j, k, l, ; (and their uppercase)
- Each line should be 50-80 characters
- Create words and patterns that emphasize finger placement
- Mix lowercase and uppercase
- Include spaces between word groups

Format: Return only the practice lines, one per line.`,

      top_row: `Generate ${count} typing drill lines focusing on TOP ROW keys (Q W E R T Y U I O P).
Requirements:
- Emphasize top row letters: q, w, e, r, t, y, u, i, o, p
- Can include home row letters for support
- Each line should be 50-80 characters
- Create realistic words and patterns
- Mix lowercase and uppercase

Format: Return only the practice lines, one per line.`,

      bottom_row: `Generate ${count} typing drill lines focusing on BOTTOM ROW keys (Z X C V B N M).
Requirements:
- Emphasize bottom row letters: z, x, c, v, b, n, m
- Can include other letters for realistic words
- Each line should be 50-80 characters
- Include comma and period practice
- Mix lowercase and uppercase

Format: Return only the practice lines, one per line.`,

      number_row: `Generate ${count} typing drill lines focusing on NUMBER ROW (1 2 3 4 5 6 7 8 9 0).
Requirements:
- Mix of numbers, dates, times, percentages, quantities
- Include patterns like: phone numbers, years, prices, codes
- Each line should be 50-80 characters
- Realistic numerical data

Format: Return only the practice lines, one per line.`,

      symbols: `Generate ${count} code or symbol-heavy practice lines.
Requirements:
- Heavy use of programming symbols: { } [ ] ( ) < > ; : ' " , . / ? ! @ # $ % ^ & * - _ + = | \\
- Mix with letters and numbers
- Create realistic code patterns or technical syntax
- Each line should be 60-90 characters

Format: Return only the practice lines, one per line.`,
    };

    const prompt = drillPrompts[drillType] || drillPrompts.home_row;
    const response = await this.callGemini(prompt);

    const texts = response
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !line.match(/^[\d\.\-\*\#]+[\s\.\)]/));

    return texts;
  }
}

// Export singleton instance
let geminiInstance: GeminiTextGenerator | null = null;

export const initializeGemini = (apiKey: string) => {
  geminiInstance = new GeminiTextGenerator({ apiKey });
  return geminiInstance;
};

export const getGeminiInstance = (): GeminiTextGenerator => {
  if (!geminiInstance) {
    // Try to get API key from environment
    const apiKey = import.meta.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in .env file.');
    }
    geminiInstance = new GeminiTextGenerator({ apiKey });
  }
  return geminiInstance;
};

export { GeminiTextGenerator };
export type { GenerateTextOptions };
