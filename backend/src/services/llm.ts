import { getConfig } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed?: number;
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChoice {
  message: { content: string };
  finish_reason: string;
}

interface GroqAPIResponse {
  choices: GroqChoice[];
  model: string;
  usage?: { total_tokens: number };
}

const SYSTEM_PROMPT = `You are HerbiGPT, an expert Ayurvedic wellness guide. You provide helpful, accurate, and evidence-based information about Ayurveda, herbs, natural remedies, dosha balancing, diet, and holistic wellness practices.

Guidelines:
- Be concise and practical in your responses
- When discussing herbs or remedies, mention safety considerations
- Recommend consulting a qualified Ayurvedic practitioner for personalized advice
- If you don't know something, say so honestly
- Use markdown formatting for readability (bullet points, headers, bold)`;

class FallbackLLM {
  private responses: Map<string, string>;

  constructor() {
    this.responses = new Map([
      ['diet', `## Ayurvedic Diet Guidance\n\n- **Eat according to your dosha**: Vata types benefit from warm, grounding foods; Pitta types from cooling foods; Kapha types from light, stimulating foods.\n- **Follow the six tastes**: Include sweet, sour, salty, pungent, bitter, and astringent tastes in your meals.\n- **Eat mindfully**: Sit down, eat slowly, and avoid distractions.\n- **Favor warm, cooked foods** for easier digestion.\n- **Spice wisely**: Ginger, cumin, turmeric, and coriander aid digestion.\n- **Hydrate**: Drink warm water or herbal teas throughout the day.\n\n> *For personalized dietary advice, consult a qualified Ayurvedic practitioner.*`],
      ['ayurveda', `## What is Ayurveda?\n\nAyurveda is a 5,000-year-old system of natural healing originating from India. The word means "Science of Life" (Ayur = life, Veda = knowledge).\n\n### Core Principles\n- **Three Doshas**: Vata (air/space), Pitta (fire/water), Kapha (earth/water)\n- **Dinacharya**: Daily routines for optimal health\n- **Panchakarma**: Detoxification and rejuvenation therapies\n- **Dravyaguna**: Herbal pharmacology\n\n### Key Practices\n- Balanced diet according to your constitution\n- Herbal remedies and formulations\n- Yoga and meditation\n- Seasonal routines (Ritucharya)\n- Oil massage (Abhyanga)\n\n> *Ayurveda emphasizes prevention and treating the root cause, not just symptoms.*`],
      ['herb', `## Common Ayurvedic Herbs\n\n- **Ashwagandha** (Withania somnifera): Adaptogen for stress, energy, and immunity\n- **Turmeric** (Curcuma longa): Anti-inflammatory, antioxidant, supports digestion\n- **Tulsi** (Holy Basil): Respiratory health, stress relief, immune support\n- **Triphala**: Three-fruit formula for digestion and detoxification\n- **Brahmi** (Bacopa monnieri): Memory, focus, and cognitive function\n- **Shatavari** (Asparagus racemosus): Hormonal balance, rejuvenation\n- **Amla** (Indian Gooseberry): Vitamin C, hair and skin health\n\n> ⚠️ *Always consult a qualified practitioner before starting any herbal regimen.*`],
      ['dosha', `## Understanding Your Dosha\n\n### Vata (Air + Space)\n- **Characteristics**: Creative, energetic, thin build, dry skin\n- **Imbalance signs**: Anxiety, insomnia, dry skin, constipation\n- **Balance with**: Warm foods, regular routine, oil massage, grounding activities\n\n### Pitta (Fire + Water)\n- **Characteristics**: Sharp intellect, medium build, warm body\n- **Imbalance signs**: Inflammation, anger, heartburn, skin rashes\n- **Balance with**: Cooling foods, moderate exercise, time in nature\n\n### Kapha (Earth + Water)\n- **Characteristics**: Calm, strong build, good stamina\n- **Imbalance signs**: Weight gain, lethargy, congestion, attachment\n- **Balance with**: Light foods, vigorous exercise, variety, stimulation\n\n> *Most people are a combination of two doshas (Prakriti).*`],
    ]);
  }

  async generate(question: string): Promise<LLMResponse> {
    const q = question.toLowerCase();
    
    for (const [key, response] of this.responses) {
      if (q.includes(key)) {
        return { content: response, model: 'fallback_static' };
      }
    }

    return {
      content: `## Wellness Guidance\n\nThank you for your question about "${question}".\n\nHere are some general Ayurvedic wellness recommendations:\n\n- **Daily Routine**: Wake early, practice oil pulling, and follow a consistent schedule\n- **Diet**: Eat fresh, seasonal, whole foods suited to your constitution\n- **Movement**: Practice yoga, walking, or exercise appropriate for your dosha\n- **Rest**: Sleep 7-8 hours, ideally by 10 PM\n- **Mindfulness**: Meditate daily, even for 10 minutes\n\n> *For specific health concerns, please consult a qualified Ayurvedic practitioner.*`,
      model: 'fallback_static',
    };
  }
}

class GroqLLM {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(apiKey: string, model = 'llama-3.1-8b-instant') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(question: string, context?: string): Promise<LLMResponse> {
    const messages: GroqMessage[] = [
      { role: 'system', content: context ? `${SYSTEM_PROMPT}\n\nCONTEXT:\n${context}` : SYSTEM_PROMPT },
      { role: 'user', content: question },
    ];

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as GroqAPIResponse;
    const content = data.choices?.[0]?.message?.content?.trim() || 'No response generated.';

    return {
      content,
      model: data.model || this.model,
      tokensUsed: data.usage?.total_tokens,
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class LLMService {
  private groq: GroqLLM | null = null;
  private fallback: FallbackLLM;
  private _activeModel: string = 'fallback_static';

  constructor() {
    const config = getConfig();
    this.fallback = new FallbackLLM();

    if (config.GROQ_API_KEY) {
      this.groq = new GroqLLM(config.GROQ_API_KEY);
      this._activeModel = 'groq/llama-3.1-8b-instant';
      logger.info('LLM Service initialized with Groq API');
    } else {
      logger.warn('No GROQ_API_KEY found. Using fallback LLM.');
    }
  }

  get activeModel(): string {
    return this._activeModel;
  }

  async generate(question: string, context?: string): Promise<LLMResponse> {
    // Try Groq first
    if (this.groq) {
      try {
        return await this.groq.generate(question, context);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error('Groq LLM failed, falling back to static responses', { error: msg });
        this._activeModel = 'fallback_static';
      }
    }

    // Fallback to static responses
    return this.fallback.generate(question);
  }

  async checkHealth(): Promise<boolean> {
    if (this.groq) {
      return this.groq.isAvailable();
    }
    return true; // Fallback is always available
  }
}

let _instance: LLMService | null = null;

export function getLLMService(): LLMService {
  if (!_instance) {
    _instance = new LLMService();
  }
  return _instance;
}
