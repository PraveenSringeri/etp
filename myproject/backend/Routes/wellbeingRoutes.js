// routes/wellbeingRoutes.js
import express from "express";
import { WellbeingCheck } from "../models/index.js";

const router = express.Router();

// Add new wellbeing check
router.post("/add", async (req, res) => {
  try {
    const { userId, mood, note } = req.body;
    const entry = new WellbeingCheck({ userId, mood, note });
    await entry.save();
    res.status(201).json({ message: "Wellbeing check saved", entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all wellbeing checks for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const checks = await WellbeingCheck.find({ userId: req.params.userId });
    res.json(checks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
