const Groq = require("groq-sdk");

class LLMService {
  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    this.model = process.env.GROQ_MODEL || "mixtral-8x7b-32768";
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  /**
   * Send a chat completion request to Groq.
   * @param {string} systemPrompt - The system-level instruction.
   * @param {string} userPrompt - The user-level input.
   * @param {object} options - Optional overrides (temperature, max_tokens, etc.)
   * @returns {Promise<string>} - The LLM response text.
   */
  async complete(systemPrompt, userPrompt, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      responseFormat = undefined,
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const params = {
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
        };

        if (responseFormat) {
          params.response_format = responseFormat;
        }

        const chatCompletion = await this.client.chat.completions.create(params);
        return chatCompletion.choices[0]?.message?.content || "";
      } catch (error) {
        lastError = error;
        console.error(
          `[LLMService] Attempt ${attempt}/${this.maxRetries} failed:`,
          error.message
        );

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`[LLMService] Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `[LLMService] All ${this.maxRetries} attempts failed. Last error: ${lastError?.message}`
    );
  }

  /**
   * Stream a chat completion response from Groq.
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @param {function} onChunk - Callback fired for each text chunk.
   * @param {object} options
   * @returns {Promise<string>} - The full accumulated response.
   */
  async stream(systemPrompt, userPrompt, onChunk, options = {}) {
    const { temperature = 0.7, maxTokens = 4096 } = options;

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        if (onChunk) onChunk(content);
      }
    }

    return fullResponse;
  }
}

// Singleton
let instance;
function getLLMService() {
  if (!instance) {
    instance = new LLMService();
  }
  return instance;
}

module.exports = { LLMService, getLLMService };
