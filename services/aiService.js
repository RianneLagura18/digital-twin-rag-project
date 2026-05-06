import { Index } from "@upstash/vector";

// ===============================
// UPSTASH CLIENT (SAFE - SAME AS YOURS)
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// EMBEDDING (TEMP RAG - KEEP)
// ===============================
function getEmbedding(text) {
  return Array(384)
    .fill(0)
    .map((_, i) => {
      const charCode = text.charCodeAt(i % text.length);
      return (charCode * (i + 7)) % 100 / 100;
    });
}

// ===============================
// MAIN RAG FUNCTION (EXPORTED)
// ===============================
export async function handleChat(req, res) {
  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // ===============================
    // STEP 1: QUERY ENHANCEMENT
    // ===============================
    const enhancedQuery = `fitness workout training: ${message}`;
    const queryVector = getEmbedding(enhancedQuery);

    // ===============================
    // STEP 2: VECTOR SEARCH (UPSTASH)
    // ===============================
    const results = await db.query({
      vector: queryVector,
      topK: 8,
      includeMetadata: true,
    });

    const data = results?.result || results || [];

    // ===============================
    // STEP 3: RANKING LOGIC (UNCHANGED)
    // ===============================
    const ranked = data.sort((a, b) => {
      const scoreA =
        (a.metadata?.muscle === "legs" ? 3 : 0) +
        (a.metadata?.muscle === "core" ? 2 : 0) +
        (a.metadata?.difficulty === "beginner" ? 2 : 0);

      const scoreB =
        (b.metadata?.muscle === "legs" ? 3 : 0) +
        (b.metadata?.muscle === "core" ? 2 : 0) +
        (b.metadata?.difficulty === "beginner" ? 2 : 0);

      return scoreB - scoreA;
    });

    const topResults = ranked.slice(0, 3);

    // ===============================
    // STEP 4: CONTEXT BUILDING
    // ===============================
    const context = topResults.length
      ? topResults
          .map((r) => r.metadata?.text || "")
          .filter(Boolean)
          .join("\n\n")
      : "No workout data found. Suggest basic exercises like push-ups, squats, planks, and jumping jacks.";

    // ===============================
    // STEP 5: FINAL ANSWER
    // ===============================
    const answer = `
🏋️ Based on your request: "${message}"

${context}

💡 Tip: Stay consistent and focus on proper form over speed.
    `.trim();

    return res.status(200).json({
      reply: answer,
      sources: topResults,
    });

  } catch (error) {
    console.error("RAG ERROR:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}