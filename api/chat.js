import { Index } from "@upstash/vector";

// ===============================
// DEBUG ENV
// ===============================
console.log("ENV URL:", process.env.UPSTASH_VECTOR_REST_URL);
console.log(
  "ENV TOKEN:",
  process.env.UPSTASH_VECTOR_REST_TOKEN ? "EXISTS" : "MISSING"
);

// ===============================
// UPSTASH CLIENT
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// SIMPLE EMBEDDING (KEEP SAFE - IMPROVED VARIATION)
// NOTE: still NOT real AI embeddings but better than before
// ===============================
function getEmbedding(text) {
  const vector = Array(384).fill(0);

  const normalized = text.toLowerCase().trim();

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);

    for (let j = 0; j < vector.length; j++) {
      vector[j] += Math.sin(char * (j + 1)) + (char % (j + 3));
    }
  }

  return vector.map((v) => v / normalized.length);
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
// MAIN HANDLER
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
    // UPSTASH SEARCH (RAG)
    // ===============================
    try {
      results = await db.query({
        vector,
        topK: 3,
        includeMetadata: true,
      });
    } catch (err) {
      console.error("UPSTASH ERROR:", err);
      results = [];
    }

    // ===============================
    // BUILD CONTEXT
    // ===============================
    const context = results
      ?.map((r) => r?.metadata?.text)
      .filter(Boolean)
      .join("\n");

    // ===============================
    // SMART RESPONSE LOGIC (FIX FOR "FIXED ANSWER")
    // ===============================
    let reply = "";

    if (context && context.length > 0) {
      reply = `
🏋️ Gym Assistant:

Based on your question: "${message}"

📌 Relevant knowledge:
${context}

💡 Tip: Stay consistent with your training for best results.
      `.trim();
    } else {
      // smarter fallback instead of always same answer
      const lower = message.toLowerCase();

      if (lower.includes("protein")) {
        reply =
          "💪 Protein helps build muscle. Good sources: chicken, eggs, fish, whey.";
      } else if (lower.includes("workout")) {
        reply =
          "🏋️ A good workout plan includes push, pull, and leg days for balance.";
      } else if (lower.includes("hello")) {
        reply = "👋 Hello! Ask me about workouts, nutrition, or fitness plans.";
      } else {
        reply =
          "🤖 I couldn’t find exact data, but try asking about workouts, nutrition, or gym routines.";
      }
    }

    // ===============================
    // RESPONSE
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