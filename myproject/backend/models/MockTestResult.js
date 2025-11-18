// models/MockTestResult.js
import mongoose from "mongoose";

const mockTestResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  duration: { type: Number, default: 300 }, // seconds (5 mins)
  date: { type: Date, default: Date.now }
});

export default mongoose.model("MockTestResult", mockTestResultSchema);
