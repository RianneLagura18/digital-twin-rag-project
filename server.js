import express from "express";

const app = express();
const PORT = 5050;

app.use(express.json());

// =========================
// ROOT CHECK
// =========================
app.get("/", (req, res) => {
  res.send("Main API is running 🚀");
});

console.log("INTERVIEW ROUTE LOADED");

// =========================
// INTERVIEW API (MCP + RAG)
// =========================
app.post("/api/interview", async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const { question } = req.body;

    console.log("INTERVIEW QUESTION:", question);

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "Question is required",
      });
    }

    // =========================
    // MCP CALL (VECTOR SEARCH)
    // =========================
    const mcpResponse = await fetch("http://localhost:5051", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "vector_search",
        input: question,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!mcpResponse.ok) {
      throw new Error("MCP server error");
    }

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
    clearTimeout(timeout);

    console.error("INTERVIEW ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Main API running on http://localhost:${PORT}`);
});