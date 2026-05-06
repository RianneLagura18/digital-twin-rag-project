const index = require("../lib/upstash");
const embed = require("../lib/embeddings");

async function chatController(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const queryVector = await embed(message);

    const results = await index.query({
      vector: queryVector,
      topK: 3,
      includeMetadata: true,
    });

    const context = results.map(r => r.metadata.text).join("\n");

    res.json({
      question: message,
      context,
      results,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = chatController;