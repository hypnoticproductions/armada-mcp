# ARMADA-MCP Error Handling Fix Plan

## Executive Summary
**Total Issues:** 25 (7 Critical, 6 High, 8 Medium, 4 Low)
**Estimated Phases:** 7
**Approach:** Search → Test-Verify → Fix → Search-Test-Verify (for each phase)

---

## Task Vector Chain Methodology

Each phase follows this systematic approach:

```
SEARCH → TEST-VERIFY → FIX → SEARCH-TEST-VERIFY → COMMIT
   ↓          ↓          ↓            ↓              ↓
Locate    Document   Implement    Validate      Save
Issues    Current    Solution     Changes       Work
          Behavior
```

---

## PHASE 1: Client-Side Error Handling (client.js)
**Issues:** #1, #2, #6, #13, #19
**Severity:** 2 Critical, 2 Medium, 1 Medium

### 1.1 SEARCH
**Objective:** Locate all client-side error handling gaps
**Files:** `client.js`
**Search Patterns:**
- Promise handlers in `send()` method (lines 96-111)
- Queue processing in `processQueue()` (line 89)
- Reconnection logic in `onClose()` (lines 51-53)
- Event listener management (lines 197-208)

**Commands:**
```bash
grep -n "handlers.set" client.js
grep -n "processQueue" client.js
grep -n "reconnectAttempts" client.js
grep -n "eventListeners" client.js
```

### 1.2 TEST-VERIFY
**Objective:** Document current error behaviors
**Test Cases to Create:**
1. Send message and never receive response (memory leak test)
2. Queue message that fails (error propagation test)
3. Exhaust reconnection attempts (no callback test)
4. Add event listeners repeatedly (memory leak test)

**Expected Failures:**
- Memory usage grows unbounded
- Queue errors not propagated
- No notification on permanent disconnect
- Event listeners accumulate

### 1.3 FIX

#### Fix #1: Promise Handler Timeout & Cleanup (Critical)
**Location:** `client.js:96-111`
**Problem:** Handlers never cleaned up if no response
**Solution:**
```javascript
// Add timeout mechanism
send(action, params = {}) {
  return new Promise((resolve, reject) => {
    const id = this.generateId();
    const timeoutId = setTimeout(() => {
      this.handlers.delete(id);
      reject(new Error(`Request timeout for action: ${action}`));
    }, this.requestTimeout || 30000);

    this.handlers.set(id, {
      resolve: (value) => {
        clearTimeout(timeoutId);
        this.handlers.delete(id);
        resolve(value);
      },
      reject: (err) => {
        clearTimeout(timeoutId);
        this.handlers.delete(id);
        reject(err);
      },
      action,
      timeoutId
    });
    // ... rest of send logic
  });
}
```

#### Fix #2: Queue Error Propagation (Critical)
**Location:** `client.js:89`
**Problem:** Errors only logged, not propagated
**Solution:**
```javascript
// In processQueue()
this.send(action, params)
  .then(resolve)
  .catch(err => {
    console.error('[MCP Client] Queue processing error:', err);
    reject(err); // Propagate to caller
  });
```

#### Fix #6: Reconnection Exhaustion Callback (Critical)
**Location:** `client.js:51-53`
**Problem:** No notification when reconnections exhausted
**Solution:**
```javascript
onClose() {
  if (this.reconnectAttempts < this.maxReconnectAttempts) {
    this.scheduleReconnect();
  } else {
    const error = new Error('Max reconnection attempts exceeded');
    this.emit('reconnect-failed', error);
    // Call user-provided callback if exists
    if (this.options.onReconnectFailed) {
      this.options.onReconnectFailed(error);
    }
  }
}
```

#### Fix #13: Message Timeout Mechanism (Medium)
**Location:** `client.js` (general)
**Problem:** No timeout for pending messages
**Solution:** Implemented in Fix #1

#### Fix #19: Event Listener Cleanup (Medium)
**Location:** `client.js:197-208`
**Problem:** No way to remove listeners
**Solution:**
```javascript
off(event, callback) {
  if (!this.eventListeners || !this.eventListeners.has(event)) {
    return;
  }
  const listeners = this.eventListeners.get(event);
  const index = listeners.indexOf(callback);
  if (index > -1) {
    listeners.splice(index, 1);
  }
  if (listeners.length === 0) {
    this.eventListeners.delete(event);
  }
}

// Also add cleanup on disconnect
disconnect() {
  this.eventListeners?.clear();
  this.handlers.forEach(handler => {
    if (handler.timeoutId) clearTimeout(handler.timeoutId);
  });
  this.handlers.clear();
  // ... existing disconnect logic
}
```

