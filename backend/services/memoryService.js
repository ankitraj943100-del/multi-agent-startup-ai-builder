/**
 * In-memory store for agent outputs and session data.
 * Each session (identified by a sessionId) holds the outputs of all agents.
 */
class MemoryService {
  constructor() {
    /** @type {Map<string, object>} */
    this.sessions = new Map();
  }

  /**
   * Create a new session and return its ID.
   * @returns {string}
   */
  createSession() {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.sessions.set(sessionId, {
      id: sessionId,
      createdAt: new Date().toISOString(),
      agentOutputs: {},
      logs: [],
      status: "created",
    });
    return sessionId;
  }

  /**
   * Get a session by ID.
   * @param {string} sessionId
   * @returns {object|null}
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Store the output of a specific agent in a session.
   * @param {string} sessionId
   * @param {string} agentName
   * @param {object} output
   */
  setAgentOutput(sessionId, agentName, output) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    session.agentOutputs[agentName] = output;
  }

  /**
   * Get the output of a specific agent.
   * @param {string} sessionId
   * @param {string} agentName
   * @returns {object|null}
   */
  getAgentOutput(sessionId, agentName) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    return session.agentOutputs[agentName] || null;
  }

  /**
   * Get all agent outputs for a session (the accumulated context).
   * @param {string} sessionId
   * @returns {object}
   */
  getAllOutputs(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return {};
    return session.agentOutputs;
  }

  /**
   * Add a log entry to a session.
   * @param {string} sessionId
   * @param {string} level
   * @param {string} message
   * @param {object} [meta]
   */
  addLog(sessionId, level, message, meta = {}) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    });
  }

  /**
   * Get all logs for a session.
   * @param {string} sessionId
   * @returns {Array}
   */
  getLogs(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return session.logs;
  }

  /**
   * Update session status.
   * @param {string} sessionId
   * @param {string} status
   */
  setStatus(sessionId, status) {
    const session = this.sessions.get(sessionId);
    if (session) session.status = status;
  }

  /**
   * Delete a session (cleanup).
   * @param {string} sessionId
   */
  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * List all session IDs.
   * @returns {string[]}
   */
  listSessions() {
    return Array.from(this.sessions.keys());
  }
}

// Singleton
let instance;
function getMemoryService() {
  if (!instance) {
    instance = new MemoryService();
  }
  return instance;
}

module.exports = { MemoryService, getMemoryService };
