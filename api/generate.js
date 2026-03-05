/**
 * api/generate.js
 *
 * Vercel Node.js serverless function that runs the full 4-agent pipeline:
 *   Researcher → Chief Architect → Academic Writer → Peer Reviewer
 *
 * All agent logic is implemented here using the @google/genai Node SDK,
 * mirroring the logic in agents.py and prompts.py.
 */

const { GoogleGenAI } = require("@google/genai");

// ─── Gemini client ─────────────────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-2.0-flash"; // fast model, good for chained calls

/**
 * Core LLM call helper.
 * Combines a system prompt and user content into a single request.
 */
async function callLLM(systemPrompt, userContent) {
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\n---\n\n${userContent}` }] },
        ],
        generationConfig: { temperature: 0.7 },
    });
    return response.text;
}

// ─── System Prompts (mirroring prompts.py) ─────────────────────────────────

const RESEARCHER_PROMPT = `You are the Researcher Agent.
Your role is to gather world-class, accurate statistics and data regarding floods.
Specifically, you must focus on:
- 2025 global flood data
- 2025 European flood data
- 2025 Bulgarian flood data
- Geomorphological impacts of these floods

CRITICAL INSTRUCTION: EVERY SINGLE NUMBER, statistic, or data point you provide MUST have a verifiable source citation AND a clickable link (URL) immediately following it.
Format: [Source Name](URL) (e.g., "According to the [IPCC 2025 Report](https://www.ipcc.ch) river levels rose by 14%").
If you cannot search the live web, simulate realistic 2025 data with plausible, realistic source names and URLs. Do not output any numbers without both a source name and a link.

Provide well-structured, detailed, and factual summaries.`;

const ARCHITECT_PROMPT = `You are the Chief Architect Agent.
Your role is to connect the problem of flood monitoring to the I.S.E.E. architecture.

CRITICAL INSTRUCTION: You must NEVER use the word "ensemble" under any circumstances.
Instead, always use terms like "multi-modal architecture" or "tripartite framework".

When discussing the I.S.E.E. architecture, you must mention and explain its core components:
1. Standard MLP (for major floods)
2. Minor-Sensitive MLP (for nuisance floods)
3. Spatial GNN (for topological flow)
4. Physics-Informed Engine (modifies rain predictions based on slope, clay content, and river distance)
5. Max-Wins safety logic (for conflict resolution between models)

Ensure the connection between the flooding problem and this specific architecture is deeply technical and thoroughly explained.`;

const WRITER_PROMPT = `You are the Academic Writer Agent.
Your role is to write formal, world-class thesis chapters.
You will receive data gathered by the Researcher Agent and the technical architectural logic from the Chief Architect Agent.
Synthesize this information to write a cohesive, academic, and highly professional Master's Thesis chapter.
Ensure the tone is objective, scholarly, and logically flows smoothly from problem statement to architectural solution.

CRITICAL INSTRUCTION: You must strictly preserve and include the source citations AND their clickable links for every number or statistic. Ensure the links are properly formatted in Markdown: [Source](URL). Do not write any number without its corresponding source and link.`;

const REVIEWER_PROMPT = `You are the Peer Reviewer Agent.
Your role is to verify the draft provided by the Academic Writer.
You must check for:
- Academic tone and logical flow
- Factual and architectural accuracy

CRITICAL INSTRUCTION 1: You must ensure the forbidden word "ensemble" is NOWHERE in the text. If you see it, replace it or rewrite the sentence to use "multi-modal architecture" or "tripartite framework".

CRITICAL INSTRUCTION 2: You must rigorously check that EVERY SINGLE NUMBER or statistic in the draft has both a source name and a clickable Markdown link accompanying it. If a number lacks a source or a link, you must add a placeholder [CITATION/LINK NEEDED].

Output the final, polished version of the chapter in Markdown format. Do not include your own conversational text, only output the thesis chapter content.`;

// ─── Agent runner functions ─────────────────────────────────────────────────

async function runResearcher(topic) {
    return callLLM(
        RESEARCHER_PROMPT,
        `Please gather and structure the flood data required for the thesis topic: ${topic}`
    );
}

async function runArchitect(researchData) {
    return callLLM(
        ARCHITECT_PROMPT,
        `Based on the following research data, connect the problem to the I.S.E.E. architecture:\n\n${researchData}`
    );
}

async function runWriter(topic, researchData, architectData) {
    return callLLM(
        WRITER_PROMPT,
        `Write the thesis chapter for the topic: ${topic}.\n\nResearch data:\n${researchData}\n\nArchitectural logic:\n${architectData}`
    );
}

async function runReviewer(draft) {
    return callLLM(
        REVIEWER_PROMPT,
        `Please review, verify, and polish the following thesis chapter draft:\n\n${draft}`
    );
}

// ─── Vercel handler ─────────────────────────────────────────────────────────

module.exports = async (req, res) => {
    // Allow CORS so the React frontend can call this from any origin
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    const { topic } = req.body ?? {};

    if (!topic || !topic.trim()) {
        return res.status(400).json({ error: "topic cannot be empty." });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
    }

    try {
        console.log(`[Pipeline] Starting for topic: "${topic}"`);

        const research = await runResearcher(topic);
        console.log("[Pipeline] Researcher done.");

        const architecture = await runArchitect(research);
        console.log("[Pipeline] Architect done.");

        const draft = await runWriter(topic, research, architecture);
        console.log("[Pipeline] Writer done.");

        const final = await runReviewer(draft);
        console.log("[Pipeline] Reviewer done.");

        return res.status(200).json({ research, architecture, draft, final });
    } catch (err) {
        console.error("[Pipeline] Error:", err);
        return res.status(500).json({ error: err.message ?? "Internal server error." });
    }
};