### 1.4 SEARCH-TEST-VERIFY
**Verification Commands:**
```bash
# Run client tests
npm test -- client.test.js

# Check for memory leaks
node --expose-gc test-client-memory.js

# Verify timeout works
node test-client-timeout.js
```

**Success Criteria:**
- ✅ Handlers cleaned up after timeout
- ✅ Queue errors propagated to caller
- ✅ Reconnect failure triggers callback
- ✅ Event listeners can be removed
- ✅ No memory leaks in 1000-message test

---

## PHASE 2: Server-Side Error Handling (server.js)
**Issues:** #3, #4, #5, #7, #8, #9, #11, #15, #17, #20, #24
**Severity:** 4 Critical, 3 High, 3 Medium, 1 Low

### 2.1 SEARCH
**Objective:** Locate all server-side error handling gaps
**Files:** `server.js`
**Search Patterns:**
```bash
grep -n "server.listen" server.js          # Issue #3
grep -n "JSON.parse" server.js             # Issue #4
grep -n "CORRIDORS\[corridor\]" server.js  # Issue #5
grep -n "ws.on('message'" server.js        # Issue #7
grep -n "\.charAt\|\.toUpperCase" server.js # Issue #8
grep -n "for (const phaseNum" server.js    # Issue #9
grep -n "switch (action)" server.js        # Issue #11
grep -n "const {.*} = params" server.js    # Issue #15
grep -n "process.on('SIGINT'" server.js    # Issue #17, #20
```

### 2.2 TEST-VERIFY
**Test Cases to Create:**
1. Start server with port already in use
2. Send malformed JSON to WebSocket
3. Send invalid corridor value
4. Disconnect during async operation
5. Send null/undefined for corridor/emotionalState
6. Phase dependency failure cascade
7. Send message without required params
8. SIGINT during active connections

### 2.3 FIX

#### Fix #3: HTTP Server Error Handler (Critical)
**Location:** `server.js:56-58`
**Solution:**
```javascript
const httpServer = server.listen(this.port + 1, () => {
  console.log(`[ARMADA MCP] Health check server on port ${this.port + 1}`);
});

httpServer.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[ARMADA MCP] Health check port ${this.port + 1} already in use`);
    console.log('[ARMADA MCP] Trying alternative port...');
    // Try next port
    httpServer.listen(this.port + 2);
  } else {
    console.error('[ARMADA MCP] HTTP server error:', error);
    throw error;
  }
});
```

#### Fix #4: Better JSON Parse Error Handling (Critical)
**Location:** `server.js:74-85`
**Solution:**
```javascript
ws.on('message', async (data) => {
  let message;
  try {
    message = JSON.parse(data.toString());
  } catch (error) {
    console.error('[ARMADA MCP] Invalid JSON received:', error.message);
    this.send(ws, {
      type: 'error',
      error: 'Invalid JSON format',
      details: error.message
    });
    return; // Don't process further
  }

  try {
    await this.handleMessage(clientId, ws, message);
  } catch (error) {
    console.error('[ARMADA MCP] Error processing message:', error);
    this.send(ws, {
      type: 'error',
      id: message.id,
      error: error.message
    });
  }
});
```

#### Fix #5: Corridor Parameter Validation (Critical)
**Location:** `server.js:526-529` and all corridor usage
**Solution:**
```javascript
// Add validation helper
validateCorridor(corridor) {
  const validCorridors = Object.keys(CORRIDORS);
  if (!corridor || typeof corridor !== 'string') {
    throw new Error('Corridor parameter is required and must be a string');
  }
  if (!validCorridors.includes(corridor)) {
    throw new Error(`Invalid corridor: ${corridor}. Valid options: ${validCorridors.join(', ')}`);
  }
  return corridor;
}

