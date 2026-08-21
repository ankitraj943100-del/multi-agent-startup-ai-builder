const express = require("express");
const { getMemoryService } = require("../services/memoryService.js");
const { orchestrate } = require("../orchestrator/orchestrator.js");

const router = express.Router();
const memoryService = getMemoryService();

/**
 * Endpoint to start the startup plan generation.
 */
router.post("/generate", async (req, res) => {
  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ error: "Input is required." });
  }

  const sessionId = memoryService.createSession();

  // Async execution - do not await here.
  orchestrate(input, sessionId)
    .catch((err) => {
      console.error(`Orchestration failed for ${sessionId}:`, err);
    });

  res.status(202).json({
    message: "Generation started.",
    sessionId,
  });
});

/**
 * Endpoint to check session status and retrieve agent outputs.
 */
router.get("/status/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = memoryService.getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found." });
  }

  res.json({
    status: session.status,
    agentOutputs: session.agentOutputs,
    logs: session.logs,
  });
});

/**
 * Endpoint to list all sessions (for debug).
 */
router.get("/sessions", (req, res) => {
  res.json(memoryService.listSessions());
});

module.exports = router;
