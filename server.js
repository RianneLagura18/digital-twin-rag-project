import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mcpApp from "./src/server.js";

dotenv.config();

const app = express();

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());

// =========================
// HEALTH CHECK
// =========================
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// =========================
// MCP ROUTE MOUNT
// =========================
app.use("/mcp", mcpApp);

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});