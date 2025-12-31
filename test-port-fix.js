#!/usr/bin/env node
// Test script to verify health check and WebSocket work on same port

const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const HOST = 'localhost';

console.log('='.repeat(60));
console.log('Testing ARMADA MCP Server - Port Fix Validation');
console.log('='.repeat(60));
console.log(`Target: http://${HOST}:${PORT}`);
console.log('');

let passed = 0;
let failed = 0;

function logTest(name, success, details = '') {
  const status = success ? '✓ PASS' : '✗ FAIL';
  const color = success ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${name}`);
  if (details) {
    console.log(`  ${details}`);
  }
  if (success) passed++;
  else failed++;
}

async function testHealthCheck() {
  return new Promise((resolve) => {
    console.log('\n1. Testing Health Check Endpoint');
    console.log('-'.repeat(60));

    const req = http.get(`http://${HOST}:${PORT}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          logTest('Health check responds on main port', res.statusCode === 200, `Status: ${res.statusCode}`);
          logTest('Health check returns valid JSON', response.status === 'healthy', `Status: ${response.status}`);
          logTest('Health check includes uptime', typeof response.uptime === 'number', `Uptime: ${response.uptime}s`);
          resolve(true);
        } catch (error) {
          logTest('Health check JSON parsing', false, error.message);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      logTest('Health check connection', false, error.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      logTest('Health check timeout', false, 'Request timed out after 5s');
      resolve(false);
    });
  });
}

async function testRootEndpoint() {
  return new Promise((resolve) => {
    console.log('\n2. Testing Root Endpoint');
    console.log('-'.repeat(60));

    const req = http.get(`http://${HOST}:${PORT}/`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          logTest('Root endpoint responds', res.statusCode === 200, `Status: ${res.statusCode}`);
          logTest('Root returns server info', response.name === 'ARMADA MCP Server', `Name: ${response.name}`);
          resolve(true);
        } catch (error) {
          logTest('Root endpoint parsing', false, error.message);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      logTest('Root endpoint connection', false, error.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      logTest('Root endpoint timeout', false, 'Request timed out after 5s');
      resolve(false);
    });
  });
}

async function testWebSocket() {
  return new Promise((resolve) => {
    console.log('\n3. Testing WebSocket Connection on Same Port');
    console.log('-'.repeat(60));

    const ws = new WebSocket(`ws://${HOST}:${PORT}`);
    let connected = false;
    let welcomeReceived = false;

    const timeout = setTimeout(() => {
      if (!connected) {
        logTest('WebSocket connection', false, 'Connection timeout after 5s');
        ws.close();
        resolve(false);
      }
    }, 5000);

    ws.on('open', () => {
      connected = true;
      logTest('WebSocket connects on main port', true, `ws://${HOST}:${PORT}`);
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'connected') {
          welcomeReceived = true;
          logTest('WebSocket receives welcome message', true, `ClientId: ${message.clientId}`);
          clearTimeout(timeout);

          // Test ping
          ws.send(JSON.stringify({ action: 'ping', id: 'test-1' }));
        } else if (message.type === 'pong') {
          logTest('WebSocket ping-pong works', true, 'Server responded to ping');
          ws.close();
          resolve(true);
        }
      } catch (error) {
        logTest('WebSocket message parsing', false, error.message);
        ws.close();
        resolve(false);
      }
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      logTest('WebSocket error', false, error.message);
      resolve(false);
    });

    ws.on('close', () => {
      if (!welcomeReceived) {
        logTest('WebSocket welcome', false, 'Connection closed before welcome');
        resolve(false);
      }
    });
  });
}

async function runTests() {
  console.log('Waiting for server to start...\n');

  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testHealthCheck();
  await testRootEndpoint();
  await testWebSocket();

  console.log('\n' + '='.repeat(60));
  console.log('Test Results');
  console.log('='.repeat(60));
  console.log(`\x1b[32mPassed: ${passed}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${failed}\x1b[0m`);
  console.log(`Total: ${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n\x1b[32m✓ All tests passed! Server is ready for Railway deployment.\x1b[0m\n');
  } else {
    console.log('\n\x1b[31m✗ Some tests failed. Please review the errors above.\x1b[0m\n');
  }

  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
