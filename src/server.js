import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5052;

app.use(cors());
app.use(express.json());

// ===============================
// BACKUP API LAYER (SAFE)
// ===============================
app.get("/", (req, res) => {
  res.send("src/server.js is active (backup API layer)");
});

// ===============================
// OPTIONAL MCP FORWARDING PLACEHOLDER
// (DO NOT BREAK MCP LOGIC)
// ===============================
// Future use only

app.listen(PORT, () => {
  console.log(`src/server running on http://localhost:${PORT}`);
});