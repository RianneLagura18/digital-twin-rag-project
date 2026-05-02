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

// =========================
// ROOT
// =========================
app.get("/", (req, res) => {
  res.send("Main API is running 🚀");
});

// =========================
// INTERVIEW API (RAG)
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

    const mcpResponse = await fetch("http://localhost:5051", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "vector_search",
        input: userQuestion,
      }),
    });

    const data = await mcpResponse.json();
    const results = data.result || [];

    const contextText = results.map(r => r.text).join("\n");

    return res.json({
      success: true,
      answer: contextText || "No relevant data found.",
      context: results,
    });

  } catch (err) {
    console.error(err);

    return res.json({
      success: false,
      error: "Server error",
    });
  }
});

// =========================
// CHATBOT ROUTE (FRONTEND)
// =========================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "No message provided" });
    }

    const mcpResponse = await fetch("http://localhost:5051", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "vector_search",
        input: message,
      }),
    });

    const data = await mcpResponse.json();
    const results = data.result || [];

    const replyText = results.length
      ? results.map(r => r.text).join("\n")
      : "No results found.";

    return res.json({
      reply: `💡 ${replyText}`,
    });

  } catch (err) {
    console.error(err);

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