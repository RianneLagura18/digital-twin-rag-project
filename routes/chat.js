const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { message } = req.body;

  // validation
  if (!message) {
    return res.status(400).json({
      success: false,
      error: "Message is required"
    });
  }

  // simple chatbot logic (Week 6 requirement)
  let botReply = "I don't understand.";

  if (message.toLowerCase().includes("hello")) {
    botReply = "Hi! 👋 Welcome to AusBiz Fitness Center.";
  } 
  else if (message.toLowerCase().includes("price")) {
    botReply = "Membership starts at ₱999/month.";
  } 
  else if (message.toLowerCase().includes("schedule")) {
    botReply = "We are open daily from 6AM to 10PM.";
  }

  return res.json({
    success: true,
    userMessage: message,
    botReply
  });
});

module.exports = router;