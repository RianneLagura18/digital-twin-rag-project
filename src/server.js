import express from "express";

const app = express();

app.use(express.json());

// =========================
// MCP TOOL HANDLER
// =========================
app.post("/", async (req, res) => {
  try {
    const { tool, input } = req.body;

    console.log("MCP REQUEST:", tool, input);

    if (tool === "vector_search") {
      // 🔥 Dummy data (replace later with Upstash)
      return res.json({
        result: [
          { text: "Sample result 1 for: " + input },
          { text: "Sample result 2 for: " + input },
        ],
      });
    }

    return res.status(400).json({
      error: "Unknown tool",
    });
  } catch (err) {
    console.error("MCP ERROR:", err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// ✅ VERY IMPORTANT
export default app;