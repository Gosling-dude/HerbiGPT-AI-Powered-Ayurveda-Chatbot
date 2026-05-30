import 'dotenv/config';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

console.log("Testing Groq API with correct message format...");
console.log("API Key present:", !!process.env.GROQ_API_KEY);

try {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    modelName: "llama3-8b-8192",
  });

  const messages = [
    new SystemMessage("You are a helpful Ayurvedic wellness assistant."),
    new HumanMessage("What is Ayurveda?")
  ];

  console.log("Calling model with correct message format...");
  const response = await model.invoke(messages);
  console.log("Response received:");
  console.log(response.content);
  process.exit(0);
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
