// mcp-tool/client.js
// WebSocket client for connecting Next.js to MCP Server

class MCPClient {
  constructor(options = {}) {
    this.url = options.url || process.env.MCP_WS_URL || 'ws://localhost:3001';
    this.ws = null;
    this.messageQueue = [];
    this.handlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectDelay = options.reconnectDelay || 1000;
    this.requestTimeout = options.requestTimeout || 30000; // 30 second default timeout
    this.isConnected = false;
    this.onReconnectFailed = options.onReconnectFailed || null;
  }

  /**
   * Connect to MCP WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      console.log(`[MCP Client] Connecting to ${this.url}...`);

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[MCP Client] Connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Process queued messages
          this.processQueue();
          
          resolve(this.ws);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[MCP Client] Error parsing message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(`[MCP Client] Disconnected: ${event.code} - ${event.reason}`);
          this.isConnected = false;

          // Attempt reconnection
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          } else {
            // Reconnection attempts exhausted
            const error = new Error(`Max reconnection attempts (${this.maxReconnectAttempts}) exceeded`);
            console.error('[MCP Client]', error.message);
            this.emit('reconnect-failed', error);

            // Call user-provided callback if exists
            if (this.onReconnectFailed) {
              this.onReconnectFailed(error);
            }
          }
        };

        this.ws.onerror = (error) => {
          console.error('[MCP Client] WebSocket error:', error.message);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[MCP Client] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('[MCP Client] Reconnection failed:', error.message);
      });
    }, delay);
  }

  /**
   * Process queued messages
   */
  processQueue() {
    while (this.messageQueue.length > 0) {
      const { action, params, resolve, reject } = this.messageQueue.shift();
      this.send(action, params)
        .then(resolve)
        .catch(err => {
          console.error('[MCP Client] Queue processing error:', err);
          reject(err); // Properly propagate error to caller
        });
    }
  }

  /**
   * Send message and get response
   */
  send(action, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.generateId();

      // Set up timeout to prevent memory leaks
      const timeoutId = setTimeout(() => {
        const handler = this.handlers.get(id);
        if (handler) {
          this.handlers.delete(id);
          const error = new Error(`Request timeout for action: ${action} (${this.requestTimeout}ms)`);
          reject(error);
        }
      }, this.requestTimeout);

      // Store handler for response with cleanup
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

      const message = { id, action, params };

      if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      } else {
        // Queue message for later (include reject for error propagation)
        this.messageQueue.push({ action, params, resolve, reject });
      }
    });
  }

  /**
   * Handle incoming messages
   */
  handleMessage(message) {
    const { id, type } = message;

    if (type === 'connected') {
      console.log('[MCP Client] Server confirmed connection:', message.message);
      return;
    }

    if (type === 'error') {
      console.error('[MCP Client] Server error:', message.error);
      return;
    }

    if (type === 'phaseStarted' || type === 'phaseCompleted' || type === 'validationComplete') {
      // These are events, not responses
      this.emit(type, message);
      return;
    }

    // Find handler for this message
    const handler = this.handlers.get(id);
    if (handler) {
      this.handlers.delete(id);

      if (type === 'error') {
        handler.reject(new Error(message.error));
      } else {
        handler.resolve(message);
      }
    }
  }

  /**
   * Validate content
   */
  async validate(content, corridor, emotionalState = null, runPhases = null) {
    return this.send('validate', {
      content,
      corridor,
      emotionalState,
      runPhases
    });
  }

  /**
   * Validate a single line
   */
  async validateLine(line, corridor) {
    return this.send('validateLine', { line, corridor });
  }

  /**
   * Generate song structure
   */
  async generateSong(prompt, corridor, emotionalState, bpm, genre = null) {
    return this.send('generateSong', {
      prompt,
      corridor,
      emotionalState,
      bpm,
      genre
    });
  }

  /**
   * Get available corridors
   */
  async getCorridors() {
    return this.send('getCorridors');
  }

  /**
   * Ping server
   */
  async ping() {
    return this.send('ping');
  }

  /**
   * Subscribe to events
   */
  on(event, callback) {
    if (!this.eventListeners) {
      this.eventListeners = new Map();
    }

    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event).push(callback);
  }

  /**
   * Unsubscribe from events
   */
  off(event, callback) {
    if (!this.eventListeners || !this.eventListeners.has(event)) {
      return;
    }

    if (!callback) {
      // Remove all listeners for this event
      this.eventListeners.delete(event);
      return;
    }

    // Remove specific callback
    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }

    // Clean up empty listener arrays
    if (listeners.length === 0) {
      this.eventListeners.delete(event);
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.eventListeners && this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => callback(data));
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.ws) {
      // Clean up all pending handlers
      this.handlers.forEach(handler => {
        if (handler.timeoutId) {
          clearTimeout(handler.timeoutId);
        }
        if (handler.reject) {
          handler.reject(new Error('Client disconnected'));
        }
      });
      this.handlers.clear();

      // Clear event listeners
      if (this.eventListeners) {
        this.eventListeners.clear();
      }

      // Clear message queue
      this.messageQueue = [];

      // Close WebSocket
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      console.log('[MCP Client] Disconnected and cleaned up');
    }
  }

  /**
   * Generate unique message ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check connection status
   */
  get connected() {
    return this.isConnected;
  }
}

module.exports = MCPClient;
