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

// Request logger (for debugging only)
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
// INTERVIEW API (CLEAN RAG)
// =========================
app.post("/api/interview", async (req, res) => {
  try {
    const { question, input } = req.body;
    const userQuestion = question || input;

    console.log("📩 Interview question:", userQuestion);

    if (!userQuestion) {
      return res.json({
        success: false,
        error: "Question is required",
      });
    }

    const mcpResponse = await fetch("http://127.0.0.1:5051", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "vector_search",
        input: userQuestion,
      }),
    });

    if (!mcpResponse.ok) {
      throw new Error("MCP request failed (Interview)");
    }

    const data = await mcpResponse.json();

    const results = (data.result || []).slice(0, 3);

    // ✅ CLEAN ANSWER ONLY
    const answer = results.length
      ? results.map(r => r.text).join("\n")
      : "No relevant data found.";

    return res.json({
      success: true,
      answer,
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
// CHATBOT ROUTE (CLEAN RAG)
// =========================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("📩 Incoming message:", message);

    if (!message) {
      return res.json({ reply: "No message provided" });
    }

    const mcpResponse = await fetch("http://127.0.0.1:5051", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "vector_search",
        input: message,
      }),
    });

    if (!mcpResponse.ok) {
      throw new Error("MCP request failed (Chat)");
    }

    const data = await mcpResponse.json();

    const results = (data.result || []).slice(0, 3);

    // ✅ CLEAN ANSWER ONLY (NO PROMPTS, NO REASONING)
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