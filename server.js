import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { Index } from "@upstash/vector";

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// UPSTASH VECTOR DB
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// FAKE EMBEDDING (TEMP - OK FOR DEMO)
// ===============================
function getEmbedding(text) {
  const clean = text.toLowerCase();
  const vector = new Array(384).fill(0);

  for (let i = 0; i < clean.length; i++) {
    vector[i % 384] += clean.charCodeAt(i) * 0.01;
  }

  const length = Math.max(clean.length, 1);
  return vector.map(v => v / length);
}

// ===============================
// CHAT ROUTE (RAG PIPELINE)
// ===============================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // ===============================
    // STEP 1: EMBEDDING
    // ===============================
    const queryVector = getEmbedding(message);

    // ===============================
    // STEP 2: VECTOR SEARCH
    // ===============================
    const results = await db.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    console.log("🔎 UPSTASH RAW RESULTS:", JSON.stringify(results, null, 2));

    // ✅ FIX: correct Upstash response handling
    const data = Array.isArray(results) ? results : [];

    console.log("📦 PARSED RESULTS:", data);

    // ===============================
    // STEP 3: RANKING (FIXED)
    // ===============================
    const ranked = data
      .filter(Boolean)
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    const topResults = ranked.slice(0, 3);

    console.log(
      "🏷 TOP RESULTS METADATA:",
      topResults.map(r => r?.metadata)
    );

    // ===============================
    // STEP 4: CONTEXT BUILDING
    // ===============================
    const context =
      topResults.length > 0
        ? topResults
            .map(r => r?.metadata?.text)
            .filter(Boolean)
            .join("\n\n")
        : "Try basic workouts like push-ups, squats, planks, jumping jacks.";

    // ===============================
    // STEP 5: RESPONSE
    // ===============================
    const reply = `🏋️ FITNESS RESPONSE

${context}

💡 Tip: consistency > intensity.`;

    return res.json({
      success: true,
      reply,
      sources: topResults,
      count: topResults.length,
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===============================
// START SERVER
// ===============================
const PORT = 5050;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});