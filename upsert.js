import "dotenv/config";
import { Index } from "@upstash/vector";

// ===============================
// UPSTASH CLIENT
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// DATA
// ===============================
const data = [
  "Workout Plan: Beginner Gym Routine | Build strength | squats, push-ups",
  "Workout Plan: Home Workout Routine | No equipment | jumping jacks, planks",
  "Exercise: Push-up | Chest | beginner bodyweight exercise",
  "Exercise: Squat | Legs | strength training",
  "Exercise: Plank | Core | stability exercise",
  "Workout Plan: Fat Loss Routine | HIIT cardio training",
  "Exercise: Bench Press | Chest | intermediate strength",
  "Exercise: Deadlift | Back and Legs | full body strength",
  "Workout Plan: Cardio Routine | running, cycling",
  "Exercise: Lunges | Legs | balance and strength"
];

// ===============================
// FREE EMBEDDING (384-DIM, MATCHES CHAT)
// ===============================
function getEmbedding(text) {
  const vector = Array(384).fill(0);

  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);

    for (let j = 0; j < vector.length; j++) {
      vector[j] += (char * (j + 1)) % 7;
    }
  }

  return vector.map(v => v / text.length);
}

// ===============================
// RUN UPSERT
// ===============================
async function run() {
  console.log("🚀 Upsert started (FREE MODE)");

  for (let i = 0; i < data.length; i++) {
    const text = data[i];

    const category = text.includes("Exercise") ? "exercise" : "plan";

    const vector = getEmbedding(text);

    await db.upsert({
      id: `workout-${i + 1}`,
      vector,
      metadata: {
        text,
        category,
      },
    });

    console.log(`✅ Inserted: workout-${i + 1}`);
  }

  console.log("🎉 DONE: Vector database ready");
}

run();