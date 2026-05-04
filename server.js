import express from "express";
import chatRoutes from "./routes/chat.js";

const app = express();

// ===============================
// ⚠️ LOCAL DEVELOPMENT ONLY FILE
// NOT USED IN VERCEL DEPLOYMENT
// PRODUCTION USES /api/chat.js ONLY
// ===============================

app.use(express.json());

// routes
app.use("/api/chat", chatRoutes);

// health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Digital Twin RAG API is running",
  });
});

// start server
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;