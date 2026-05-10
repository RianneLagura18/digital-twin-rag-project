import { Index } from "@upstash/vector";
import embed from "../lib/embeddings.js";

const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

export async function handleChat(req, res) {
  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "No message" });
    }

    // ===============================
    // EMBEDDING
    // ===============================
    const queryVector = await embed(message);

    // ===============================
    // VECTOR SEARCH
    // ===============================
    const results = await db.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    console.log("RAW RESULTS:", results);

    // ===============================
    // FIXED PARSING (IMPORTANT)
    // ===============================
    const data = results?.result || [];

    if (data.length === 0) {
      return res.status(200).json({
        reply: "No relevant fitness data found.",
        sources: [],
      });
    }

    // ===============================
    // CLEAN SORTING
    // ===============================
    const topResults = data
      .filter(r => r?.metadata?.text)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3);

    const context = topResults
      .map(r => r.metadata.text)
      .join("\n");

    return res.status(200).json({
      reply: context,
      sources: topResults,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}