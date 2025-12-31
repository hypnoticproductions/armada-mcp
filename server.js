// mcp-tool/server.js - ARMADA Model Context Protocol Validation Server
// This server handles all validation phases via WebSocket connections

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Phase validators
const PHASES = require('./validation/phases');

// Corridor configurations
const CORRIDORS = require('./corridors/config');

// Scoring engine
const { calculateArmScore, calculateCorridorScore, calculateNoveltyScore } = require('./validation/scoring');

// Forbidden scanner
const ForbiddenScanner = require('./utils/forbidden-scanner');

class MCPServer {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.inFlightOperations = new Map(); // Track async operations
    this.requestCounts = new Map(); // For rate limiting
    this.port = parseInt(process.env.MCP_PORT || process.env.PORT || 8080, 10);
    this.forbiddenScanner = new ForbiddenScanner();
    this.httpServer = null; // Store HTTP server reference
  }

  /**
   * Validate corridor parameter
   */
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

  /**
   * Safe string operation helper
   */
  safeStringOp(str, defaultValue = 'unknown') {
    return (str && typeof str === 'string') ? str : defaultValue;
  }

  /**
   * Send standardized error response
   */
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

  start() {
    console.log(`[ARMADA MCP] Server starting on port ${this.port}`);
    console.log(`[ARMADA MCP] Environment: ${process.env.NODE_ENV || 'development'}`);

    // Create HTTP server for health checks and WebSocket upgrades
    const http = require('http');
    this.httpServer = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', uptime: process.uptime() }));
      } else if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          name: 'ARMADA MCP Server',
          version: '1.0.0',
          status: 'running',
          endpoints: ['/health', '/ws']
        }));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    // Attach WebSocket server to HTTP server
    this.wss = new WebSocket.Server({ server: this.httpServer });

    // Add error handler for HTTP server
    this.httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[ARMADA MCP] Port ${this.port} already in use`);
        console.log('[ARMADA MCP] Trying alternative port...');
        // Try next port
        setTimeout(() => {
          this.port = this.port + 1;
          this.httpServer.listen(this.port);
        }, 1000);
      } else {
        console.error('[ARMADA MCP] HTTP server error:', error);
        throw error;
      }
    });

    this.httpServer.listen(this.port, () => {
      console.log(`[ARMADA MCP] Server listening on port ${this.port}`);
      console.log(`[ARMADA MCP] WebSocket endpoint: ws://localhost:${this.port}`);
      console.log(`[ARMADA MCP] Health check endpoint: http://localhost:${this.port}/health`);
    });

    this.wss.on('connection', (ws, req) => {
      const clientId = uuidv4();
      console.log(`[ARMADA MCP] Client connected: ${clientId}`);

      this.clients.set(clientId, { ws, connectedAt: new Date() });

      // Send welcome message
      this.send(ws, {
        type: 'connected',
        clientId,
        message: 'ARMADA MCP Server ready'
      });

      // Handle incoming messages
      ws.on('message', async (data) => {
        const operationId = uuidv4();
        let message;

        // Parse JSON with proper error handling
        try {
          message = JSON.parse(data.toString());
        } catch (error) {
          console.error('[ARMADA MCP] Invalid JSON received:', error.message);
          this.sendError(ws, { message: 'Invalid JSON format', code: 'PARSE_ERROR' });
          return; // Don't process further
        }

        // Track in-flight operation
        this.inFlightOperations.set(operationId, { clientId, startTime: Date.now() });

        try {
          await this.handleMessage(clientId, ws, message);
        } catch (error) {
          console.error('[ARMADA MCP] Error processing message:', error);
          // Only send error if connection still open
          if (ws.readyState === WebSocket.OPEN) {
            this.sendError(ws, error, message?.id);
          }
        } finally {
          // Clean up operation tracking
          this.inFlightOperations.delete(operationId);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log(`[ARMADA MCP] Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`[ARMADA MCP] Client error ${clientId}:`, error.message);
        this.clients.delete(clientId);
      });
    });

    console.log(`[ARMADA MCP] Server ready and listening`);
    console.log(`[ARMADA MCP] WebSocket endpoint: ws://localhost:${this.port}`);
  }

  async handleMessage(clientId, ws, message) {
    // Validate message structure
    if (!message || typeof message !== 'object') {
      throw new Error('Invalid message format: message must be an object');
    }

    const { action, id, params = {} } = message;

    // Validate action
    if (!action || typeof action !== 'string') {
      throw new Error('Message must include valid action string');
    }

    // Validate params is an object (if provided)
    if (params && typeof params !== 'object') {
      throw new Error('Message params must be an object');
    }

    console.log(`[ARMADA MCP] Received ${action} from ${clientId}`);

    switch (action) {
      case 'validate':
        await this.handleValidation(clientId, ws, id, params);
        break;

      case 'validateLine':
        await this.handleLineValidation(clientId, ws, id, params);
        break;

      case 'generateSong':
        await this.handleSongGeneration(clientId, ws, id, params);
        break;

      case 'getCorridors':
        this.handleGetCorridors(ws, id);
        break;

      case 'ping':
        this.send(ws, { type: 'pong', id });
        break;

      default:
        this.sendError(ws, new Error(`Unknown action: ${action}`), id);
    }
  }

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

    // Input size limit (100KB)
    const MAX_CONTENT_SIZE = 100000;
    if (content.length > MAX_CONTENT_SIZE) {
      throw new Error(`Content exceeds maximum size of ${MAX_CONTENT_SIZE} characters`);
    }

    // Rate limiting (10 requests per minute per client)
    const MAX_REQUESTS_PER_MINUTE = 10;
    const clientRequests = this.requestCounts.get(clientId) || [];
    const now = Date.now();
    const recentRequests = clientRequests.filter(t => now - t < 60000); // Last minute

    if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
      throw new Error('Rate limit exceeded. Please slow down.');
    }

    recentRequests.push(now);
    this.requestCounts.set(clientId, recentRequests);

    // Validate corridor if provided
    if (corridor) {
      this.validateCorridor(corridor);
    }

    console.log(`[ARMADA MCP] Starting validation: corridor=${corridor}, phases=${runPhases?.length || 'all'}`);

    const result = {
      line: content,
      original: content,
      scores: {
        arm: 0,
        corridor: 0,
        novelty: 0,
        economic: 0,
        mythos: 0,
        shadow: 0,
        continental: 0
      },
      flags: [],
      phaseResults: [],
      validationId: uuidv4()
    };

    // Determine phases to run
    const phasesToRun = runPhases && runPhases.length > 0 
      ? runPhases 
      : [1, 2, 3, 4, 5, 6, 7, 8, 23, 24, 25, 26, 27]; // Key phases

    // Run each phase
    for (const phaseNum of phasesToRun) {
      const startTime = Date.now();
      const phaseConfig = PHASES.find(p => p.id === phaseNum);

      // Send phase started
      this.send(ws, {
        type: 'phaseStarted',
        id,
        phase: phaseNum,
        phaseName: phaseConfig?.name || `Phase ${phaseNum}`
      });

      const phaseResult = {
        phase: phaseNum,
        name: phaseConfig?.name || `Phase ${phaseNum}`,
        status: 'running',
        duration: 0
      };

      try {
        // Run the phase validation
        const phaseValidation = await this.runPhase(phaseNum, content, corridor, emotionalState);

        // Update results
        if (phaseValidation.line && phaseValidation.line !== content) {
          result.line = phaseValidation.line;
        }

        // Merge scores
        if (phaseValidation.scores) {
          Object.assign(result.scores, phaseValidation.scores);
        }

        // Add flags
        if (phaseValidation.flags && phaseValidation.flags.length > 0) {
          result.flags.push(...phaseValidation.flags.map(f => ({
            ...f,
            phase: phaseNum
          })));
        }

        phaseResult.status = phaseValidation.ok ? 'passed' : 'failed';
        phaseResult.score = phaseValidation.score;
        phaseResult.modifications = phaseValidation.modifications;

        // Check if critical phase failed - stop execution
        if (phaseConfig?.critical && !phaseValidation.ok) {
          console.error(`[ARMADA MCP] Critical phase ${phaseNum} failed - stopping execution`);
          result.status = 'failed';
          result.error = `Critical phase ${phaseNum} (${phaseConfig.name}) failed: ${phaseValidation.error || 'Validation failed'}`;

          phaseResult.duration = Date.now() - startTime;
          result.phaseResults.push(phaseResult);

          // Send phase completed before stopping
          this.send(ws, {
            type: 'phaseCompleted',
            id,
            phase: phaseNum,
            result: phaseResult
          });

          break; // Stop processing further phases
        }

      } catch (error) {
        phaseResult.status = 'failed';
        phaseResult.error = error.message;
        console.error(`[ARMADA MCP] Phase ${phaseNum} error:`, error);

        // If critical phase throws error, stop execution
        if (phaseConfig?.critical) {
          result.status = 'failed';
          result.error = `Critical phase ${phaseNum} error: ${error.message}`;

          phaseResult.duration = Date.now() - startTime;
          result.phaseResults.push(phaseResult);

          // Send phase completed before stopping
          this.send(ws, {
            type: 'phaseCompleted',
            id,
            phase: phaseNum,
            result: phaseResult
          });

          break; // Stop on critical phase error
        }
      }

      phaseResult.duration = Date.now() - startTime;
      result.phaseResults.push(phaseResult);

      // Send phase completed
      this.send(ws, {
        type: 'phaseCompleted',
        id,
        phase: phaseNum,
        result: phaseResult
      });
    }

    // Calculate overall ARM score
    result.scores.arm = calculateArmScore(result.scores);

    // Determine overall validity
    const criticalPhasesFailed = result.phaseResults
      .filter(pr => {
        const config = PHASES.find(p => p.id === pr.phase);
        return config?.critical && pr.status === 'failed';
      }).length;

    result.isValid = criticalPhasesFailed === 0 && result.scores.arm >= 0.85;

    console.log(`[ARMADA MCP] Validation complete: armScore=${result.scores.arm.toFixed(2)}, valid=${result.isValid}`);

    // Send final result
    this.send(ws, {
      type: 'validationComplete',
      id,
      result
    });
  }

  async handleLineValidation(clientId, ws, id, params) {
    const { line, corridor } = params;

    console.log(`[ARMADA MCP] Validating line: corridor=${corridor}`);

    try {
      // Run forbidden scanner
      const scanResult = this.forbiddenScanner.scan(line, corridor);

      // Calculate corridor score
      const corridorScore = calculateCorridorScore(line, corridor);

      // Calculate novelty score
      const noveltyScore = calculateNoveltyScore(line);

      this.send(ws, {
        type: 'lineValidationComplete',
        id,
        result: {
          line,
          scores: {
            corridor: corridorScore,
            novelty: noveltyScore
          },
          flags: scanResult.flags,
          suggestions: scanResult.suggestions
        }
      });

    } catch (error) {
      this.send(ws, {
        type: 'error',
        id,
        error: error.message
      });
    }
  }

  async handleSongGeneration(clientId, ws, id, params) {
    const { prompt, corridor, emotionalState, bpm, genre } = params;

    console.log(`[ARMADA MCP] Generating song: corridor=${corridor}, emotion=${emotionalState}`);

    // This would integrate with Claude API
    // For now, we'll simulate the generation
    this.send(ws, {
      type: 'songGenerationStarted',
      id,
      message: 'Song generation started'
    });

    // Simulate song structure
    const songStructure = this.generateSongStructure(corridor, emotionalState, bpm);

    this.send(ws, {
      type: 'songGenerationComplete',
      id,
      song: songStructure
    });
  }

  generateSongStructure(corridor, emotionalState, bpm) {
    const safeCorridor = this.safeStringOp(corridor);
    const safeEmotionalState = this.safeStringOp(emotionalState);

    return {
      title: `${safeCorridor.charAt(0).toUpperCase() + safeCorridor.slice(1)} ${safeEmotionalState.charAt(0).toUpperCase() + safeEmotionalState.slice(1)}`,
      sections: [
        {
          type: 'intro',
          lyrics: `[${corridor} ${emotionalState} intro - ${bpm} BPM]`,
          delivery: 'atmospheric',
          armScore: 0.82
        },
        {
          type: 'verse',
          lyrics: `Verse 1: ${this.generateVerseLyrics(corridor, emotionalState)}`,
          delivery: 'narrative',
          armScore: 0.87
        },
        {
          type: 'chorus',
          lyrics: `Chorus: ${this.generateChorusLyrics(corridor, emotionalState)}`,
          delivery: 'powerful',
          armScore: 0.89
        }
      ],
      metadata: {
        bpm,
        genre: genre || 'auto-detected',
        corridor,
        emotionalState,
        generatedAt: new Date().toISOString()
      }
    };
  }

  generateVerseLyrics(corridor, emotionalState) {
    return `In the streets of ${corridor}, we rise with ${emotionalState} energy\nCultural heritage flowing through every word we say`;
  }

  generateChorusLyrics(corridor, emotionalState) {
    return `${corridor.toUpperCase()}! ${emotionalState.toUpperCase()}!\nWe stand together, culture unbroken`;
  }

  handleGetCorridors(ws, id) {
    this.send(ws, {
      type: 'corridors',
      id,
      corridors: Object.keys(CORRIDORS)
    });
  }

  async runPhase(phaseNum, content, corridor, emotionalState) {
    const phaseConfig = PHASES.find(p => p.id === phaseNum);

    if (!phaseConfig) {
      return {
        ok: true,
        score: 1.0,
        line: content,
        scores: {},
        flags: []
      };
    }

    // Phase-specific validation
    switch (phaseNum) {
      case 1: // Novelty Check
        return this.phaseNoveltyCheck(content);
      
      case 2: // Forbidden Scanner
        return this.phaseForbiddenScanner(content, corridor);
      
      case 3: // Corridor Validator
        return this.phaseCorridorValidator(content, corridor);
      
      case 4: // Mutation Detector
        return this.phaseMutationDetector(content);
      
      case 5: // Emotional Scorer
        return this.phaseEmotionalScorer(content, emotionalState);
      
      case 6: // Phrase Matrix
        return this.phasePhraseMatrix(content, corridor);
      
      case 7: // Governance Check
        return this.phaseGovernanceCheck(content);
      
      case 8: // Strict Enforcer
        return this.phaseStrictEnforcer(content, corridor);
      
      case 23: // Shadow Mode
        return this.phaseShadowMode(content);
      
      case 24: // Economic Engine
        return this.phaseEconomicEngine(content);
      
      case 25: // Legion Engine
        return this.phaseLegionEngine(content, corridor);
      
      case 26: // Sphere Engine
        return this.phaseSphereEngine(content);
      
      case 27: // Continental Engine
        return this.phaseContinentalEngine(content, corridor);
      
      default:
        return {
          ok: true,
          score: 1.0,
          line: content,
          scores: {},
          flags: []
        };
    }
  }

  phaseNoveltyCheck(content) {
    const novelty = calculateNoveltyScore(content);
    const ok = novelty >= 0.7;

    return {
      ok,
      score: novelty,
      line: content,
      scores: { novelty },
      flags: ok ? [] : [{
        severity: 'medium',
        type: 'novelty',
        message: 'Content may lack sufficient originality'
      }]
    };
  }

  phaseForbiddenScanner(content, corridor) {
    const result = this.forbiddenScanner.scan(content, corridor);
    const ok = result.flags.filter(f => f.severity === 'critical').length === 0;

    return {
      ok,
      score: ok ? 1.0 : 0.5,
      line: result.cleanedContent || content,
      scores: {},
      flags: result.flags
    };
  }

  phaseCorridorValidator(content, corridor) {
    const score = calculateCorridorScore(content, corridor);
    const ok = score >= 0.8;

    return {
      ok,
      score,
      line: content,
      scores: { corridor: score },
      flags: ok ? [] : [{
        severity: 'high',
        type: 'corridor',
        message: `Content may not authentically represent ${corridor} corridor`
      }]
    };
  }

  phaseMutationDetector(content) {
    // Check for pattern mutations (repetitive structures)
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const mutationScore = uniqueWords.size / words.length;
    const ok = mutationScore >= 0.3;

    return {
      ok,
      score: mutationScore,
      line: content,
      scores: { shadow: mutationScore },
      flags: ok ? [] : [{
        severity: 'medium',
        type: 'mutation',
        message: 'High word repetition detected - possible pattern mutation'
      }]
    };
  }

  phaseEmotionalScorer(content, emotionalState) {
    // Simplified emotional scoring
    const emotionalKeywords = {
      hype: ['fire', 'energy', 'power', 'rise', 'dominate'],
      swagger: ['king', 'boss', 'top', 'best', 'legend'],
      grief: ['lost', 'tears', 'pain', 'miss', 'gone'],
      romantic: ['love', 'heart', 'baby', 'kiss', 'together'],
      rage: ['fight', 'war', 'destroy', 'hate', 'anger'],
      defiance: ['stand', 'rise', 'unbreakable', 'resist', 'fight'],
      spiritual: ['god', 'faith', 'pray', 'soul', 'divine'],
      joy: ['happy', 'celebrate', 'dance', 'smile', 'light']
    };

    const keywords = emotionalKeywords[emotionalState] || emotionalKeywords.hype;
    const foundKeywords = keywords.filter(kw => content.toLowerCase().includes(kw));
    const score = foundKeywords.length / keywords.length;
    const ok = score >= 0.3;

    return {
      ok,
      score,
      line: content,
      scores: { mythos: score },
      flags: ok ? [] : [{
        severity: 'low',
        type: 'emotional',
        message: `Content may not align with ${emotionalState} emotional state`
      }]
    };
  }

  phasePhraseMatrix(content, corridor) {
    // Validate corridor parameter
    try {
      this.validateCorridor(corridor);
    } catch (error) {
      return {
        ok: false,
        score: 0,
        line: content,
        scores: {},
        flags: [{
          severity: 'error',
          type: 'validation',
          message: error.message
        }]
      };
    }

    // Check for corridor-specific phrase usage
    const corridorConfig = CORRIDORS[corridor];

    const keyPhrases = corridorConfig.keyPhrases || [];
    const foundPhrases = keyPhrases.filter(phrase => 
      content.toLowerCase().includes(phrase.toLowerCase())
    );
    const score = keyPhrases.length > 0 ? foundPhrases.length / keyPhrases.length : 1.0;
    const ok = score >= 0.2;

    return {
      ok,
      score,
      line: content,
      scores: { continental: score },
      flags: ok ? [] : [{
        severity: 'medium',
        type: 'corridor',
        message: `Low usage of ${corridor} key phrases`
      }]
    };
  }

  phaseGovernanceCheck(content) {
    // Basic governance compliance
    const sensitivePatterns = [
      /\b(terrorist|massacre|genocide)\b/i,
      /\b(child.*abuse|pedophile)\b/i,
      /\b(weapon.*manufacture|explosive.*recipe)\b/i
    ];

    const flags = [];
    for (const pattern of sensitivePatterns) {
      if (pattern.test(content)) {
        flags.push({
          severity: 'critical',
          type: 'governance',
          message: 'Content violates governance policies'
        });
      }
    }

    return {
      ok: flags.length === 0,
      score: flags.length === 0 ? 1.0 : 0.0,
      line: content,
      scores: {},
      flags
    };
  }

  phaseStrictEnforcer(content, corridor) {
    // Validate corridor parameter
    try {
      this.validateCorridor(corridor);
    } catch (error) {
      return {
        ok: false,
        score: 0,
        line: content,
        scores: {},
        flags: [{
          severity: 'error',
          type: 'validation',
          message: error.message
        }]
      };
    }

    // Strict mode validation
    const corridorConfig = CORRIDORS[corridor];
    const forbiddenWords = corridorConfig?.forbiddenWords || [];

    // Escape special regex characters to prevent injection
    const foundForbidden = forbiddenWords.filter(word => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escapedWord}\\b`, 'i').test(content);
    });

    return {
      ok: foundForbidden.length === 0,
      score: foundForbidden.length === 0 ? 1.0 : 0.3,
      line: content,
      scores: {},
      flags: foundForbidden.length > 0 ? [{
        severity: 'high',
        type: 'forbidden',
        message: `Forbidden words for ${corridor}: ${foundForbidden.join(', ')}`
      }] : []
    };
  }

  phaseShadowMode(content) {
    // Anti-detection pattern analysis
    const hasShadowPatterns = /\b(lorem ipsum|test content|dummy text)\b/i.test(content);
    
    return {
      ok: !hasShadowPatterns,
      score: hasShadowPatterns ? 0.1 : 0.95,
      line: content,
      scores: { shadow: hasShadowPatterns ? 0.1 : 0.95 },
      flags: hasShadowPatterns ? [{
        severity: 'medium',
        type: 'mutation',
        message: 'Shadow/placeholder content detected'
      }] : []
    };
  }

  phaseEconomicEngine(content) {
    // Revenue optimization potential (simplified)
    const engagementKeywords = ['viral', 'trending', 'hit', 'banger', 'classic'];
    const found = engagementKeywords.filter(kw => 
      content.toLowerCase().includes(kw)
    );
    const score = found.length / engagementKeywords.length;

    return {
      ok: true,
      score: Math.max(score, 0.5),
      line: content,
      scores: { economic: score },
      flags: []
    };
  }

  phaseLegionEngine(content, corridor) {
    // Multi-persona consistency check
    const hasMultiplePerspectives = /["']([^"']+)["']/.test(content);
    
    return {
      ok: true,
      score: hasMultiplePerspectives ? 0.85 : 0.7,
      line: content,
      scores: { mythos: hasMultiplePerspectives ? 0.85 : 0.7 },
      flags: []
    };
  }

  phaseSphereEngine(content) {
    // Temporal alignment
    const hasTimeReference = /\b(today|tonight|yesterday|forever|always)\b/i.test(content);
    
    return {
      ok: true,
      score: hasTimeReference ? 0.9 : 0.7,
      line: content,
      scores: {},
      flags: []
    };
  }

  phaseContinentalEngine(content, corridor) {
    return this.phaseCorridorValidator(content, corridor);
  }

  send(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcast(data) {
    this.wss.clients.forEach(client => {
      this.send(client, data);
    });
  }

  async gracefulShutdown() {
    console.log('[ARMADA MCP] Initiating graceful shutdown...');

    // Stop accepting new connections
    if (this.wss) {
      this.wss.close(() => {
        console.log('[ARMADA MCP] WebSocket server closed');
      });
    }

    // Notify all clients about shutdown
    this.clients.forEach((clientInfo, clientId) => {
      if (clientInfo.ws.readyState === WebSocket.OPEN) {
        this.send(clientInfo.ws, {
          type: 'server-shutdown',
          message: 'Server is shutting down gracefully'
        });
      }
    });

    // Wait for in-flight operations to complete (max 5 seconds)
    const timeout = 5000;
    const startTime = Date.now();
    while (this.inFlightOperations.size > 0 && Date.now() - startTime < timeout) {
      console.log(`[ARMADA MCP] Waiting for ${this.inFlightOperations.size} operations to complete...`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (this.inFlightOperations.size > 0) {
      console.warn(`[ARMADA MCP] ${this.inFlightOperations.size} operations did not complete within timeout`);
    }

    // Close all client connections
    this.clients.forEach((clientInfo) => {
      if (clientInfo.ws.readyState === WebSocket.OPEN) {
        clientInfo.ws.close();
      }
    });
    this.clients.clear();

    // Close HTTP server
    if (this.httpServer) {
      this.httpServer.close(() => {
        console.log('[ARMADA MCP] HTTP server closed');
      });
    }

    console.log('[ARMADA MCP] Shutdown complete');
    process.exit(0);
  }
}

// Start the server
const server = new MCPServer();
server.start();

// Graceful shutdown handlers
process.on('SIGINT', () => server.gracefulShutdown());
process.on('SIGTERM', () => server.gracefulShutdown());
