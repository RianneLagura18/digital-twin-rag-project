import express from "express";

const router = express.Router();

// Simple fitness response logic (fallback if no RAG)
function generateWorkoutResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes("leg")) {
    return `🏋️ Beginner Leg Workout:
- Squats (3x10)
- Lunges (3x10 each leg)
- Wall sit (30s)
💡 Tip: Focus on form before weight.`;
  }

  if (msg.includes("chest")) {
    return `🏋️ Chest Workout:
- Push-ups (3x10)
- Dumbbell press (3x10)
- Chest fly (3x12)`;
  }

  return `💪 Workout Tip:
Tell me a muscle group (legs, chest, back) for a custom plan.`;
}

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const reply = generateWorkoutResponse(message);

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;