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
    // STEP 1: EMBEDDING
    // ===============================
    const queryVector = await embed(message);

    // DEBUG (REMOVE LATER IF YOU WANT)
    console.log("📩 MESSAGE:", message);
    console.log("📊 VECTOR SAMPLE:", queryVector.slice(0, 5));

    // ===============================
    // STEP 2: VECTOR SEARCH
    // ===============================
    const results = await db.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    console.log("🔎 RAW UPSTASH RESULTS:", JSON.stringify(results, null, 2));

    // ===============================
    // FIX: SAFE PARSING (IMPORTANT)
    // Upstash can return: result OR matches OR array
    // ===============================
    const data =
      results?.result ??
      results?.matches ??
      results ??
      [];

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(200).json({
        reply: "No relevant fitness data found in Upstash.",
        sources: [],
      });
    }

    // ===============================
    // STEP 3: BASIC RANKING SAFETY
    // ===============================
    const topResults = data
      .filter(r => r?.metadata?.text)
      .slice(0, 3);

    // ===============================
    // STEP 4: CONTEXT BUILDING
    // ===============================
    const context = topResults
      .map(r => r.metadata.text)
      .join("\n");

    // ===============================
    // STEP 5: FINAL RESPONSE (PURE RAG)
    // ===============================
    return res.status(200).json({
      reply: context,
      sources: topResults,
    });

  } catch (err) {
    console.error("RAG ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}