import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Index } from "@upstash/vector";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// UPSTASH CLIENT
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// MOCK EMBEDDING (KEEP SAME SYSTEM)
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
// MCP CHAT ENDPOINT
// ===============================
app.post("/chat", async (req, res) => {
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
    // STEP 3: SMART RANKING (Week 8 upgrade)
    // ===============================
    const ranked = results.sort((a, b) => {
      const scoreA =
        (a.metadata?.muscle === "legs" ? 3 : 0) +
        (a.metadata?.muscle === "core" ? 2 : 0) +
        (a.metadata?.difficulty === "beginner" ? 2 : 0) +
        (a.metadata?.type === "exercise" ? 1 : 0);

      const scoreB =
        (b.metadata?.muscle === "legs" ? 3 : 0) +
        (b.metadata?.muscle === "core" ? 2 : 0) +
        (b.metadata?.difficulty === "beginner" ? 2 : 0) +
        (b.metadata?.type === "exercise" ? 1 : 0);

      return scoreB - scoreA;
    });

    // ===============================
    // STEP 4: TAKE TOP RESULTS
    // ===============================
    const topResults = ranked.slice(0, 3);

    const context = topResults
      .map((r) => r.metadata?.text)
      .join("\n\n");

    // ===============================
    // STEP 5: RESPONSE GENERATION (SIMPLE RAG)
    // ===============================
    const response = `
Based on your request: "${message}"

Here are the best matched fitness recommendations:

${context}

Tip: Focus on consistency, proper form, and gradual progression.
    `.trim();

    res.json({
      answer: response,
      sources: topResults,
    });

  } catch (error) {
    console.error("MCP Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 MCP Server Running (Week 8 Optimized)");
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5051;

app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on http://localhost:${PORT}`);
});