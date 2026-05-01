import express from "express";
import { Index } from "@upstash/vector";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// ===== UPSTASH VECTOR =====
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===== TOOL: vector_search =====
async function vectorSearch(input) {
  try {
    const results = await index.query({
      data: input,
      topK: 3,
      includeMetadata: true,
    });

    return results.map((r) => ({
      text: r.metadata?.text || "No text",
      score: r.score,
    }));
  } catch (err) {
    console.error("Vector error:", err);
    return [];
  }
}

// ===== MCP ROUTE (ROLLED TOOL SYSTEM) =====
app.post("/", async (req, res) => {
  try {
    const { tool, input } = req.body;

    if (!tool) {
      return res.status(400).json({
        success: false,
        error: "Tool required",
      });
    }

    let result;

    switch (tool) {
      case "vector_search":
        result = await vectorSearch(input);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Unknown tool",
        });
    }

    return res.json({
      success: true,
      tool,
      result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ===== START MCP SERVER =====
app.listen(5051, () => {
  console.log("🧠 MCP Server running on http://localhost:5051");
});