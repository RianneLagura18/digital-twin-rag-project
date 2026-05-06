// Simple deterministic embedding (FREE version for demo)
function embed(text) {
  const vector = new Array(384).fill(0);

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    vector[i % 384] += charCode / 100;
  }

  return vector;
}

module.exports = embed;