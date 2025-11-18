// models/WellbeingCheck.js
import mongoose from "mongoose";

const wellbeingCheckSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mood: { type: String, enum: ["happy", "neutral", "stressed", "tired"], required: true },
  note: { type: String },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("WellbeingCheck", wellbeingCheckSchema);
