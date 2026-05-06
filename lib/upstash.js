import { Index } from "@upstash/vector";
import dotenv from "dotenv";

dotenv.config();

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// =========================
// SEARCH FUNCTION (THIS FIXES YOUR ERROR)
// =========================
export async function searchVectors(query) {
  try {
    const results = await index.query({
      data: query,
      topK: 5,
      includeMetadata: true,
    });

    return results;
  } catch (err) {
    console.error("Vector search error:", err);
    return [];
  }
}