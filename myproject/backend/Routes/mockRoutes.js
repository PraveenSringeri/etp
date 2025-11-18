// routes/mockRoutes.js
import express from "express";
import { MockTestResult } from "../models/index.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const { userId, score, total, duration } = req.body;
    const result = new MockTestResult({ userId, score, total, duration });
    await result.save();
    res.status(201).json({ message: "Mock test submitted", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const results = await MockTestResult.find({ userId: req.params.userId });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
