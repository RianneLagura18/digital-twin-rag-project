import { Index } from "@upstash/vector";

const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// SIMPLE EMBEDDING (temporary)
function getEmbedding(text) {
  return Array(384)
    .fill(0)
    .map((_, i) => {
      const charCode = text.charCodeAt(i % text.length);
      return (charCode * (i + 7)) % 100 / 100;
    });
}

export default async function handler(req, res) {
  console.log("API HIT");

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { message } = body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message required"
      });
    }

    console.log("MESSAGE:", message);

    // ✅ FIX: remove await (sync function)
    const vector = getEmbedding(message);

    console.log("VECTOR OK");

    const results = await db.query({
      vector,
      topK: 5,
      includeMetadata: true,
    });

    console.log("RAW RESULTS:", results);

    const data = results?.result ?? results ?? [];

    const context =
      Array.isArray(data) && data.length > 0
        ? data
            .map(item => item?.metadata?.text)
            .filter(Boolean)
            .join("\n\n")
        : "Try push-ups, squats, planks, jumping jacks.";

    return res.status(200).json({
      success: true,
      reply: 🏋️ ${message}\n\n${context}
    });

  } catch (err) {
    console.error("🔥 API ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}