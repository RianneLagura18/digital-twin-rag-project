import express from "express";

const app = express();
const PORT = 5050;

// Middleware
app.use(express.json());

// ===== ROOT CHECK =====
app.get("/", (req, res) => {
  res.send("Main API is running 🚀");
});

// ===== INTERVIEW API =====
console.log("INTERVIEW ROUTE LOADED");

app.post("/api/interview", async (req, res) => {
  try {
    const { question } = req.body;

    console.log("INTERVIEW QUESTION:", question);

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "Question is required",
      });
    }

    // 🔥 Call MCP SERVER (port 5051 now)
    const mcpResponse = await fetch("http://localhost:5051", {
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

    console.log("MCP RESPONSE:", data);

    const contextText =
      data.result?.map((r) => r.text).join("\n") || "";

    return res.json({
      success: true,
      question,
      context: data.result,
      answer: contextText
        ? `Interview Insight:\n\n${contextText}`
        : "No relevant knowledge found for this question.",
      meta: {
        source: "mcp + vector_search",
      },
    });
  } catch (err) {
    console.error("INTERVIEW ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Main API running on http://localhost:${PORT}`);
});