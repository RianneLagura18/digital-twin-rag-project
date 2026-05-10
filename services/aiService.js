import { Index } from "@upstash/vector";
import embed from "../lib/embeddings.js";

const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

export async function handleChat(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message" });
    }

    // ===============================
    // EMBEDDING (IMPORTANT: await)
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

    const data = results?.result || results?.matches || [];

    const topResults = data
      .slice(0, 3);

    const context = topResults
      .map(r => r?.metadata?.text)
      .join("\n");

    return res.status(200).json({
      reply: context || "No results found",
      sources: topResults,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}