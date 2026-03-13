const OpenAI = require("openai");
const config = require("../config");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

// ─── AI Service ──────────────────────────────────────
//
// Handles OpenAI GPT API calls for the app.
// Currently: roadmap generation from idea details.

// ─── OpenAI Client (lazy init) ──────────────────────

let openai = null;

function getClient() {
  if (!config.openaiApiKey) {
    throw ApiError.badRequest(
      "OpenAI API key is not configured. Add OPENAI_API_KEY to your .env file."
    );
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openai;
}

// ─── Build Prompt ───────────────────────────────────

function buildRoadmapPrompt(idea) {
  const details = idea.details;

  let context = `Startup: "${idea.title}"`;
  if (idea.pitch) context += `\nPitch: ${idea.pitch}`;

  if (details) {
    if (details.problem) context += `\nProblem: ${details.problem}`;
    if (details.solution) context += `\nSolution: ${details.solution}`;
    if (details.targetAudience)
      context += `\nTarget Audience: ${details.targetAudience}`;
    if (details.uniqueValue)
      context += `\nUnique Value: ${details.uniqueValue}`;
    if (details.revenueModel)
      context += `\nRevenue Model: ${details.revenueModel}`;
    if (details.marketSize) context += `\nMarket Size: ${details.marketSize}`;

    if (details.competitors?.length > 0) {
      context += `\nCompetitors: ${details.competitors.join(", ")}`;
    }
    if (details.teamNeeds?.length > 0) {
      context += `\nTeam Needs: ${details.teamNeeds.join(", ")}`;
    }
    if (details.budget) context += `\nBudget: $${details.budget}`;
  }

  return context;
}

// ─── Generate Roadmap ───────────────────────────────

async function generateRoadmap(idea) {
  const client = getClient();
  const context = buildRoadmapPrompt(idea);

  const systemPrompt = `You are a startup planning expert. Given a startup idea, generate a practical product roadmap broken into 4 phases: mvp, v1, v2, and future.

Rules:
- Generate 2-3 milestones per phase (8-12 total milestones).
- Each milestone must have 2-4 tasks.
- Task priorities must be one of: "low", "medium", "high".
- Phase values must be exactly: "mvp", "v1", "v2", "future".
- Keep milestone titles short (under 50 characters).
- Keep task titles short and actionable (under 80 characters).
- Milestone descriptions should be 1-2 sentences.
- Be specific to the startup idea provided, not generic.

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "milestones": [
    {
      "title": "string",
      "description": "string",
      "phase": "mvp",
      "tasks": [
        { "title": "string", "priority": "high" }
      ]
    }
  ]
}`;

  logger.info(`Generating AI roadmap for idea: ${idea.id}`);

  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: context },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw ApiError.badRequest(
      "AI returned an empty response. Please try again."
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    logger.error(`AI returned invalid JSON: ${content}`);
    throw ApiError.badRequest(
      "AI returned an invalid response. Please try again."
    );
  }

  if (!parsed.milestones || !Array.isArray(parsed.milestones)) {
    throw ApiError.badRequest(
      "AI returned an unexpected format. Please try again."
    );
  }

  return parsed.milestones;
}

module.exports = { generateRoadmap };
