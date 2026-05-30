import fetch from 'node-fetch';

async function testAPI() {
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('\n=== Testing HerbiGPT API ===\n');
    
    // Test 1: Health check
    console.log('1. Testing /health endpoint...');
    const healthRes = await fetch(`${baseURL}/health`);
    const health = await healthRes.json();
    console.log('   Status:', healthRes.status);
    console.log('   Response:', JSON.stringify(health, null, 2));
    
    // Test 2: Ask endpoint
    console.log('\n2. Testing /ask endpoint with question...');
    const askRes = await fetch(`${baseURL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Diet plans for weight loss' })
    });
    
    console.log('   Status:', askRes.status);
    const ask = await askRes.json();
    console.log('   Success:', ask.success);
    console.log('   Answer:', ask.answer?.substring(0, 200) + (ask.answer?.length > 200 ? '...' : ''));
    console.log('   Full response:', JSON.stringify(ask, null, 2));
    
    console.log('\n✓ All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testAPI();
