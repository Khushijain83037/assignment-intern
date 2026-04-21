import "dotenv/config";
import express from "express";
import cors from "cors";

import userRoutes        from "./routes/users.js";
import batchRoutes       from "./routes/batches.js";
import sessionRoutes     from "./routes/sessions.js";
import attendanceRoutes  from "./routes/attendance.js";
import institutionRoutes from "./routes/institutions.js";
import programmeRoutes   from "./routes/programme.js";

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  credentials: true,
}));
app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ status: "ok", ts: new Date() })
);

app.use("/users",        userRoutes);
app.use("/batches",      batchRoutes);
app.use("/sessions",     sessionRoutes);
app.use("/attendance",   attendanceRoutes);
app.use("/institutions", institutionRoutes);
app.use("/programme",    programmeRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
