const { getMemoryService } = require("../services/memoryService.js");
const {
  runFounderAgent,
  runMarketResearchAgent,
  runProductManagerAgent,
  runEngineerAgent,
  runMarketingAgent,
} = require("../agents/index.js");

const memoryService = getMemoryService();

/**
 * Orchestrates the sequential execution of AI agents.
 * 1. Founder
 * 2. Market Research
 * 3. Product Manager
 * 4. Engineer
 * 5. Marketing
 * @param {string} input - Initial startup idea.
 * @param {string} sessionId - Unique identifier for the session.
 */
const orchestrate = async (input, sessionId) => {
  try {
    memoryService.setStatus(sessionId, "running");
    memoryService.addLog(sessionId, "info", "Starting orchestration for idea: " + input);

    // 1. Founder Agent
    memoryService.addLog(sessionId, "info", "Founder Agent: Analyzing initial prompt...");
    memoryService.addLog(sessionId, "info", "Founder Agent: Drafting core vision and mission...");
    const founderOutput = await runFounderAgent(input, sessionId);
    memoryService.setAgentOutput(sessionId, "idea", founderOutput);
    memoryService.addLog(sessionId, "success", "Founder Agent: Vision established successfully.");

    // 2. Market Research Agent
    memoryService.addLog(sessionId, "info", "Market Research: Scanning industry landscapes...");
    memoryService.addLog(sessionId, "info", "Market Research: Identifying top competitors and TAM...");
    const marketResearchOutput = await runMarketResearchAgent(founderOutput, sessionId);
    memoryService.setAgentOutput(sessionId, "market_research", marketResearchOutput);
    memoryService.addLog(sessionId, "success", "Market Research: Market validation complete.");

    // 3. Product Manager Agent
    memoryService.addLog(sessionId, "info", "PM Agent: Mapping user journeys...");
    memoryService.addLog(sessionId, "info", "PM Agent: Prioritizing MVP feature set...");
    const pmOutput = await runProductManagerAgent({ ...founderOutput, ...marketResearchOutput }, sessionId);
    memoryService.setAgentOutput(sessionId, "product", pmOutput);
    memoryService.addLog(sessionId, "success", "PM Agent: Product roadmap finalized.");

    // 4. Engineer Agent
    memoryService.addLog(sessionId, "info", "Engineer: Choosing optimal tech stack...");
    memoryService.addLog(sessionId, "info", "Engineer: Designing system architecture & schema...");
    const engineerOutput = await runEngineerAgent({ ...founderOutput, ...pmOutput }, sessionId);
    memoryService.setAgentOutput(sessionId, "engineering", engineerOutput);
    memoryService.addLog(sessionId, "success", "Engineer: Technical blueprint ready.");

    // 5. Marketing Agent
    memoryService.addLog(sessionId, "info", "Marketing: Developing GTM strategy...");
    memoryService.addLog(sessionId, "info", "Marketing: Drafting launch announcement...");
    const marketingOutput = await runMarketingAgent({ ...founderOutput, ...pmOutput, ...marketResearchOutput }, sessionId);
    memoryService.setAgentOutput(sessionId, "marketing", marketingOutput);
    memoryService.addLog(sessionId, "success", "Marketing: Growth strategy locked in.");

    memoryService.setStatus(sessionId, "completed");
    memoryService.addLog(sessionId, "info", "Orchestration completed successfully.");

    return memoryService.getAllOutputs(sessionId);
  } catch (error) {
    memoryService.setStatus(sessionId, "failed");
    memoryService.addLog(sessionId, "error", `Orchestration failed: ${error.message}`);
    console.error("Orchestration Error:", error);
    throw error;
  }
};

module.exports = { orchestrate };
