import { Index } from "@upstash/vector";

// ===============================
// DEBUG ENV
// ===============================
console.log("ENV URL:", process.env.UPSTASH_VECTOR_REST_URL);
console.log("ENV TOKEN:", process.env.UPSTASH_VECTOR_REST_TOKEN ? "EXISTS" : "MISSING");

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

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // ===============================
    // EMBEDDING
    // ===============================
    const vector = getEmbedding(message);

    let results = [];

    // ===============================
    // UPSTASH SEARCH
    // ===============================
    try {
      results = await db.query({
        vector,
        topK: 3,
        includeMetadata: true,
      });
    } catch (upstashError) {
      console.error("UPSTASH ERROR:", upstashError);

      return res.status(500).json({
        error: "Upstash query failed",
        details: upstashError.message,
      });
    }

    // ===============================
    // CONTEXT BUILDING
    // ===============================
    const context = results
      ?.map(r => r.metadata?.text)
      .filter(Boolean)
      .join("\n");

    // ===============================
    // RESPONSE GENERATION
    // ===============================
    const reply = `
🏋️ Gym Assistant Answer:

Based on your query: "${message}"

${context
  ? `📌 Related knowledge:\n${context}`
  : "No matching exercise found."}

👉 Follow consistent training for best results.
`.trim();

    // ===============================
    // RETURN RESPONSE
    // ===============================
    return res.status(200).json({
      success: true,
      reply,
      debug: {
        matches: results.length,
      },
    });

  } catch (err) {
    console.error("GENERAL ERROR:", err);

    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}