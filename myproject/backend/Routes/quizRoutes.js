// routes/quizRoutes.js
import express from "express";
import { QuizResult } from "../models/index.js";

const router = express.Router();

// Submit quiz result
router.post("/submit", async (req, res) => {
  try {
    const { userId, score, total } = req.body;
    const result = new QuizResult({ userId, score, total });
    await result.save();
    res.status(201).json({ message: "Quiz result saved", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all quiz results for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.params.userId });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
