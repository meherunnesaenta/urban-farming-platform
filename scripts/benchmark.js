const autocannon = require('autocannon');

async function runBenchmark() {
  console.log('🚀 Starting API Benchmark Suite...\n');
  
  const baseUrl = 'http://localhost:3000/api';
  
  const tests = [
    {
      name: 'GET /produce (Pagination)',
      url: `${baseUrl}/produce?page=1&limit=20`,
      method: 'GET'
    },
    {
      name: 'GET /rentals',
      url: `${baseUrl}/rentals?page=1&limit=20`,
      method: 'GET'
    },
    {
      name: 'GET /community/posts',
      url: `${baseUrl}/community/posts?page=1&limit=20`,
      method: 'GET'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`URL: ${test.url}`);
    
    try {
      const result = await autocannon({
        url: test.url,
        connections: 10,
        duration: 10,
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      results.push({
        test: test.name,
        avgLatency: result.latency.average,
        p99Latency: result.latency.p99,
        throughput: result.throughput.average,
        errors: result.errors,
        timeouts: result.timeouts
      });
      
      console.log(`  ✓ Avg Latency: ${result.latency.average.toFixed(2)}ms`);
      console.log(`  ✓ P99 Latency: ${result.latency.p99.toFixed(2)}ms`);
      console.log(`  ✓ Throughput: ${result.throughput.average.toFixed(0)} bytes/sec`);
      console.log(`  ✓ Errors: ${result.errors}`);
      console.log('---\n');
    } catch (error) {
      console.error(`  ✗ Test failed: ${error.message}`);
      console.log('---\n');
    }
  }
  
  console.log('\n📊 BENCHMARK SUMMARY');
  console.log('='.repeat(60));
  console.table(results);
  console.log('='.repeat(60));
}

runBenchmark().catch(console.error);
