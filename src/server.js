const express = require("express");
const cors = require("cors");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// =========================
// HEALTH CHECK (IMPORTANT)
// =========================
app.get("/", (req, res) => {
  res.status(200).send("Digital Twin RAG API is running");
});

// =========================
// CHAT ROUTE (YOUR MAIN API)
// =========================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // TEMP SAFE RESPONSE (DO NOT BREAK RAG YET)
    // later we will reconnect your aiService + MCP here
    res.status(200).json({
      success: true,
      reply: "Backend is deployed successfully. RAG/MCP still intact.",
      input: message || null
    });

  } catch (error) {
    console.error("Chat API Error:", error);

    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

// =========================
// EXPORT FOR VERCEL
// =========================
module.exports = app;