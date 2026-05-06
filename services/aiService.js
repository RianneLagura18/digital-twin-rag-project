import { Index } from "@upstash/vector";

// ===============================
// UPSTASH CLIENT
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// EMBEDDING (TEMP RAG - KEEP)
// ===============================
function getEmbedding(text) {
  const safeText = text || "";
  return Array(384)
    .fill(0)
    .map((_, i) => {
      const charCode = safeText.charCodeAt(i % safeText.length || 1);
      return ((charCode * (i + 7)) % 100) / 100;
    });
}

// ===============================
// MAIN RAG FUNCTION
// ===============================
export async function handleChat(req, res) {
  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // ===============================
    // STEP 1: QUERY ENHANCEMENT
    // ===============================
    const enhancedQuery = `fitness workout training: ${message}`;
    const queryVector = getEmbedding(enhancedQuery);

    // ===============================
    // STEP 2: VECTOR SEARCH (UPSTASH)
    // ===============================
    const results = await db.query({
      vector: queryVector,
      topK: 8,
      includeMetadata: true,
    });

    const data = Array.isArray(results) ? results : results?.matches || [];

    // ===============================
    // STEP 3: RANKING LOGIC
    // ===============================
    const ranked = data.sort((a, b) => {
      const scoreA =
        (a?.metadata?.muscle === "legs" ? 3 : 0) +
        (a?.metadata?.muscle === "core" ? 2 : 0) +
        (a?.metadata?.difficulty === "beginner" ? 2 : 0);

      const scoreB =
        (b?.metadata?.muscle === "legs" ? 3 : 0) +
        (b?.metadata?.muscle === "core" ? 2 : 0) +
        (b?.metadata?.difficulty === "beginner" ? 2 : 0);

      return scoreB - scoreA;
    });

    const topResults = ranked.slice(0, 3);

    // ===============================
    // STEP 4: CONTEXT BUILDING
    // ===============================
    const context =
      topResults.length > 0
        ? topResults
            .map((r) => r?.metadata?.text)
            .filter(Boolean)
            .join("\n\n")
        : "No workout data found. Suggest basic exercises like push-ups, squats, planks, and jumping jacks.";

    // ===============================
    // STEP 5: AI-STYLE RESPONSE
    // ===============================
    function randomFrom(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    const intros = [
      "💪 Here's your fitness guidance:",
      "🔥 Let’s break this down:",
      "🏋️ Based on your request:",
    ];

    const intro = randomFrom(intros);

    const lower = message.toLowerCase();

    let advice = "";
    let followUp = "";

    if (lower.includes("lose weight") || lower.includes("fat")) {
      advice =
        "Focus on calorie deficit, strength training, and light cardio consistently.";
      followUp = "Do you want a simple fat-loss workout plan?";
    } else if (lower.includes("muscle") || lower.includes("gain")) {
      advice =
        "Train with progressive overload and eat enough protein for recovery.";
      followUp = "Want a muscle-building split plan?";
    } else if (lower.includes("beginner")) {
      advice =
        "Start with basics like squats, push-ups, and planks to build consistency.";
      followUp = "Home or gym workouts?";
    } else if (lower.includes("protein")) {
      advice =
        "Protein helps muscle repair. Sources: chicken, eggs, fish, whey.";
      followUp = "Are you bulking or cutting?";
    } else {
      advice =
        "I can help with workouts, nutrition, and training plans based on your goal.";
      followUp = "Tell me your goal so I can personalize it.";
    }

    // ===============================
    // FINAL OUTPUT
    // ===============================
    const answer = `
${intro}

🏋️ Based on your request: "${message}"

📌 Workout info:
${context}

💡 ${advice}

👉 ${followUp}
`.trim();

    return res.status(200).json({
      reply: answer,
      sources: topResults,
    });
  } catch (error) {
    console.error("RAG ERROR:", error);

    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}