import "dotenv/config";

// Upstash config
const UPSTASH_URL = process.env.UPSTASH_VECTOR_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

// 🧠 YOUR 15 RECORDS
const data = [
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
  "fitness routine for better sleep"
];

// 🧠 MOCK EMBEDDING (384 dimensions for Upstash compatibility)
function getEmbedding(text) {
  return Array(384)
    .fill(0)
    .map((_, i) => {
      const charCode = text.charCodeAt(i % text.length);
      return (charCode * (i + 7)) % 100 / 100;
    });
}

// 🧠 UPSERT FUNCTION
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

// 🧠 MAIN RUNNER
async function run() {
  for (let i = 0; i < data.length; i++) {
    const text = data[i];

    console.log(`Embedding: ${text}`);

    const embedding = getEmbedding(text);

    // ✅ SAFE UNIQUE ID (prevents duplicates)
    const id = `workout-${i + 1}`;

    await upsertVector(id, embedding, {
      text,
      category: "fitness",
    });

    console.log(`Inserted: ${text}`);
  }

  console.log("✅ DONE UPSERTING");
}

// 🚀 START
run();