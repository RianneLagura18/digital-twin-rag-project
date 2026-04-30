import "dotenv/config";

// Upstash config
const UPSTASH_URL = process.env.UPSTASH_VECTOR_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

// ===============================
// ✅ FULL DATA (1–105 ITEMS)
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
  "healthy lifestyle fitness habits",

  "HIIT workout for beginners",
  "stretching routine before workout",
  "cool down exercises after workout",
  "best warm up exercises",
  "beginner yoga routine",
  "bodyweight exercises at home",
  "simple core workout at home",
  "quick 15 minute workout",
  "fat loss workout at home",
  "gym routine for busy schedule",
  "beginner dumbbell workout",
  "leg day workout routine",
  "arm workout for beginners",
  "back workout exercises",
  "fitness routine without equipment",

  "mobility exercises for beginners",
  "posture correction exercises at home",
  "breathing techniques during workout",
  "beginner kettlebell workout routine",
  "low impact workout for beginners",
  "balance training exercises at home",
  "recovery day workout routine",
  "stretching routine for flexibility improvement",
  "beginner pilates workout at home",
  "functional training exercises for beginners",
  "circuit training workout for beginners",
  "beginner workout for improving stamina",
  "light workout routine for rest days",
  "beginner workout for improving coordination",
  "fitness routine for better sleep",

  "full body stretching routine for beginners",
  "gym etiquette tips for new members",
  "how to use gym equipment safely",
  "nutrition tips for gym beginners",
  "pre workout meal ideas for energy",
  "post workout recovery tips",
  "how to track fitness progress",
  "beginner swimming workout routine",
  "cycling workout plan for weight loss",
  "gym membership benefits and features",

  "upper body workout for beginners",
  "lower body workout at home",
  "beginner resistance band workout",
  "home cardio workout without equipment",
  "beginner treadmill workout plan",
  "easy workout for weight gain",
  "beginner workout for muscle tone",
  "morning workout routine for beginners",
  "evening workout routine at home",
  "beginner workout for flexibility",
  "simple workout for heart health",
  "beginner workout for endurance",
  "step by step workout for beginners",
  "beginner home workout schedule",
  "easy plank variations for beginners",
  "beginner squat workout routine",
  "lunges workout for beginners",
  "push up variations for beginners",
  "beginner workout for core strength",
  "home workout plan for beginners",
  "beginner workout for fat burning",
  "simple workout for beginners at gym",
  "beginner strength training routine",
  "easy workout routine for students",
  "beginner workout for weight loss at gym",

  "beginner workout using resistance bands",
  "home workout routine for busy people",
  "beginner workout for improving balance",
  "beginner workout for joint strength",
  "simple stretching exercises at home",
  "beginner workout for active lifestyle",
  "beginner workout for daily routine",
  "easy cardio exercises at home",
  "beginner workout for full body strength",
  "beginner workout for toning muscles",
  "beginner workout for beginners schedule",
  "beginner workout for physical fitness",
  "beginner workout for healthy lifestyle",
  "beginner workout for beginners guide",
  "easy home workout for beginners",
  "beginner workout tips for consistency",
  "beginner workout for muscle endurance",
  "simple home exercises for beginners",
  "beginner workout for strength building",
  "beginner workout routine for daily fitness",
  "easy fitness routine for beginners",
  "beginner workout for overall health",
  "beginner workout routine without weights",
  "beginner workout plan for home training",
  "beginner workout for improving posture"
];

// ===============================
// 🧠 MOCK EMBEDDING
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
// 📦 UPSERT FUNCTION
// ===============================
async function upsertVector(id, vector, metadata) {
  const response = await fetch(`${UPSTASH_URL}/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      vector,
      metadata,
    }),
  });

  const json = await response.json();
  console.log("Upstash response:", json);
}

// ===============================
// 🚀 RUNNER
// ===============================
async function run() {
  console.log("🚀 Script started");
  console.log("Data length:", data.length);

  for (let i = 0; i < data.length; i++) {
    const text = data[i];

    console.log(`Embedding: ${text}`);

    const embedding = getEmbedding(text);
    const id = `workout-${i + 1}`;

    await upsertVector(id, embedding, {
      text,
      category: "fitness",
    });

    console.log(`Inserted: ${text}`);
  }

  console.log("✅ DONE UPSERTING");
}

run();