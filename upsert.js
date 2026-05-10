import "dotenv/config";
import { Index } from "@upstash/vector";
import embed from "./lib/embeddings.js";

// ===============================
// UPSTASH CLIENT
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// FITNESS DATA
// ===============================
const data = [
  {
    id: "workout-1",
    text: "Workout Plan: Beginner Gym Routine | Build strength using squats, push-ups, and lunges.",
    category: "plan",
    muscle: "full body",
    difficulty: "beginner",
  },

  {
    id: "workout-2",
    text: "Workout Plan: Home Workout Routine | No equipment exercises including jumping jacks, planks, and mountain climbers.",
    category: "plan",
    muscle: "full body",
    difficulty: "beginner",
  },

  {
    id: "workout-3",
    text: "Exercise: Push-up | Chest exercise using bodyweight to build upper body strength.",
    category: "exercise",
    muscle: "chest",
    difficulty: "beginner",
  },

  {
    id: "workout-4",
    text: "Exercise: Squat | Leg strength exercise targeting quadriceps, glutes, and hamstrings.",
    category: "exercise",
    muscle: "legs",
    difficulty: "beginner",
  },

  {
    id: "workout-5",
    text: "Exercise: Plank | Core stability exercise that strengthens abdominal muscles.",
    category: "exercise",
    muscle: "core",
    difficulty: "beginner",
  },

  {
    id: "workout-6",
    text: "Workout Plan: Fat Loss Routine | HIIT cardio training for burning calories and improving endurance.",
    category: "plan",
    muscle: "full body",
    difficulty: "intermediate",
  },

  {
    id: "workout-7",
    text: "Exercise: Bench Press | Chest strength training exercise using barbells or dumbbells.",
    category: "exercise",
    muscle: "chest",
    difficulty: "intermediate",
  },

  {
    id: "workout-8",
    text: "Exercise: Deadlift | Full body strength exercise targeting back, legs, and core muscles.",
    category: "exercise",
    muscle: "back",
    difficulty: "advanced",
  },

  {
    id: "workout-9",
    text: "Workout Plan: Cardio Routine | Running, cycling, and jump rope exercises for heart health.",
    category: "plan",
    muscle: "cardio",
    difficulty: "beginner",
  },

  {
    id: "workout-10",
    text: "Exercise: Lunges | Lower body exercise improving balance, coordination, and leg strength.",
    category: "exercise",
    muscle: "legs",
    difficulty: "beginner",
  },
];

// ===============================
// UPSERT FUNCTION
// ===============================
async function run() {

  try {

    console.log("🚀 Starting Upstash vector upload...");

    for (const item of data) {

      // ===============================
      // CREATE EMBEDDING
      // ===============================
      const vector = embed(item.text);

      // ===============================
      // UPSERT TO DATABASE
      // ===============================
      await db.upsert({
        id: item.id,
        vector,
        metadata: {
          text: item.text,
          category: item.category,
          muscle: item.muscle,
          difficulty: item.difficulty,
        },
      });

      console.log(`✅ Uploaded: ${item.id}`);
    }

    console.log("🎉 DONE: All vectors uploaded successfully.");

  } catch (error) {

    console.error("❌ UPSERT ERROR:", error);

  }
}

// ===============================
// RUN SCRIPT
// ===============================
run();