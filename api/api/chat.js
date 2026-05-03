import { Index } from "@upstash/vector";

// ===============================
// UPSTASH CLIENT
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// SAME EMBEDDING (KEEP FOR NOW)
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
// VERCEL SERVERLESS MCP
// ===============================
export default async function handler(req, res) {
  // only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // ===============================
    // STEP 1: ENHANCE QUERY
    // ===============================
    const enhancedQuery = `fitness workout training: ${message}`;
    const queryVector = getEmbedding(enhancedQuery);

    // ===============================
    // STEP 2: VECTOR SEARCH
    // ===============================
    const results = await db.query({
      vector: queryVector,
      topK: 8,
      includeMetadata: true,
    });

    // ===============================
    // STEP 3: RANKING (YOUR WEEK 8 LOGIC)
    // ===============================
    const ranked = results.sort((a, b) => {
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

    const context = topResults
      .map(r => r.metadata?.text)
      .join("\n\n");

    // ===============================
    // STEP 4: RESPONSE
    // ===============================
    const answer = `
Based on your request: "${message}"

${context}

Tip: Focus on consistency and proper form.
    `.trim();

    return res.status(200).json({
      answer,
      sources: topResults,
    });

  } catch (error) {
    console.error("MCP ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
}