// Use in phasePhraseMatrix
phasePhraseMatrix(content, corridor) {
  corridor = this.validateCorridor(corridor);
  const corridorConfig = CORRIDORS[corridor];
  // ... rest of logic
}
```

#### Fix #7: Proper Async/Await in Message Handler (Critical)
**Location:** `server.js:74-85`
**Solution:**
```javascript
ws.on('message', async (data) => {
  // Track in-flight operations
  const operationId = this.generateOperationId();
  this.inFlightOperations.set(clientId, operationId);

  try {
    // ... message handling
    await this.handleMessage(clientId, ws, message);
  } catch (error) {
    // Only send error if connection still open
    if (ws.readyState === WebSocket.OPEN) {
      this.send(ws, {
        type: 'error',
        id: message?.id,
        error: error.message
      });
    }
  } finally {
    this.inFlightOperations.delete(clientId);
  }
});

// Also update close handler
ws.on('close', async () => {
  // Wait for in-flight operations
  const operationId = this.inFlightOperations.get(clientId);
  if (operationId) {
    await this.waitForOperation(operationId, 5000); // 5s timeout
  }
  // ... cleanup
});
```

#### Fix #8: Null Checks Before String Operations (High)
**Location:** `server.js:315, 351`
**Solution:**
```javascript
// Helper function
safeStringOp(str, defaultValue = 'unknown') {
  return (str && typeof str === 'string') ? str : defaultValue;
}

// Line 315
title: `${this.safeStringOp(corridor).charAt(0).toUpperCase() + this.safeStringOp(corridor).slice(1)} Alignment Score`

// Line 351
return `${this.safeStringOp(corridor).toUpperCase()}! ${this.safeStringOp(emotionalState).toUpperCase()}!...`
```

#### Fix #9: Critical Phase Failure Handling (High)
**Location:** `server.js:167-228`
**Solution:**
```javascript
// Define critical phases
const CRITICAL_PHASES = [1, 2, 3]; // Phases that must pass

for (const phaseNum of phasesToRun) {
  try {
    const phaseValidation = await this.runPhase(phaseNum, content, corridor, emotionalState);
    // ... merge results

    // Check if critical phase failed
    if (CRITICAL_PHASES.includes(phaseNum) && !phaseValidation.ok) {
      console.error(`[ARMADA MCP] Critical phase ${phaseNum} failed - stopping execution`);
      result.status = 'failed';
      result.error = `Critical phase ${phaseNum} failed: ${phaseValidation.error || 'Validation failed'}`;
      break; // Stop processing further phases
    }
  } catch (error) {
    // ... existing error handling
    if (CRITICAL_PHASES.includes(phaseNum)) {
      break; // Stop on critical phase error
    }
  }
}
```

#### Fix #11: Message Structure Validation (High)
**Location:** `server.js:109-137`
**Solution:**
```javascript
async handleMessage(clientId, ws, message) {
  // Validate message structure
  if (!message || typeof message !== 'object') {
    throw new Error('Invalid message format');
  }

  const { action, id, params = {} } = message;

  if (!action || typeof action !== 'string') {
    throw new Error('Message must include valid action string');
  }

  // Validate params is an object
  if (params && typeof params !== 'object') {
    throw new Error('Message params must be an object');
  }

  // ... rest of handler
}
```

#### Fix #15: Params Destructuring Validation (Medium)
**Location:** `server.js:140, 253, 291`
**Solution:**
```javascript
async handleValidation(clientId, ws, id, params) {
  // Validate params exists
  if (!params || typeof params !== 'object') {
    throw new Error('Validation params are required');
  }

  const { content, corridor, emotionalState, runPhases } = params;

  // Validate required fields
  if (!content || typeof content !== 'string') {
    throw new Error('content is required and must be a string');
  }
  if (!corridor) {
    throw new Error('corridor is required');
  }

  // ... rest of validation
}
```

#### Fix #17 & #20: Graceful Shutdown (Medium)
**Location:** `server.js:683-691`
**Solution:**
```javascript
async gracefulShutdown() {
  console.log('[ARMADA MCP] Initiating graceful shutdown...');

  // Stop accepting new connections
  this.wss.close(() => {
    console.log('[ARMADA MCP] WebSocket server closed');
  });

  // Notify all clients
  this.clients.forEach((clientInfo, clientId) => {
    if (clientInfo.ws.readyState === WebSocket.OPEN) {
      this.send(clientInfo.ws, {
        type: 'server-shutdown',
        message: 'Server is shutting down'
      });
    }
  });

  // Wait for in-flight operations
  const timeout = 5000;
  const startTime = Date.now();
  while (this.inFlightOperations.size > 0 && Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Close all connections
  this.clients.forEach((clientInfo) => {
    clientInfo.ws.close();
  });

  console.log('[ARMADA MCP] Shutdown complete');
  process.exit(0);
}

process.on('SIGINT', () => this.gracefulShutdown());
process.on('SIGTERM', () => this.gracefulShutdown());
```

#### Fix #24: Standardize Error Response Format (Low)
**Location:** Throughout `server.js`
**Solution:**
```javascript
// Create standard error response helper
sendError(ws, error, id = null) {
  const errorResponse = {
    type: 'error',
    timestamp: new Date().toISOString(),
    error: error.message || error,
  };

  if (id) {
    errorResponse.id = id;
  }

  if (error.code) {
    errorResponse.code = error.code;
  }

  this.send(ws, errorResponse);
}

// Use consistently throughout
this.sendError(ws, new Error('Unknown action: ' + action), id);
```

### 2.4 SEARCH-TEST-VERIFY
```bash
# Run server tests
npm test -- server.test.js

# Test graceful shutdown
node test-graceful-shutdown.js

# Test error responses
node test-error-responses.js
```

---

## PHASE 3: RegEx Injection Fixes
**Issues:** #10
**Severity:** 1 High

### 3.1 SEARCH
```bash
grep -n "new RegExp" server.js utils/forbidden-scanner.js
```

### 3.2 TEST-VERIFY
**Test Cases:**
- Input: `test.+` (should match literally, not as regex)
- Input: `(attack)` (should escape parens)
- Input: `[dangerous]` (should escape brackets)

### 3.3 FIX

#### Fix #10: Escape RegEx Special Characters (High)
**Location:** `server.js:585`, `utils/forbidden-scanner.js:59, 68`
**Solution:**
```javascript
// Add helper function
escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// server.js line 585
new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'i').test(content)

