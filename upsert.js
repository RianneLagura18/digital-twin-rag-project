import "dotenv/config";
import { Index } from "@upstash/vector";
import embed from "./lib/embeddings.js";

const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

const data = [
  {
    id: "1",
    text: "Push-ups build chest and triceps strength",
  },
  {
    id: "2",
    text: "Squats build leg strength and glutes",
  },
  {
    id: "3",
    text: "Plank improves core stability",
  },
  {
    id: "4",
    text: "Deadlifts strengthen back and full body",
  },
  {
    id: "5",
    text: "Running improves cardio endurance",
  },
];

async function run() {
  console.log("🚀 Upserting vectors (REAL BGE embeddings)...");

  for (const item of data) {
    const vector = await embed(item.text);

    await db.upsert({
      id: item.id,
      vector,
      metadata: {
        text: item.text,
      },
    });

    console.log("✅ Uploaded:", item.id);
  }

  console.log("🎉 DONE");
}

run();