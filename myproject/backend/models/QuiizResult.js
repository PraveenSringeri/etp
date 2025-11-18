// models/QuizResult.js
import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("QuizResult", quizResultSchema);