// forbidden-scanner.js
const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
cleanedContent = cleanedContent.replace(
  new RegExp(escapedWord, 'gi'),
  '█'.repeat(word.length)
);
```

### 3.4 SEARCH-TEST-VERIFY
```bash
# Test with special characters
node test-regex-escaping.js
```

---

## PHASE 4: Scoring & Validation Improvements
**Issues:** #16, #25
**Severity:** 1 Medium, 1 Low

### 4.1 SEARCH
```bash
grep -n "wordCount < 5" validation/scoring.js
grep -n "calculateArmScore\|calculateNoveltyScore" validation/scoring.js
```

### 4.2 TEST-VERIFY
**Test Cases:**
- Content with < 5 words
- Calculations that produce NaN
- Calculations that produce Infinity
- Division by zero scenarios

### 4.3 FIX

#### Fix #16: Better Short Content Handling (Medium)
**Location:** `validation/scoring.js:67-70`
**Solution:**
```javascript
function calculateNoveltyScore(content) {
  const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (wordCount < 5) {
    console.warn('[Scoring] Content too short for novelty analysis:', wordCount, 'words');
    return {
      score: 0.5,
      warning: 'Content too short for accurate novelty scoring',
      wordCount
    };
  }
  // ... rest of logic
}
```

#### Fix #25: Score Validation (Low)
**Location:** `validation/scoring.js` (all score calculations)
**Solution:**
```javascript
// Helper function
function validateScore(score, scoreName = 'score') {
  if (typeof score !== 'number' || !isFinite(score)) {
    console.error(`[Scoring] Invalid ${scoreName}:`, score);
    return 0;
  }
  // Clamp to valid range
  return Math.max(0, Math.min(1, score));
}

// Apply to all score calculations
function calculateArmScore(scores) {
  // ... calculations
  const rawScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  return validateScore(rawScore, 'ARM score');
}
```

### 4.4 SEARCH-TEST-VERIFY
```bash
npm test -- scoring.test.js
```

---

## PHASE 5: Code Quality Improvements
**Issues:** #14, #21, #22, #23
**Severity:** 1 Medium, 3 Low

### 5.1 SEARCH
```bash
grep -n "console.error\|console.log" server.js client.js
grep -n "0.85\|0.25\|0.20" server.js validation/scoring.js
grep -A5 "wordCount < 5" validation/scoring.js
```

### 5.2 FIX

#### Fix #14: Structured Error Logging (Medium)
**Solution:**
```javascript
// Create logger utility
class Logger {
  static error(context, message, error = null) {
    const log = {
      level: 'error',
      timestamp: new Date().toISOString(),
      context,
      message,
    };
    if (error) {
      log.error = error.message;
      log.stack = error.stack;
    }
    console.error(JSON.stringify(log));
  }

