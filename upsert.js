import "dotenv/config";
import { Index } from "@upstash/vector";

// ===============================
// CLIENT
// ===============================
const db = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// ===============================
// IMPROVED DATA (STRUCTURED)
// ===============================
const data = [
  "Workout Plan: Beginner Gym Routine | Goal: Build strength and endurance | Duration: 3 days per week | Includes: Full body exercises like squats, push-ups, and light weights | Tips: Focus on proper form and consistency",

  "Workout Plan: Home Workout Routine | Goal: Stay active at home | Equipment: None | Includes: Jumping jacks, push-ups, planks | Tips: Maintain regular schedule",

  "Exercise: Push-up | Target Muscle: Chest | Difficulty: Beginner | Equipment: None | Benefits: Builds upper body strength | Tips: Keep body straight and core tight",

  "Exercise: Squat | Target Muscle: Legs | Difficulty: Beginner | Equipment: Bodyweight or Barbell | Benefits: Strengthens legs and glutes | Tips: Keep knees aligned with toes",

  "Exercise: Plank | Target Muscle: Core | Difficulty: Beginner | Equipment: None | Benefits: Improves core stability | Tips: Keep back straight",

  "Workout Plan: Fat Loss Routine | Goal: Burn calories | Includes: Cardio and HIIT exercises | Duration: 20–30 minutes | Tips: Combine with proper diet",

  "Exercise: Bench Press | Target Muscle: Chest | Difficulty: Intermediate | Equipment: Barbell | Benefits: Builds chest and arm strength | Tips: Control the bar movement",

  "Exercise: Deadlift | Target Muscle: Back and Legs | Difficulty: Intermediate | Equipment: Barbell | Benefits: Full body strength | Tips: Keep back straight",

  "Workout Plan: Cardio Routine | Goal: Improve heart health | Includes: Running, cycling, jump rope | Duration: 20 minutes | Tips: Maintain steady pace",

  "Exercise: Lunges | Target Muscle: Legs | Difficulty: Beginner | Equipment: None | Benefits: Improves balance and leg strength | Tips: Keep torso upright",

  "Workout Plan: Muscle Gain Routine | Goal: Increase muscle mass | Includes: Strength training and progressive overload | Tips: Eat enough protein",

  "Exercise: Bicep Curl | Target Muscle: Arms | Difficulty: Beginner | Equipment: Dumbbells | Benefits: Builds arm strength | Tips: Avoid swinging weights",

  "Exercise: Shoulder Press | Target Muscle: Shoulders | Difficulty: Beginner | Equipment: Dumbbells | Benefits: Builds shoulder strength | Tips: Keep controlled movement",

  "Workout Plan: Beginner HIIT | Goal: Burn fat quickly | Includes: High intensity intervals | Duration: 15–20 minutes | Tips: Rest between sets",

  "Exercise: Mountain Climbers | Target Muscle: Core | Difficulty: Beginner | Equipment: None | Benefits: Improves endurance | Tips: Keep fast pace",

  "Workout Plan: Flexibility Routine | Goal: Improve flexibility | Includes: Stretching exercises | Tips: Hold stretches for 20–30 seconds",

  "Exercise: Jump Rope | Target Muscle: Full Body | Difficulty: Beginner | Equipment: Rope | Benefits: Improves cardio fitness | Tips: Stay light on feet",

  "Workout Plan: Core Strength Routine | Goal: Strengthen abs | Includes: Planks, crunches | Tips: Engage core muscles",

  "Exercise: Burpees | Target Muscle: Full Body | Difficulty: Intermediate | Equipment: None | Benefits: Burns calories fast | Tips: Maintain rhythm",

  "Workout Plan: Recovery Routine | Goal: Muscle recovery | Includes: Light stretching and walking | Tips: Stay hydrated"
];

// ===============================
// MOCK EMBEDDING (KEEP AS IS)
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
  console.log("🚀 Upsert started");

  for (let i = 0; i < data.length; i++) {
    const text = data[i];

    // ===============================
    // CATEGORY LOGIC
    // ===============================
    let category = "general";
    if (text.includes("Exercise:")) category = "exercise";
    if (text.includes("Workout Plan:")) category = "plan";

    const enhancedText = `
Category: ${category}
Content: ${text}
`.trim();

    const vector = getEmbedding(enhancedText);

    // ===============================
    // UPSERT WITH IMPROVED METADATA
    // ===============================
    await db.upsert({
      id: `workout-${i + 1}`,
      vector,
      metadata: {
        text,
        category,

        type: text.includes("Exercise:") ? "exercise" : "plan",

        difficulty: text.includes("Beginner")
          ? "beginner"
          : text.includes("Intermediate")
          ? "intermediate"
          : "unknown",

        muscle:
          text.includes("Chest") ? "chest" :
          text.includes("Legs") ? "legs" :
          text.includes("Core") ? "core" :
          text.includes("Back") ? "back" :
          text.includes("Arms") ? "arms" :
          text.includes("Shoulders") ? "shoulders" :
          text.includes("Full Body") ? "full_body" :
          "general"
      },
    });

    console.log(`Inserted: workout-${i + 1}`);
  }

  console.log("✅ DONE UPSERTING ALL ITEMS");
}

run();