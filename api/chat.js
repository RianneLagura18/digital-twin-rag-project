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

  return vector.map((v) => v / (normalized.length || 1));
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
// SMART RESPONSE LOGIC (UPGRADED - NON-STATIC)
// ===============================
let reply = "";

// helper for variation
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSmartReply(message, context) {
  const lower = message.toLowerCase();

  const intros = [
    "💪 Here's something useful:",
    "🔥 Let’s break it down:",
    "🏋️ Based on your question:",
  ];

  let intro = randomFrom(intros);
  let advice = "";
  let followUp = "";

  // ===============================
  // INTENT DETECTION
  // ===============================
  if (lower.includes("lose weight") || lower.includes("fat")) {
    advice =
      "Focus on a calorie deficit, combine strength training with cardio (like walking or running), and stay consistent.";
    followUp =
      "Do you want a simple weekly fat-loss workout plan (home or gym)?";
  } else if (lower.includes("muscle") || lower.includes("gain")) {
    advice =
      "Train with progressive overload, eat enough protein, and allow proper recovery between workouts.";
    followUp =
      "Want a muscle-building workout split based on your schedule?";
  } else if (lower.includes("beginner")) {
    advice =
      "Start with basic movements like squats, push-ups, and light cardio to build consistency and form.";
    followUp = "Do you prefer home workouts or going to the gym?";
  } else if (lower.includes("protein")) {
    advice =
      "Protein helps repair and build muscle. Good sources include chicken, eggs, fish, and whey.";
    followUp = "Are you trying to build muscle or lose weight?";
  } else if (lower.includes("workout")) {
    advice =
      "A balanced workout includes push, pull, and leg exercises spread across the week.";
    followUp =
      "Do you want a beginner, intermediate, or advanced workout plan?";
  } else if (lower.includes("hello") || lower.includes("hi")) {
    return "👋 Hey! I'm your gym assistant. Tell me your goal (lose weight, gain muscle, etc.) and I’ll help you out 💪";
  } else {
    advice =
      "I can help with workouts, nutrition, and fitness planning tailored to your goals.";
    followUp =
      "Tell me your goal (lose weight, gain muscle, etc.) so I can guide you better.";
  }

  // ===============================
  // FINAL RESPONSE BUILD
  // ===============================
  if (context && context.length > 0) {
    return `
${intro}

📌 From your data:
${context}

💡 ${advice}

👉 ${followUp}
    `.trim();
  } else {
    return `
${intro}

${advice}

👉 ${followUp}
    `.trim();
  }
}

// generate reply
reply = generateSmartReply(message, context);

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
