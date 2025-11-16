import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

import { ChatGroq } from '@langchain/groq';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

async function startServer() {
  try {
    console.log("Initializing components...");
    const model = new ChatGroq({ apiKey: process.env.GROQ_API_KEY, modelName: "llama3-8b-8192" });
    const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: process.env.GOOGLE_API_KEY });
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const chromaPath = path.join(__dirname, '..', 'db');

    console.log(`Loading vector store from: ${chromaPath}`);
    
    let retriever = null;
    let vectorStore = null;
    
    try {
      // Try to load vector store
      vectorStore = await Chroma.fromExistingCollection(embeddings, { collectionName: "langchain", url: chromaPath });
      console.log("Vector store loaded successfully.");
      retriever = vectorStore.asRetriever(4);
    } catch (err) {
      console.log("⚠ Vector store not found or failed to load. Using mock mode.");
      console.log(`Error: ${err.message}`);
    }
    
    // If no retriever, use mock that returns dummy context
    if (!retriever) {
      const { RunnableParallel, RunnableLambda } = require("@langchain/core/runnables");
      retriever = new RunnableLambda({
        func: async () => [
          { pageContent: "This is demo mode. Vector database is not yet ready. Please wait for full setup to complete." }
        ]
      });
    }
    
    const promptTemplate = PromptTemplate.fromTemplate(
`You are an expert Ayurvedic assistant named HerbiGPT. Your goal is to provide helpful and accurate information based *only* on the context provided.
If the context does not contain the answer, politely state that you don't have enough information. Do not make up answers.

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:`
    );
    const formatDocs = (docs) => docs.map((doc) => doc.pageContent).join('\\n\\n');
    const ragChain = RunnableSequence.from([
      { context: retriever.pipe(formatDocs), question: (input) => input.question },
      promptTemplate, model, new StringOutputParser(),
    ]);
    console.log("RAG chain created.");
    const app = express();
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';
    app.use(cors());
    app.use(express.json());
    app.post('/ask', async (req, res) => {
      const { question } = req.body;
      if (!question) return res.status(400).json({ error: 'Question is required' });
      try {
        console.log(`Received question: ${question}`);
        const answer = await ragChain.invoke({ question });
        console.log(`Generated answer: ${answer}`);
        res.json({ answer });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get an answer' });
      }
    });
    app.listen(port, host, () => console.log(`Backend server listening at http://${host.replace('0.0.0.0','localhost')}:${port}`));
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
}
startServer();