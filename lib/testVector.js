require("dotenv").config();
const index = require("./upstash");
const embed = require("./embeddings");
console.log("URL:", process.env.UPSTASH_VECTOR_REST_URL);
console.log("TOKEN exists:", !!process.env.UPSTASH_VECTOR_REST_TOKEN);

function fakeEmbed(text) {
  const base = Array.from(text).map((c) => c.charCodeAt(0) / 1000);

  while (base.length < 384) {
    base.push(0);
  }

  return base.slice(0, 384);
}

async function runTest() {
  console.log("🚀 Starting vector test...");

  const text = "Antonette is building a digital twin AI system";

  // ✅ CORRECT v1.2.3 FORMAT (IMPORTANT: ARRAY form)
  const insertResult = await index.upsert([
    {
      id: "test-1",
      vector: await embed(text),
      metadata: { text },
    },
  ]);

  console.log("✔ Insert result:", insertResult);

  const queryResult = await index.query({
    vector: await embed("AI digital twin"),
    topK: 3,
    includeMetadata: true,
  });

  console.log("🔎 Search result:");
  console.log(queryResult);
}

runTest();