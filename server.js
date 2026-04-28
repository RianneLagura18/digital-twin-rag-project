const express = require("express");
const cors = require("cors");
require("dotenv").config();
// ✅ ADD THIS (TEST ONLY)
console.log("UPSTASH URL:", process.env.UPSTASH_VECTOR_REST_URL);
console.log("UPSTASH TOKEN EXISTS:", !!process.env.UPSTASH_VECTOR_REST_TOKEN);

const app = express();

app.use(cors());
app.use(express.json());

// routes
const chatRoutes = require("./routes/chat");
app.use("/api/chat", chatRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});