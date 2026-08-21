const { getLLMService } = require("../services/llmService.js");
const prompts = require("./prompts.js");

const llmService = getLLMService();

const runAgent = async (role, inputData, sessionId) => {
  const promptSet = prompts[role];
  if (!promptSet) throw new Error(`Agent for role "${role}" not found.`);

  const systemPrompt = promptSet.system;
  const userPrompt = typeof promptSet.user === "function" ? promptSet.user(inputData) : promptSet.user;

  const result = await llmService.complete(systemPrompt, userPrompt, {
    responseFormat: { type: "json_object" },
  });

  try {
    return JSON.parse(result);
  } catch (error) {
    console.error(`Error parsing JSON from agent "${role}":`, error.message);
    throw new Error(`Failed to parse response from agent "${role}".`);
  }
};

module.exports = {
  runFounderAgent: (input, sessionId) => runAgent("FOUNDER", input, sessionId),
  runMarketResearchAgent: (context, sessionId) => runAgent("MARKET_RESEARCH", context, sessionId),
  runProductManagerAgent: (context, sessionId) => runAgent("PRODUCT_MANAGER", context, sessionId),
  runEngineerAgent: (context, sessionId) => runAgent("ENGINEER", context, sessionId),
  runMarketingAgent: (context, sessionId) => runAgent("MARKETING", context, sessionId),
};
