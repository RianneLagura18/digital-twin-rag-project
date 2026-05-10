// ===============================
// FREE CONSISTENT EMBEDDING (IMPORTANT)
// ===============================
export default function embed(text) {
  const clean = (text || "").toLowerCase();

  const vector = new Array(384).fill(0);

  for (let i = 0; i < clean.length; i++) {
    vector[i % 384] += clean.charCodeAt(i) * 0.01;
  }

  const length = Math.max(clean.length, 1);

  return vector.map(v => v / length);
}