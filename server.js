import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { Index } from "@upstash/vector";
import embed from "./lib/embeddings.js";

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
// CHAT ROUTE (RAG PIPELINE)
// ===============================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};

    // ===============================
    // VALIDATION
    // ===============================
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // ===============================
    // STEP 1: CREATE QUERY VECTOR
    // ===============================
    const queryVector = embed(message);

    console.log("🧠 User Message:", message);

    // ===============================
    // STEP 2: VECTOR SEARCH
    // ===============================
    const results = await db.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    console.log(
      "🔎 RAW VECTOR RESULTS:",
      JSON.stringify(results, null, 2)
    );

    // ===============================
    // STEP 3: SAFE RESULT PARSING
    // ===============================
    const data =
      Array.isArray(results)
        ? results
        : results?.matches || [];

    // ===============================
    // STEP 4: SORT BY SCORE
    // ===============================
    const ranked = data
      .filter(Boolean)
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    const topResults = ranked.slice(0, 3);

    console.log(
      "🏷 TOP RESULTS:",
      topResults.map(r => ({
        score: r.score,
        text: r?.metadata?.text,
      }))
    );

    // ===============================
    // STEP 5: BUILD CONTEXT
    // ===============================
    const context =
      topResults.length > 0
        ? topResults
            .map(r => r?.metadata?.text)
            .filter(Boolean)
            .join("\n\n")
        : "No relevant fitness information found.";

    // ===============================
    // STEP 6: DYNAMIC RESPONSE
    // ===============================
    const tips = [
      "💡 Tip: consistency beats intensity.",
      "💡 Tip: proper form prevents injuries.",
      "💡 Tip: progressive overload builds strength.",
      "💡 Tip: recovery and sleep matter too.",
      "💡 Tip: warm up before every workout.",
    ];

    const randomTip =
      tips[Math.floor(Math.random() * tips.length)];

    const reply = `
🏋️ Fitness Assistant

${context}

${randomTip}
`.trim();

    // ===============================
    // FINAL RESPONSE
    // ===============================
    return res.status(200).json({
      success: true,
      reply,
      sources: topResults,
      count: topResults.length,
    });

  } catch (error) {

    console.error("❌ SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });

  }
});

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 RAG Fitness Server Running");
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});