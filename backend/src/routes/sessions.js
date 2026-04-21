import { Router } from "express";
import { clerkAuth } from "../middleware/clerkAuth.js";
import { roleGuard } from "../middleware/roleGuard.js";
import prisma        from "../db/prisma.js";

const router = Router();

// POST /sessions — Trainer creates session only for their own batches
router.post("/", clerkAuth, roleGuard("TRAINER"), async (req, res, next) => {
  try {
    const { title, date, startTime, endTime, batchId } = req.body;
    if (!title || !date || !startTime || !endTime || !batchId)
      return res.status(400).json({ error: "All fields required" });

    const trainer = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });

    // Ownership check: trainer must be assigned to this batch
    const membership = await prisma.batchTrainer.findUnique({
      where: { batchId_trainerId: { batchId, trainerId: trainer.id } },
    });
    if (!membership)
      return res.status(403).json({ error: "You are not a trainer for this batch" });

    const session = await prisma.session.create({
      data: { title, date: new Date(date), startTime, endTime, batchId, trainerId: trainer.id },
    });
    res.status(201).json(session);
  } catch (err) { next(err); }
});

// GET /sessions/my — Student's enrolled sessions
router.get("/my", clerkAuth, roleGuard("STUDENT"), async (req, res, next) => {
  try {
    const student = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });
    const enrolled = await prisma.batchStudent.findMany({
      where: { studentId: student.id }, select: { batchId: true },
    });
    const batchIds = enrolled.map((b) => b.batchId);

    const sessions = await prisma.session.findMany({
      where:   { batchId: { in: batchIds } },
      include: {
        batch:   true,
        trainer: { select: { name: true } },
        attendance: { where: { studentId: student.id }, select: { status: true, markedAt: true } },
      },
      orderBy: { date: "asc" },
    });
    res.json(sessions);
  } catch (err) { next(err); }
});

// GET /sessions/trainer — Trainer's own sessions only
router.get("/trainer", clerkAuth, roleGuard("TRAINER"), async (req, res, next) => {
  try {
    const trainer = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });
    const sessions = await prisma.session.findMany({
      where:   { trainerId: trainer.id },
      include: { batch: true, attendance: { select: { status: true } } },
      orderBy: { date: "desc" },
    });
    res.json(sessions);
  } catch (err) { next(err); }
});

// GET /sessions/:id/attendance — Trainer can only view attendance for their own sessions
router.get("/:id/attendance", clerkAuth, roleGuard("TRAINER"), async (req, res, next) => {
  try {
    const trainer = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });

    // Ownership check: session must belong to this trainer
    const session = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.trainerId !== trainer.id)
      return res.status(403).json({ error: "You do not own this session" });

    const attendance = await prisma.attendance.findMany({
      where:   { sessionId: req.params.id },
      include: { student: { select: { id: true, name: true, email: true } } },
    });
    res.json(attendance);
  } catch (err) { next(err); }
});

export default router;
