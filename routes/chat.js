const express = require("express");
const router = express.Router();

const index = require("../lib/upstash");
const embed = require("../lib/embeddings");

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      error: "Message is required",
    });
  }

  try {
    // 1. Convert message to vector
    const queryVector = await embed(message);

    // 2. Search Upstash memory
    const results = await index.query({
      vector: queryVector,
      topK: 3,
      includeMetadata: true,
    });

    // 3. Extract context
    const context = results
      .map((r) => r.metadata?.text)
      .filter(Boolean)
      .join("\n");

    // 4. Build response
    let botReply;

    if (context.length > 0) {
      botReply = `I found relevant information:\n\n${context}`;
    } else {
      botReply = "I don't have enough information in memory yet.";
    }

    return res.json({
      success: true,
      userMessage: message,
      context,
      botReply,
      results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

module.exports = router;