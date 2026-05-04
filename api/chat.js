import { Index } from "@upstash/vector";

// ===============================
// UPSTASH CLIENT
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// FREE EMBEDDING (MUST MATCH UPSERT)
// ===============================
function getEmbedding(text) {
  const vector = Array(384).fill(0);

  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);

    for (let j = 0; j < vector.length; j++) {
      vector[j] += (char * (j + 1)) % 7;
    }
  }

  return vector.map(v => v / text.length);
}

// ===============================
// CORS
// ===============================
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ===============================
// HANDLER
// ===============================
export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // ===============================
    // VECTOR SEARCH (RAG CORE)
    // ===============================
    const vector = getEmbedding(message);

    const results = await db.query({
      vector,
      topK: 3,
      includeMetadata: true,
    });

    const context = results
      ?.map(r => r.metadata?.text)
      .filter(Boolean)
      .join("\n");

    // ===============================
    // SIMPLE RESPONSE (NO OPENAI)
    // ===============================
    const reply = `
🏋️ Gym Assistant Answer:

Based on your query: "${message}"

${context ? `📌 Related knowledge:\n${context}` : "No matching exercise found."}

👉 Follow consistent training for best results.
    `.trim();

    return res.status(200).json({
      success: true,
      reply,
      debug: {
        matches: results.length,
      },
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}