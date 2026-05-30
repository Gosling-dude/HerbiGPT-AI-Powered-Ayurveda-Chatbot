import type { MCPServer, MCPToolCall, MCPToolResult, MCPToolDefinition } from '../types/index.js';
import { logger } from '../utils/logger.js';

interface KnowledgeDocument {
  id: string;
  content: string;
  source: string;
  topic: string;
}

/**
 * MCP Server for Ayurveda knowledge retrieval.
 * In-memory knowledge base with curated Ayurvedic content.
 * Will be upgraded to vector search in GCP deployment.
 */
export class KnowledgeServer implements MCPServer {
  name = 'knowledge-server';
  description = 'MCP server for Ayurveda knowledge retrieval from documents, books, and curated content';

  private documents: KnowledgeDocument[] = [];
  private _isReady = false;

  tools: MCPToolDefinition[] = [
    {
      name: 'search_knowledge',
      description: 'Search the Ayurveda knowledge base for relevant documents',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          topK: { type: 'number', description: 'Number of results to return', default: 4 },
        },
        required: ['query'],
      },
    },
    {
      name: 'list_topics',
      description: 'List available knowledge topics',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_document',
      description: 'Get a specific document by ID',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
    },
  ];

  constructor() {
    this.loadKnowledgeBase();
  }

  get isReady(): boolean {
    return this._isReady;
  }

  private loadKnowledgeBase(): void {
    // Embedded curated knowledge base derived from authentic Ayurvedic texts
    this.documents = [
      {
        id: 'dosha-vata',
        topic: 'doshas',
        source: 'Charaka Samhita',
        content: 'Vata dosha is composed of air and space elements. It governs all movement in the body and mind, including breathing, heartbeat, muscle contractions, and nerve impulses. Vata types tend to be thin, energetic, and creative. When balanced, they are lively and enthusiastic. When imbalanced, they experience anxiety, insomnia, dry skin, and constipation. To balance Vata: follow a regular daily routine, eat warm cooked foods, use warming spices (ginger, cinnamon), practice gentle yoga, and apply sesame oil massage (abhyanga).',
      },
      {
        id: 'dosha-pitta',
        topic: 'doshas',
        source: 'Charaka Samhita',
        content: 'Pitta dosha is composed of fire and water elements. It governs digestion, metabolism, and transformation in the body. Pitta types tend to have a medium build, sharp intellect, and warm body temperature. When balanced, they are confident and decisive leaders. When imbalanced, they experience inflammation, anger, heartburn, and skin rashes. To balance Pitta: eat cooling foods (cucumber, mint, coconut), avoid excessive heat and spicy foods, practice moderate exercise, spend time in nature, and cultivate patience and compassion.',
      },
      {
        id: 'dosha-kapha',
        topic: 'doshas',
        source: 'Charaka Samhita',
        content: 'Kapha dosha is composed of earth and water elements. It provides structure, stability, and lubrication to the body. Kapha types tend to have a sturdy build, calm temperament, and excellent stamina. When balanced, they are loving, forgiving, and grounded. When imbalanced, they experience weight gain, lethargy, congestion, and emotional attachment. To balance Kapha: engage in vigorous exercise, eat light and warming foods, use stimulating spices (black pepper, ginger, mustard), wake early, and seek variety and new experiences.',
      },
      {
        id: 'herb-ashwagandha',
        topic: 'herbs',
        source: 'Dravyaguna Vijnana',
        content: 'Ashwagandha (Withania somnifera), also known as Indian Ginseng, is one of the most important herbs in Ayurveda. It is classified as a Rasayana (rejuvenative) and Medhya (brain tonic). Properties: Rasa (taste) is bitter and astringent, Virya (potency) is heating, Vipaka (post-digestive effect) is sweet. Benefits include: adaptogenic stress relief, improved energy and vitality, enhanced cognitive function and memory, immune system support, hormonal balance, and anti-inflammatory action. Typical dosage: 300-600mg standardized extract daily. Contraindications: pregnancy, autoimmune conditions, thyroid medication interactions.',
      },
      {
        id: 'herb-turmeric',
        topic: 'herbs',
        source: 'Bhavaprakasha',
        content: 'Turmeric (Curcuma longa), known as Haridra in Sanskrit, is a cornerstone of Ayurvedic medicine. Its active compound curcumin provides powerful anti-inflammatory and antioxidant properties. Ayurvedic properties: Rasa is bitter and pungent, Virya is heating, Vipaka is pungent. It balances all three doshas. Uses: anti-inflammatory support, digestive aid, blood purification, wound healing, skin health, liver protection. Golden milk recipe: warm milk with 1/2 tsp turmeric, pinch of black pepper (increases absorption by 2000%), and honey. Caution: may interact with blood-thinning medications.',
      },
      {
        id: 'herb-tulsi',
        topic: 'herbs',
        source: 'Bhavaprakasha',
        content: 'Tulsi (Ocimum sanctum), Holy Basil, is revered as the "Queen of Herbs" in Ayurveda. It is a potent adaptogen and has been used for thousands of years for respiratory health, stress management, and immune support. Ayurvedic properties: Rasa is pungent and bitter, Virya is heating, Vipaka is pungent. It primarily reduces Kapha and Vata doshas. Benefits: respiratory support (cough, cold, asthma), stress and anxiety reduction, blood sugar regulation, cardiovascular health, immune modulation. Usage: Tulsi tea (2-3 cups daily), fresh leaves, or standardized extract.',
      },
      {
        id: 'herb-triphala',
        topic: 'herbs',
        source: 'Sushruta Samhita',
        content: 'Triphala is a classical Ayurvedic formulation consisting of three fruits: Amalaki (Emblica officinalis), Bibhitaki (Terminalia bellirica), and Haritaki (Terminalia chebula). It is considered tridoshic, balancing all three doshas. Benefits: gentle yet effective digestive cleansing, natural laxative action, antioxidant protection, eye health (traditionally used as eye wash), immune support, and anti-inflammatory action. Each fruit addresses a specific dosha: Amalaki for Pitta, Bibhitaki for Kapha, and Haritaki for Vata. Typical dosage: 500mg-1g before bed with warm water.',
      },
      {
        id: 'practice-dinacharya',
        topic: 'daily_routine',
        source: 'Ashtanga Hridayam',
        content: 'Dinacharya (daily routine) is fundamental to Ayurvedic wellness. Recommended morning routine: (1) Wake before sunrise (Brahma Muhurta, ~4:30-6:00 AM). (2) Eliminate waste (urination and bowel movement). (3) Clean teeth and scrape tongue with copper scraper. (4) Oil pulling with sesame or coconut oil for 5-15 minutes. (5) Drink warm water with lemon. (6) Self-massage (Abhyanga) with dosha-appropriate oil. (7) Exercise appropriate for constitution. (8) Bathe. (9) Meditate for 15-20 minutes. (10) Eat a nourishing breakfast. Following Dinacharya promotes balance, prevents disease, and enhances longevity.',
      },
      {
        id: 'practice-panchakarma',
        topic: 'treatments',
        source: 'Charaka Samhita',
        content: 'Panchakarma is a set of five therapeutic procedures for deep detoxification and rejuvenation. The five actions are: (1) Vamana (therapeutic emesis) - for Kapha disorders. (2) Virechana (purgation therapy) - for Pitta disorders. (3) Basti (medicated enema) - for Vata disorders, considered the most important. (4) Nasya (nasal administration) - for head and neck disorders. (5) Raktamokshana (bloodletting) - for blood-related disorders. Panchakarma should only be performed under qualified supervision, preceded by preparatory procedures (Poorvakarma) including oil massage (Snehana) and sweating therapy (Swedana).',
      },
      {
        id: 'diet-principles',
        topic: 'diet',
        source: 'Charaka Samhita',
        content: 'Ayurvedic dietary principles emphasize eating according to your constitution (Prakriti) and current state of balance (Vikriti). The six tastes (Shadrasa) should be included in every meal: Sweet (Madhura), Sour (Amla), Salty (Lavana), Pungent (Katu), Bitter (Tikta), and Astringent (Kashaya). Key principles: (1) Eat your largest meal at midday when Agni (digestive fire) is strongest. (2) Eat only when hungry. (3) Do not eat until the previous meal is digested. (4) Eat in a calm, settled environment. (5) Favor fresh, seasonal, locally grown foods. (6) Avoid incompatible food combinations (Viruddhahara) like milk with fish or fruit with meals.',
      },
      {
        id: 'diet-weight',
        topic: 'diet',
        source: 'Ashtanga Hridayam',
        content: 'Ayurvedic approach to healthy weight management focuses on strengthening Agni (digestive fire) rather than calorie restriction. Key recommendations: (1) Drink warm water with lemon and honey in the morning. (2) Make lunch the main meal; keep dinner light. (3) Favor bitter, pungent, and astringent tastes which reduce Kapha. (4) Include metabolism-boosting spices: ginger, black pepper, cumin, mustard seeds. (5) Practice regular exercise appropriate for your constitution. (6) Avoid daytime sleeping. (7) Triphala before bed supports gentle detoxification. (8) Practice intermittent fasting (skip dinner occasionally). (9) Reduce sweet, sour, and salty tastes. (10) Address emotional eating through meditation and self-awareness.',
      },
      {
        id: 'practice-yoga',
        topic: 'yoga',
        source: 'Yoga Vashishta',
        content: 'In Ayurveda, yoga is considered essential for maintaining balance of body, mind, and spirit. Dosha-specific recommendations: Vata types benefit from slow, grounding practices (Hatha yoga, restorative poses, forward bends). Pitta types benefit from cooling, moderate practices (Moon salutations, twists, seated poses). Kapha types benefit from vigorous, energizing practices (Sun salutations, backbends, inversions). Universal recommendations: practice Pranayama (breathing exercises) daily, especially Nadi Shodhana (alternate nostril breathing) for balancing all doshas. Practice meditation (Dhyana) for mental clarity and emotional balance. Best time for yoga: Brahma Muhurta (pre-dawn) or sunset.',
      },
    ];

    this._isReady = true;
    logger.info(`Knowledge base loaded: ${this.documents.length} documents across ${this.getTopics().length} topics`);
  }

  private getTopics(): string[] {
    return [...new Set(this.documents.map(d => d.topic))];
  }

  private searchDocuments(query: string, topK: number = 4): KnowledgeDocument[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    const scored = this.documents.map(doc => {
      const text = `${doc.content} ${doc.topic} ${doc.id}`.toLowerCase();
      let score = 0;
      for (const term of queryTerms) {
        if (text.includes(term)) {
          score += 1;
          // Boost for exact topic match
          if (doc.topic.includes(term) || doc.id.includes(term)) {
            score += 2;
          }
        }
      }
      return { doc, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(s => s.doc);
  }

  async executeTool(call: MCPToolCall): Promise<MCPToolResult> {
    switch (call.name) {
      case 'search_knowledge': {
        const { query, topK } = call.arguments as { query: string; topK?: number };
        const results = this.searchDocuments(query, topK || 4);
        
        if (results.length === 0) {
          return { content: JSON.stringify({ results: [], message: 'No matching documents found' }) };
        }

        return {
          content: JSON.stringify({
            results: results.map(d => ({
              id: d.id,
              topic: d.topic,
              source: d.source,
              content: d.content,
            })),
            count: results.length,
          }),
        };
      }

      case 'list_topics': {
        const topics = this.getTopics();
        const topicCounts = topics.map(t => ({
          topic: t,
          count: this.documents.filter(d => d.topic === t).length,
        }));
        return { content: JSON.stringify({ topics: topicCounts }) };
      }

      case 'get_document': {
        const { id } = call.arguments as { id: string };
        const doc = this.documents.find(d => d.id === id);
        if (!doc) {
          return { content: `Document not found: ${id}`, isError: true };
        }
        return { content: JSON.stringify(doc) };
      }

      default:
        return { content: `Unknown tool: ${call.name}`, isError: true };
    }
  }
}
