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
    muscle: "chest",
    difficulty: "beginner",
  },
  {
    id: "2",
    text: "Squats build leg strength and glutes",
    muscle: "legs",
    difficulty: "beginner",
  },
  {
    id: "3",
    text: "Plank improves core stability",
    muscle: "core",
    difficulty: "beginner",
  },
  {
    id: "4",
    text: "Deadlifts strengthen back and full body",
    muscle: "back",
    difficulty: "intermediate",
  },
  {
    id: "5",
    text: "Running improves cardio endurance",
    muscle: "cardio",
    difficulty: "beginner",
  },
];

async function run() {
  console.log("🚀 Uploading vectors...");

  for (const item of data) {
    await db.upsert({
      id: item.id,
      vector: embed(item.text),
      metadata: item,
    });

    console.log("✅ Uploaded:", item.id);
  }

  console.log("🎉 DONE");
}

run();