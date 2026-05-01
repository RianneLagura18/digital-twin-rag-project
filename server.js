import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mcpApp from "./src/server.js";

dotenv.config();

const app = express();

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());

// =========================
// HEALTH CHECK
// =========================
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// =========================
// INTERVIEW API
// =========================
app.post("/api/interview", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "Question is required",
      });
    }

    // ✅ Call MCP through mounted route
    const mcpResponse = await fetch("http://localhost:5050/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "vector_search",
        input: question,
      }),
    });

    const data = await mcpResponse.json();

    const contextText =
      data.result?.map((r) => r.text).join("\n") || "";

    return res.json({
      success: true,
      question,
      context: data.result,
      answer: contextText
        ? `Interview Insight:\n\n${contextText}`
        : "No relevant knowledge found.",
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// =========================
// MCP ROUTE
// =========================
app.use("/mcp", mcpApp);

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});