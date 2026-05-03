const express = require("express");
const app = express();

const chatRoutes = require("./routes/chat");

// middleware
app.use(express.json());

// routes
app.use("/api/chat", chatRoutes);

// health check (IMPORTANT for Vercel testing)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Digital Twin RAG API is running"
  });
});

// IMPORTANT: export for Vercel
module.exports = app;

// ONLY RUN LOCALLY (NOT VERCEL)
if (require.main === module) {
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}