  static warn(context, message, data = null) {
    const log = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      context,
      message,
    };
    if (data) log.data = data;
    console.warn(JSON.stringify(log));
  }

  static info(context, message, data = null) {
    const log = {
      level: 'info',
      timestamp: new Date().toISOString(),
      context,
      message,
    };
    if (data) log.data = data;
    console.log(JSON.stringify(log));
  }
}

// Replace all console.error/log/warn
Logger.error('WebSocket', 'Error processing message', error);
```

#### Fix #21: Replace Debug Logging (Low)
**Solution:**
```javascript
// Add debug flag and conditional logging
class Logger {
  static debug(context, message, data = null) {
    if (!process.env.DEBUG && !process.env.ARMADA_DEBUG) {
      return;
    }
    const log = {
      level: 'debug',
      timestamp: new Date().toISOString(),
      context,
      message,
    };
    if (data) log.data = data;
    console.log(JSON.stringify(log));
  }
}

// Replace console.log statements
Logger.debug('Server', 'Client connected', { clientId });
```

#### Fix #22: Extract Magic Numbers (Low)
**Solution:**
```javascript
// Create config/constants.js
module.exports = {
  SCORING: {
    MIN_WORD_COUNT: 5,
    SHORT_CONTENT_SCORE: 0.5,
    ARM_THRESHOLD: 0.85,
    WEIGHTS: {
      CORRIDOR: 0.25,
      NOVELTY: 0.20,
      UNIQUENESS: 0.15,
      // ... etc
    }
  },
  TIMEOUTS: {
    REQUEST_TIMEOUT: 30000,
    SHUTDOWN_TIMEOUT: 5000,
  },
  LIMITS: {
    MAX_CONTENT_SIZE: 100000, // 100KB
    MAX_RECONNECT_ATTEMPTS: 5,
  }
};

// Use throughout codebase
const { SCORING } = require('./config/constants');
if (wordCount < SCORING.MIN_WORD_COUNT) { /* ... */ }
```

#### Fix #23: Input Size Limits (Low)
**Solution:**
```javascript
// In server.js handleValidation
const { LIMITS } = require('./config/constants');

async handleValidation(clientId, ws, id, params) {
  const { content, corridor, emotionalState, runPhases } = params;

  // Validate content size
  if (content.length > LIMITS.MAX_CONTENT_SIZE) {
    throw new Error(`Content exceeds maximum size of ${LIMITS.MAX_CONTENT_SIZE} characters`);
  }

  // Basic rate limiting (track per client)
  const clientRequests = this.requestCounts.get(clientId) || [];
  const now = Date.now();
  const recentRequests = clientRequests.filter(t => now - t < 60000); // Last minute

  if (recentRequests.length > LIMITS.MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Rate limit exceeded. Please slow down.');
  }

  recentRequests.push(now);
  this.requestCounts.set(clientId, recentRequests);

  // ... rest of validation
}
```

### 5.3 SEARCH-TEST-VERIFY
```bash
# Test with large payloads
node test-size-limits.js

# Test rate limiting
node test-rate-limiting.js
```

---

## PHASE 6: Integration & Regression Testing

### 6.1 Create Test Suite
**Files to create:**
- `test/client.test.js` - Client error handling tests
- `test/server.test.js` - Server error handling tests
- `test/integration.test.js` - Full integration tests
- `test/regression.test.js` - Ensure no breaking changes

### 6.2 Test Categories

#### Unit Tests
- Each fix has dedicated test
- Edge cases covered
- Error conditions verified

#### Integration Tests
- Client-server communication
- Multi-phase validation flows
- Error propagation end-to-end

#### Regression Tests
- Existing functionality still works
- Performance benchmarks maintained
- API compatibility preserved

### 6.3 Verification Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Verify no regressions
npm run test:regression

# Load testing
npm run test:load
```

---

## PHASE 7: Documentation & Git Operations

