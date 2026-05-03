import express from "express";
import cors from "cors";

const app = express();
const PORT = 5050;

// =========================
// MIDDLEWARE
// =========================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log("🌐 REQUEST:", req.method, req.url);
  next();
});

// =========================
// ROOT
// =========================
app.get("/", (req, res) => {
  res.send("Main API is running 🚀");
});

// =========================
// INTERVIEW API (IMPROVED STABILITY)
// =========================
app.post("/api/interview", async (req, res) => {
  try {
    const { question, input } = req.body;
    const userQuestion = question || input;

    if (!userQuestion) {
      return res.json({
        success: false,
        error: "Question is required",
      });
    }

    const mcpResponse = await fetch("http://127.0.0.1:5051", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: "vector_search",
        input: userQuestion,
      }),
    });

    if (!mcpResponse.ok) {
      throw new Error("MCP request failed");
    }

    const data = await mcpResponse.json();
    const results = (data.result || []).slice(0, 5);

    const answer = results.length
      ? results.map(r => r.text).join("\n")
      : "No relevant data found.";

    let score = 0;
    if (results.length === 0) score = 20;
    else if (results.length === 1) score = 50;
    else if (results.length === 2) score = 75;
    else score = 90;

    let recommendation = "";
    if (score >= 80) recommendation = "Excellent answer. Keep it up!";
    else if (score >= 60) recommendation = "Good answer, but you can improve with more details.";
    else if (score >= 40) recommendation = "Fair answer. Try to be more specific.";
    else recommendation = "Needs improvement. Review the topic.";

    return res.json({
      success: true,
      answer,
      score,
      recommendation,
      context: results,
    });

  } catch (err) {
    console.error("❌ INTERVIEW ERROR:", err);

    return res.json({
      success: false,
      error: "Server error",
    });
  }
});

// =========================
// CHATBOT API (IMPROVED CONSISTENCY)
// =========================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "No message provided" });
    }

    const mcpResponse = await fetch("http://127.0.0.1:5051", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: "vector_search",
        input: message,
      }),
    });

    if (!mcpResponse.ok) {
      throw new Error("MCP request failed");
    }

    const data = await mcpResponse.json();
    const results = (data.result || []).slice(0, 5);

    const replyText = results.length
      ? results.map(r => r.text).join("\n")
      : "No relevant results found.";

    return res.json({
      reply: replyText,
      context: results,
    });

  } catch (err) {
    console.error("❌ CHAT ERROR:", err);

    return res.json({
      reply: "Server error",
    });
  }
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Main API running on http://localhost:${PORT}`);
});