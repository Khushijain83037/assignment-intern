import { Router } from "express";
import { clerkAuth } from "../middleware/clerkAuth.js";
import { roleGuard } from "../middleware/roleGuard.js";
import prisma        from "../db/prisma.js";

const router = Router();

router.post("/mark", clerkAuth, roleGuard("STUDENT"), async (req, res, next) => {
  try {
    const { sessionId, status } = req.body;
    if (!sessionId || !status)
      return res.status(400).json({ error: "sessionId and status required" });
    if (!["PRESENT", "LATE"].includes(status))
      return res.status(400).json({ error: "Status must be PRESENT or LATE" });

    const student = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) return res.status(404).json({ error: "Session not found" });

    const enrolled = await prisma.batchStudent.findUnique({
      where: { batchId_studentId: { batchId: session.batchId, studentId: student.id } },
    });
    if (!enrolled) return res.status(403).json({ error: "Not enrolled in this batch" });

    const attendance = await prisma.attendance.upsert({
      where:  { sessionId_studentId: { sessionId, studentId: student.id } },
      update: { status, markedAt: new Date() },
      create: { sessionId, studentId: student.id, status },
    });
    res.status(201).json(attendance);
  } catch (err) { next(err); }
});

export default router;
