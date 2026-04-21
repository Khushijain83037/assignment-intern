import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { clerkAuth } from "../middleware/clerkAuth.js";
import { roleGuard } from "../middleware/roleGuard.js";
import prisma        from "../db/prisma.js";

const router = Router();

// POST /batches — create batch (Trainer, Institution, Manager)
router.post("/", clerkAuth, roleGuard("TRAINER", "INSTITUTION", "PROGRAMME_MANAGER"), async (req, res, next) => {
  try {
    const { name, institutionId } = req.body;
    if (!name || !institutionId)
      return res.status(400).json({ error: "name and institutionId required" });

    const batch = await prisma.batch.create({ data: { name, institutionId } });

    if (req.auth.role === "TRAINER") {
      const user = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });
      await prisma.batchTrainer.create({ data: { batchId: batch.id, trainerId: user.id } });
    }

    res.status(201).json(batch);
  } catch (err) { next(err); }
});

// GET /batches/my — Trainer gets their own batches
router.get("/my", clerkAuth, roleGuard("TRAINER"), async (req, res, next) => {
  try {
    const trainer = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });
    const batchTrainers = await prisma.batchTrainer.findMany({
      where: { trainerId: trainer.id },
      include: {
        batch: {
          include: {
            students: { select: { studentId: true } },
            _count: { select: { sessions: true } },
          },
        },
      },
    });
    res.json(batchTrainers.map((bt) => bt.batch));
  } catch (err) { next(err); }
});

// DELETE /batches/:id — Institution or Manager deletes batch
router.delete("/:id", clerkAuth, roleGuard("INSTITUTION", "PROGRAMME_MANAGER"), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });
    const batch = await prisma.batch.findUnique({ where: { id: req.params.id } });
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    // Scope: institution can only delete their own batches
    if (req.auth.role === "INSTITUTION" && user.institutionId !== batch.institutionId)
      return res.status(403).json({ error: "Not your institution's batch" });

    await prisma.batch.delete({ where: { id: req.params.id } });
    res.json({ message: "Batch deleted" });
  } catch (err) { next(err); }
});

// POST /batches/join-by-code — Student joins via invite code
router.post("/join-by-code", clerkAuth, roleGuard("STUDENT"), async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ error: "inviteCode required" });

    const batch = await prisma.batch.findUnique({ where: { inviteCode } });
    if (!batch) return res.status(400).json({ error: "Invalid invite code" });

    const user = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });
    await prisma.batchStudent.upsert({
      where:  { batchId_studentId: { batchId: batch.id, studentId: user.id } },
      update: {},
      create: { batchId: batch.id, studentId: user.id },
    });

    res.json({ message: "Joined successfully", batch });
  } catch (err) { next(err); }
});

// POST /batches/:id/invite — Trainer generates invite (own batch only)
router.post("/:id/invite", clerkAuth, roleGuard("TRAINER"), async (req, res, next) => {
  try {
    const trainer = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });
    const membership = await prisma.batchTrainer.findUnique({
      where: { batchId_trainerId: { batchId: req.params.id, trainerId: trainer.id } },
    });
    if (!membership)
      return res.status(403).json({ error: "You are not a trainer for this batch" });

    const inviteCode = uuidv4();
    const batch = await prisma.batch.update({ where: { id: req.params.id }, data: { inviteCode } });
    const inviteUrl = `${process.env.FRONTEND_URL}/join?code=${inviteCode}`;
    res.json({ inviteCode, inviteUrl, batchId: batch.id });
  } catch (err) { next(err); }
});

// POST /batches/:id/join — Student joins via batch ID + code
router.post("/:id/join", clerkAuth, roleGuard("STUDENT"), async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const batch = await prisma.batch.findUnique({ where: { id: req.params.id } });
    if (!batch || batch.inviteCode !== inviteCode)
      return res.status(400).json({ error: "Invalid invite code" });

    const user = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });
    await prisma.batchStudent.upsert({
      where:  { batchId_studentId: { batchId: batch.id, studentId: user.id } },
      update: {},
      create: { batchId: batch.id, studentId: user.id },
    });

    res.json({ message: "Joined successfully", batch });
  } catch (err) { next(err); }
});

// GET /batches/:id/summary — Institution views their batch summary
router.get("/:id/summary", clerkAuth, roleGuard("INSTITUTION"), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });
    const batch = await prisma.batch.findUnique({
      where: { id: req.params.id },
      include: {
        students: { include: { student: { select: { id: true, name: true, email: true } } } },
        trainers: { include: { trainer: { select: { id: true, name: true, email: true } } } },
        sessions: { include: { attendance: { select: { status: true } } } },
      },
    });
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    if (user.institutionId && batch.institutionId !== user.institutionId)
      return res.status(403).json({ error: "Not your institution's batch" });

    let total = 0, present = 0;
    batch.sessions.forEach((s) => s.attendance.forEach((a) => {
      total++;
      if (a.status !== "ABSENT") present++;
    }));

    res.json({ ...batch, attendanceRate: total > 0 ? ((present / total) * 100).toFixed(1) + "%" : "N/A" });
  } catch (err) { next(err); }
});

export default router;
