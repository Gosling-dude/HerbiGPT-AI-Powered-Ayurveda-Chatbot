import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize clients
console.log("Initializing HerbiGPT Backend (local LLM fallback)...");
// We'll use a local deterministic LLM stub so the project is functional
// even when remote LLMs (Groq/Google) are unavailable or keys lack access.
let llmClient = null;
let usingModel = 'local_stub';

class LocalLLM {
  async generate(prompt) {
    const q = (prompt || '').toLowerCase();
    // Simple rule-based canned responses for demo purposes
    if (q.includes('diet') || q.includes('weight') || q.includes('lose weight') || q.includes('weight loss')) {
      return `Here's a practical, safe starter diet plan for weight loss:\n\n` +
        `- Aim for a daily calorie deficit of about 300-500 kcal (safe gradual loss).\n` +
        `- Focus on whole foods: vegetables, lean proteins (chicken, fish, legumes), whole grains, and healthy fats (olive oil, nuts).\n` +
        `- Build meals around vegetables + protein + a small portion of complex carbs.\n` +
        `- Limit sugary drinks, processed snacks, and refined carbs. Replace with water, herbal tea, fruit, and nuts.\n` +
        `- Include protein at each meal to support satiety and preserve muscle.\n` +
        `- Aim for regular activity: 150 minutes moderate cardio per week + 2 strength sessions.\n` +
        `- Sleep 7-9 hours and manage stress—both affect weight.\n\n` +
        `This is general guidance. For personalized plans, consult a registered dietitian or healthcare professional.`;
    }

    if (q.includes('ayurveda') || q.includes('herbal') || q.includes('herbs')) {
      return `Ayurvedic guidance (general):\n\n` +
        `- Follow a balanced daily routine (dinacharya): regular sleep, meals, and self-care.\n` +
        `- Favor warm, cooked foods and spices like ginger, cumin, and turmeric for digestion.\n` +
        `- Hydrate with warm water and herbal teas.\n` +
        `- For personalized dosha-based advice, consult a qualified Ayurvedic practitioner.`;
    }

    // Default fallback: helpful wellness tips
    return `General wellness tips:\n\n- Eat a variety of whole foods (vegetables, fruits, whole grains, healthy fats).\n- Stay active: daily movement and weekly aerobic + strength training.\n- Prioritize sleep and stress management.\n- If you have specific health concerns, consult a healthcare professional.`;
  }
}

llmClient = new LocalLLM();
console.log('✓ Local LLM stub initialized (fallback, deterministic responses)');

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HerbiGPT Backend is running!', model: usingModel });
});

// Ask endpoint
app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log(`[${new Date().toISOString()}] Question: ${question}`);

    let answerText = '';

    // Use the configured LLM client (local stub by default)
    if (!llmClient) throw new Error('No LLM client configured');
    answerText = await llmClient.generate(question);

    console.log(`  ✓ Response received (${answerText.length} chars)`);

    res.json({
      success: true,
      answer: answerText,
      status: 'demo_mode',
      model: usingModel,
      message: 'LLM-only mode (vector database not yet ready)'
    });

  } catch (error) {
    console.error(`[ERROR] ${error.message}`);

    // If the error indicates the configured model is decommissioned or not found,
    // return a safe, helpful static fallback so the frontend still shows an answer.
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('model_decommissioned') || msg.includes('model_not_found') || msg.includes('decommissioned')) {
      const fallbackAnswer = `Here's a practical, safe starter diet plan for weight loss:\n\n` +
        `- Aim for a daily calorie deficit of about 300-500 kcal (safe gradual loss).\n` +
        `- Focus on whole foods: vegetables, lean proteins (chicken, fish, legumes), whole grains, and healthy fats (olive oil, nuts).\n` +
        `- Build meals around vegetables + protein + a small portion of complex carbs.\n` +
        `- Limit sugary drinks, processed snacks, and refined carbs. Replace with water, herbal tea, fruit, and nuts.\n` +
        `- Include protein at each meal to support satiety and preserve muscle.\n` +
        `- Aim for regular activity: 150 minutes moderate cardio per week + 2 strength sessions.\n` +
        `- Sleep 7-9 hours and manage stress—both affect weight.\n\n` +
        `This is general guidance. For personalized plans, consult a registered dietitian or healthcare professional.`;

      return res.json({
        success: true,
        answer: fallbackAnswer,
        status: 'fallback_answer',
        model: 'fallback_static',
        message: 'Returned static fallback due to model availability error.'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      model: usingModel
    });
  }
});

// Start server
const server = app.listen(port, host, () => {
  console.log(`\n✓ HerbiGPT Backend running on http://${host.replace('0.0.0.0', 'localhost')}:${port}`);
  console.log(`  Listening on host: ${host} port: ${port}`);
  console.log(`  Using: ${usingModel} LLM`);
  console.log('Endpoints:');
  console.log(`  GET  http://${host.replace('0.0.0.0', 'localhost')}:${port}/health`);
  console.log(`  POST http://${host.replace('0.0.0.0', 'localhost')}:${port}/ask\n`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
});
