import express from "express";
import dotenv from "dotenv";
import { Index } from "@upstash/vector";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// =========================
// UPSTASH VECTOR SETUP
// =========================
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// =========================
// MCP TOOL HANDLER
// =========================
app.post("/", async (req, res) => {
  try {
    const { tool, input } = req.body;

    console.log("MCP REQUEST:", tool, input);

    // =========================
    // VECTOR SEARCH TOOL
    // =========================
    if (tool === "vector_search") {
      const results = await index.query({
        data: input,
        topK: 3,
        includeMetadata: true,
      });

      return res.json({
        result: results.map((r) => ({
          text: r.metadata?.text || "",
          score: r.score,
        })),
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

// =========================
// START MCP SERVER
// =========================
app.listen(5051, () => {
  console.log("🚀 MCP Server running on http://localhost:5051");
});