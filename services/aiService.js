import { Index } from "@upstash/vector";
import embed from "../lib/embeddings.js";

const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// MAIN RAG FUNCTION
// ===============================
export async function handleChat(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message" });
    }

    // ===============================
    // EMBEDDING
    // ===============================
    const queryVector = embed(message);

    // ===============================
    // VECTOR SEARCH
    // ===============================
    const results = await db.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    const data = results?.matches || results || [];

    // ===============================
    // RANKING
    // ===============================
    const topResults = data
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3);

    const context = topResults
      .map(r => r?.metadata?.text)
      .join("\n\n");

    // ===============================
    // SIMPLE INTELLIGENT RESPONSE (FREE RAG)
    // ===============================
    const reply =
  context && context.length > 0
    ? context
    : "No relevant fitness data found in Upstash database.";

    return res.status(200).json({
      reply,
      sources: topResults,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}