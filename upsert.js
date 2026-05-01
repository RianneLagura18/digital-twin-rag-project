import "dotenv/config";
import { Index } from "@upstash/vector";

// ===============================
// CLIENT (CORRECT WAY)
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// DATA
// ===============================
const data = [
  "gym workout plan for beginners",
  "home workout routine for beginners",
  "weight loss exercises for beginners",
  "cardio training plan for fat loss",
  "muscle building workout program",
  "fitness tips for beginners at the gym",
  "fat burning workout routine",
  "strength training exercises for beginners",
  "gym exercises for abs and core",
  "daily fitness routine at home",
  "upper body workout routine",
  "lower body workout exercises",
  "full body workout plan",
  "beginner gym training schedule",
  "healthy lifestyle fitness habits"
];

// ===============================
// MOCK EMBEDDING (384 dim)
// ===============================
function getEmbedding(text) {
  return Array(384)
    .fill(0)
    .map((_, i) => {
      const charCode = text.charCodeAt(i % text.length);
      return (charCode * (i + 7)) % 100 / 100;
    });
}

// ===============================
// RUN
// ===============================
async function run() {
  console.log("🚀 Script started");

  for (let i = 0; i < data.length; i++) {
    const text = data[i];

    const vector = getEmbedding(text);

    await db.upsert({
      id: `workout-${i + 1}`,
      vector,
      metadata: {
        text,
        category: "fitness",
      },
    });

    console.log("Inserted:", `workout-${i + 1}`);
  }

  console.log("✅ DONE UPSERTING");
}

run();