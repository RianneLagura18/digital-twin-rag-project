import { pipeline } from "@xenova/transformers";

// Load model once (IMPORTANT)
const extractor = await pipeline(
  "feature-extraction",
  "Xenova/bge-small-en-v1.5"
);

// ===============================
// REAL EMBEDDING FUNCTION
// ===============================
export default async function embed(text) {
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}