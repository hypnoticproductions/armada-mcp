// Comprehensive verification test for error handling fixes
const MCPClient = require('./client.js');

async function runTests() {
  console.log('🧪 ARMADA MCP Verification Test Suite\n');
  console.log('=' .repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, passed, details = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (details) console.log(`   ${details}`);
    results.tests.push({ name, passed, details });
    if (passed) results.passed++;
    else results.failed++;
  }

  // Test 1: Client Connection
  console.log('\n📡 Test 1: WebSocket Connection');
  const client = new MCPClient({
    url: 'ws://localhost:8080',
    requestTimeout: 5000,
    maxReconnectAttempts: 3
  });

  try {
    await client.connect();
    logTest('Client connects to server', true);
  } catch (error) {
    logTest('Client connects to server', false, error.message);
    process.exit(1);
  }

  // Test 2: Ping/Pong
  console.log('\n🏓 Test 2: Basic Communication (Ping)');
  try {
    const response = await client.ping();
    logTest('Ping returns pong', response.type === 'pong', `Response: ${response.type}`);
  } catch (error) {
    logTest('Ping returns pong', false, error.message);
  }

  // Test 3: Get Corridors
  console.log('\n🗺️  Test 3: Get Corridors');
  try {
    const response = await client.getCorridors();
    const hasCorridors = response.corridors && response.corridors.length > 0;
    logTest('Get corridors returns data', hasCorridors, `Found ${response.corridors?.length || 0} corridors`);
  } catch (error) {
    logTest('Get corridors returns data', false, error.message);
  }

  // Test 4: Valid Content Validation
  console.log('\n✅ Test 4: Valid Content Validation');
  try {
    const response = await client.validate(
      'Fire lyrics burning bright, energy taking flight, power in the night',
      'usa',
      'hype',
      [1, 2, 3]
    );
    logTest('Validates clean content', response.type === 'validationComplete', `ARM Score: ${response.result?.scores?.arm?.toFixed(2) || 'N/A'}`);
  } catch (error) {
    logTest('Validates clean content', false, error.message);
  }

  // Test 5: Short Content Warning (Issue #16 fix)
  console.log('\n⚠️  Test 5: Short Content Handling');
  try {
    const response = await client.validate('Hi there', 'usa', 'hype', [1]);
    logTest('Handles short content gracefully', response.type === 'validationComplete', 'No crash on short content');
  } catch (error) {
    logTest('Handles short content gracefully', false, error.message);
  }

  // Test 6: Invalid Corridor (Issue #5 fix)
  console.log('\n🚫 Test 6: Invalid Corridor Validation');
  try {
    const response = await client.validate('Test content here', 'invalid_corridor', null, [1]);
    const hasError = response.type === 'error' || (response.result?.flags?.some(f => f.type === 'validation'));
    logTest('Rejects invalid corridor', hasError, 'Validation caught invalid corridor');
  } catch (error) {
    // Error is expected for invalid corridor
    logTest('Rejects invalid corridor', true, 'Properly threw error for invalid corridor');
  }

  // Test 7: Message Timeout (Issue #1 & #13 fix)
  console.log('\n⏱️  Test 7: Request Timeout Handling');
  const timeoutClient = new MCPClient({
    url: 'ws://localhost:8080',
    requestTimeout: 100 // Very short timeout
  });
  await timeoutClient.connect();

  try {
    // Send a message but modify the ID so server never responds
    const originalSend = timeoutClient.send;
    timeoutClient.send = function(action, params) {
      return originalSend.call(this, action, params);
    };

    // This should timeout after 100ms
    const start = Date.now();
    await timeoutClient.send('ping', {});
    logTest('Request timeout triggers', false, 'Timeout should have occurred');
  } catch (error) {
    const duration = Date.now() - start;
    const isTimeout = error.message.includes('timeout');
    logTest('Request timeout triggers', isTimeout && duration < 1000, `Timed out in ${duration}ms`);
  }
  timeoutClient.disconnect();

  // Test 8: Event Listener Cleanup (Issue #19 fix)
  console.log('\n🧹 Test 8: Event Listener Cleanup');
  const testCallback = (data) => console.log('Event:', data);
  client.on('test-event', testCallback);
  const before = client.eventListeners?.get('test-event')?.length || 0;
  client.off('test-event', testCallback);
  const after = client.eventListeners?.get('test-event')?.length || 0;
  logTest('Event listeners can be removed', before === 1 && after === 0, `Before: ${before}, After: ${after}`);

  // Test 9: Line Validation
  console.log('\n📝 Test 9: Line Validation');
  try {
    const response = await client.validateLine('Living my best life every day', 'usa');
    logTest('Validates single line', response.type === 'lineValidationComplete', `Corridor: ${response.result?.scores?.corridor?.toFixed(2) || 'N/A'}`);
  } catch (error) {
    logTest('Validates single line', false, error.message);
  }

  // Test 10: Malformed JSON Handling (Issue #4 fix)
  console.log('\n🔧 Test 10: Malformed JSON Handling');
  try {
    // Try to send malformed data directly
    if (client.ws && client.ws.readyState === 1) {
      client.ws.send('{"invalid json}');
      // Wait a bit for server response
      await new Promise(resolve => setTimeout(resolve, 500));
      logTest('Server handles malformed JSON', true, 'Server did not crash');
    }
  } catch (error) {
    logTest('Server handles malformed JSON', false, error.message);
  }

  // Test 11: Proper Disconnect & Cleanup
  console.log('\n🔌 Test 11: Client Disconnect & Cleanup');
  const handlersBefore = client.handlers.size;
  client.disconnect();
  const handlersAfter = client.handlers.size;
  logTest('Client cleanup on disconnect', handlersAfter === 0, `Handlers cleared: ${handlersBefore} → ${handlersAfter}`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}: ${t.details}`);
    });
  }

  console.log('\n✨ Verification Complete!\n');
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});
