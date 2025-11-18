// server.js
import express from "express";
import cors from "cors";
import connectDB from "./db.js";

import userRoutes from "./routes/userRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import mockRoutes from "./routes/mockRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import wellbeingRoutes from "./routes/wellbeingRoutes.js";

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/mock", mockRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/wellbeing", wellbeingRoutes);

app.get("/", (req, res) => {
  res.send("✅ ProWellbeing Backend Running");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
