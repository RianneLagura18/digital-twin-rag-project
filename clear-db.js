import "dotenv/config";
import { Index } from "@upstash/vector";

const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

async function clear() {
  console.log("🧨 Deleting all vectors...");

  // Upstash does not always support bulk delete,
  // so we manually delete known IDs (your current dataset)

  const ids = ["1", "2", "3", "4", "5"];

  for (const id of ids) {
    await db.delete(id);
    console.log("Deleted:", id);
  }

  console.log("✅ Done");
}

clear();