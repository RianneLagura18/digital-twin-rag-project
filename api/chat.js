import { Index } from "@upstash/vector";

const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ✅ Improved FREE embedding (better similarity + stable RAG)
function getEmbedding(text) {
  const clean = text.toLowerCase().trim();
  const vector = new Array(384).fill(0);

  const tokens = clean.split(/\s+/);

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];

    for (let i = 0; i < token.length; i++) {
      const charCode = token.charCodeAt(i);

      const index =
        (charCode * (i + 1) * (t + 1)) % 384;

      vector[index] += Math.sin(charCode) * 0.8;
    }
  }

  // normalize (VERY important for Upstash scoring)
  const magnitude = Math.sqrt(
    vector.reduce((sum, v) => sum + v * v, 0)
  ) || 1;

  return vector.map(v => v / magnitude);
}

export default async function handler(req, res) {
  console.log("API HIT");

  // CORS (frontend safe)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message required" });
    }

    // STEP 1: create vector
    const vector = getEmbedding(message);

    // STEP 2: query Upstash
    const results = await db.query({
      vector,
      topK: 5,
      includeMetadata: true,
    });

    const data = results?.result ?? results ?? [];

    // STEP 3: build context
    const context =
      Array.isArray(data) && data.length > 0
        ? data
            .map(item => item?.metadata?.text)
            .filter(Boolean)
            .join("\n\n")
        : "Try push-ups, squats, planks, and basic cardio exercises.";

    // STEP 4: response
    return res.status(200).json({
      reply: `🏋️ ${message}\n\n${context}`,
    });

  } catch (err) {
    console.error("API ERROR:", err);

    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}