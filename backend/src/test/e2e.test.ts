import { getOrchestrator } from '../mcp/orchestrator.js';
import { getLLMService } from '../services/llm.js';

async function runTests() {
  console.log('=== Starting HerbiGPT E2E Verification ===\n');

  try {
    // 1. Test LLM service availability
    console.log('1. Verifying LLM Service Health...');
    const llm = getLLMService();
    const isLlmHealthy = await llm.checkHealth();
    console.log(`   LLM Service Status: ${isLlmHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    console.log(`   Active Model: ${llm.activeModel}`);

    // 2. Test MCP Orchestrator
    console.log('\n2. Verifying MCP Orchestrator and Knowledge Retrieval...');
    const orchestrator = getOrchestrator();
    
    // Test direct tool call
    const knowledgeSearch = await orchestrator.callTool('knowledge-server', 'search_knowledge', {
      query: 'Ashwagandha dosage and benefits',
      topK: 2
    });
    
    if (knowledgeSearch.isError) {
      throw new Error(`Knowledge tool call failed: ${knowledgeSearch.content}`);
    }
    
    const parsedKnowledge = JSON.parse(knowledgeSearch.content);
    console.log(`   Knowledge Retrieval: SUCCESS`);
    console.log(`   Found documents: ${parsedKnowledge.count}`);
    
    // 3. Test End-to-End RAG execution
    console.log('\n3. Testing End-to-End RAG Execution...');
    const question = 'What are the benefits of Turmeric?';
    const start = Date.now();
    const result = await orchestrator.processQuestion(question);
    const duration = Date.now() - start;

    console.log(`   Duration: ${duration}ms`);
    console.log(`   Answer Mode: ${result.mode}`);
    console.log(`   Model Used: ${result.model}`);
    console.log(`   Sources: ${result.sources.join(', ')}`);
    console.log(`   Answer Preview:\n----------------------------------------\n${result.answer.substring(0, 300)}...\n----------------------------------------`);

    if (!result.answer || result.answer.length < 50) {
      throw new Error('E2E answer is missing or too short.');
    }

    console.log('\n✓ E2E Verification Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ E2E Verification Failed!');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

runTests();
