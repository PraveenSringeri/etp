// routes/messageRoutes.js
import express from "express";
import { Message } from "../models/index.js";

const router = express.Router();

// Post a new message
router.post("/", async (req, res) => {
  try {
    const { sender, content } = req.body;
    const msg = new Message({ sender, content });
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
