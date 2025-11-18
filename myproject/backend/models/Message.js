// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // e.g. "Student123"
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);
