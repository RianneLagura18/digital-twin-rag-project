import { Index } from "@upstash/vector";

const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

function getEmbedding(text) {
  const clean = text.toLowerCase();
  const vector = new Array(384).fill(0);

  for (let i = 0; i < clean.length; i++) {
    vector[i % 384] += clean.charCodeAt(i) * 0.01;
  }

  const length = Math.max(clean.length, 1);
  return vector.map(v => v / length);
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const queryVector = getEmbedding(message);

    const results = await db.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    const data = Array.isArray(results) ? results : [];

    const ranked = data
      .filter(Boolean)
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    const topResults = ranked.slice(0, 3);

    const context =
      topResults.length > 0
        ? topResults.map(r => r?.metadata?.text).join("\n\n")
        : "Try basic workouts like push-ups, squats, planks.";

    const reply = `🏋️ FITNESS RESPONSE

${context}

💡 Tip: consistency > intensity.`;

    return res.status(200).json({
      success: true,
      reply,
      sources: topResults,
      count: topResults.length,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}