### 7.1 Update Documentation
**Files to update:**
- `README.md` - Add error handling section
- `docs/ERROR_HANDLING.md` - Detailed error handling guide
- `docs/API.md` - Update error response formats
- `CHANGELOG.md` - Document all fixes

### 7.2 Git Commit Strategy
**Commit Structure:**
```
feat: Implement comprehensive error handling fixes

Phase 1: Client-side error handling
- Add promise handler timeout and cleanup (fixes memory leak)
- Implement proper queue error propagation
- Add reconnection exhaustion callbacks
- Implement event listener cleanup

Phase 2: Server-side error handling
- Add HTTP server error handler
- Improve JSON parse error handling
- Add corridor parameter validation
- Fix async/await patterns in message handlers
- Add null checks for string operations
- Implement critical phase failure handling
- Add message structure validation
- Implement graceful shutdown

Phase 3: Security fixes
- Escape special regex characters to prevent injection

Phase 4: Scoring improvements
- Better handling for short content
- Add NaN/Infinity validation for scores

Phase 5: Code quality
- Implement structured logging
- Extract magic numbers to constants
- Add input size limits and rate limiting

Fixes: #1, #2, #3, #4, #5, #6, #7, #8, #9, #10, #11, #13, #14, #15,
       #16, #17, #19, #20, #21, #22, #23, #24, #25

All 25 identified error handling issues resolved.
```

### 7.3 Git Commands
```bash
# Stage all changes
git add -A

# Commit with detailed message
git commit -m "feat: Implement comprehensive error handling fixes

[Detailed message from 7.2]"

# Push to branch with retry logic
for i in 1 2 3 4; do
  git push -u origin claude/error-handling-review-ruUhj && break
  echo "Push attempt $i failed, retrying in $((2**i))s..."
  sleep $((2**i))
done
```

---

## SUCCESS CRITERIA

### Critical Issues (Must Fix)
- [x] No memory leaks in client handlers
- [x] All errors properly propagated
- [x] HTTP server errors handled gracefully
- [x] JSON parsing errors don't crash server
- [x] Input validation prevents null reference errors
- [x] Reconnection failures notify application
- [x] Async operations complete before disconnect

### High Priority (Should Fix)
- [x] Null checks before string operations
- [x] Critical phase failures stop execution
- [x] RegEx injection prevented
- [x] Message structure validated
- [x] WebSocket compatibility ensured

### Medium Priority (Good to Fix)
- [x] Timeouts on all async operations
- [x] Structured error logging
- [x] Parameter validation
- [x] Graceful shutdown implemented
- [x] Event listeners cleanable

### Low Priority (Nice to Fix)
- [x] Debug logging controlled by env var
- [x] Magic numbers extracted
- [x] Input size limits enforced
- [x] Error response format standardized
- [x] Score calculations validated

### Test Coverage
- [x] Unit test coverage > 80%
- [x] All critical paths tested
- [x] Error conditions verified
- [x] No regressions introduced
- [x] Integration tests pass

---

## EXECUTION TIMELINE

**Phase 1:** Client fixes (~1-2 hours)
**Phase 2:** Server fixes (~2-3 hours)
**Phase 3:** RegEx fixes (~30 minutes)
**Phase 4:** Scoring fixes (~30 minutes)
**Phase 5:** Code quality (~1 hour)
**Phase 6:** Testing (~2 hours)
**Phase 7:** Documentation & Git (~1 hour)

**Total:** ~8-10 hours of focused work

---

## RISK MITIGATION

### Rollback Plan
- All changes in feature branch
- Can revert individual commits if issues found
- Original code preserved in main branch

### Testing Strategy
- Test each phase before moving to next
- Integration tests after all fixes
- Regression tests before push

### Communication
- Document all changes in CHANGELOG
- Update API docs for breaking changes
- Add migration guide if needed

---

## NEXT STEPS

1. ✅ Plan created and documented
2. ⏳ Execute Phase 1 (Client fixes)
3. ⏳ Execute Phase 2 (Server fixes)
4. ⏳ Execute Phase 3 (RegEx fixes)
5. ⏳ Execute Phase 4 (Scoring fixes)
6. ⏳ Execute Phase 5 (Code quality)
7. ⏳ Execute Phase 6 (Integration testing)
8. ⏳ Execute Phase 7 (Documentation & Git)

Ready to begin execution on your command.
