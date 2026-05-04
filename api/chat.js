import { Index } from "@upstash/vector";

// ===============================
// VERCEL RUNTIME CONFIG
// ===============================
export const config = {
  runtime: "nodejs",
};

// ===============================
// UPSTASH VECTOR DB
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// SIMPLE EMBEDDING (TEMP RAG)
// ===============================
function getEmbedding(text) {
  const clean = text.toLowerCase();
  const vector = new Array(384).fill(0);

  for (let i = 0; i < clean.length; i++) {
    vector[i % 384] += clean.charCodeAt(i) * 0.01;
  }

  const length = Math.max(clean.length, 1);
  return vector.map(v => v / length);
}

// ===============================
// MAIN HANDLER
// ===============================
export default async function handler(req, res) {
  // ===============================
  // CORS HANDLING (FRONTEND SAFE)
  // ===============================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // ===============================
    // STEP 1: EMBEDDING
    // ===============================
    const queryVector = getEmbedding(message);

    // ===============================
    // STEP 2: VECTOR SEARCH
    // ===============================
    const results = await db.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    const data = results?.result || [];

    // ===============================
    // STEP 3: RANKING
    // ===============================
    const ranked = data.sort((a, b) => {
      const score = (item) => {
        const m = item?.metadata || {};
        return (
          (m.muscle === "legs" ? 3 : 0) +
          (m.muscle === "core" ? 2 : 0) +
          (m.difficulty === "beginner" ? 2 : 0)
        );
      };
      return score(b) - score(a);
    });

    const topResults = ranked.slice(0, 3);

    // ===============================
    // STEP 4: CONTEXT BUILDING
    // ===============================
    const context =
      topResults.length > 0
        ? topResults
            .map(r => r?.metadata?.text)
            .filter(Boolean)
            .join("\n\n")
        : "Try basic workouts like push-ups, squats, planks, jumping jacks.";

    // ===============================
    // STEP 5: RESPONSE
    // ===============================
    const reply = `🏋️ FITNESS RESPONSE

${context}

💡 Tip: consistency > intensity.`;

    // ===============================
    // FINAL FRONTEND CONTRACT (IMPORTANT)
    // ===============================
    return res.status(200).json({
      success: true,
      data: {
        query: message,
        reply,
        sources: topResults,
        count: topResults.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        model: "mcp-rag-v1",
      },
    });

  } catch (error) {
    console.error("MCP ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server error",
      details: error.message,
    });
  }
}