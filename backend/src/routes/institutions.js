import { Router } from "express";
import { createClerkClient } from "@clerk/backend";
import { clerkAuth } from "../middleware/clerkAuth.js";
import { roleGuard } from "../middleware/roleGuard.js";
import prisma        from "../db/prisma.js";

const router = Router();
const clerk  = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// GET /institutions — list all institutions
router.get("/", clerkAuth, roleGuard("PROGRAMME_MANAGER", "MONITORING_OFFICER"), async (req, res, next) => {
  try {
    const institutions = await prisma.institution.findMany({
      include: { _count: { select: { batches: true, users: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(institutions);
  } catch (err) { next(err); }
});

// POST /institutions — Programme Manager creates an institution
router.post("/", clerkAuth, roleGuard("PROGRAMME_MANAGER"), async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const institution = await prisma.institution.create({ data: { name } });
    res.status(201).json(institution);
  } catch (err) { next(err); }
});

// DELETE /institutions/:id — Programme Manager deletes institution
router.delete("/:id", clerkAuth, roleGuard("PROGRAMME_MANAGER"), async (req, res, next) => {
  try {
    await prisma.institution.delete({ where: { id: req.params.id } });
    res.json({ message: "Institution deleted" });
  } catch (err) { next(err); }
});

// GET /institutions/users/all — list trainers + institution admins for assignment
router.get("/users/all", clerkAuth, roleGuard("PROGRAMME_MANAGER"), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where:   { role: { in: ["TRAINER", "INSTITUTION"] } },
      include: { institution: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) { next(err); }
});

// POST /institutions/:id/assign-user — assign a trainer/institution user to an institution
// Also updates Clerk publicMetadata.institutionId so frontend can read it from JWT
router.post("/:id/assign-user", clerkAuth, roleGuard("PROGRAMME_MANAGER"), async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const user = await prisma.user.update({
      where: { id: userId },
      data:  { institutionId: req.params.id },
    });

    // Also update Clerk publicMetadata so institutionId is in JWT
    await clerk.users.updateUserMetadata(user.clerkUserId, {
      publicMetadata: { role: user.role, institutionId: req.params.id },
    });

    res.json(user);
  } catch (err) { next(err); }
});

// GET /institutions/:id/summary — Programme Manager views one institution's summary
router.get("/:id/summary", clerkAuth, roleGuard("PROGRAMME_MANAGER"), async (req, res, next) => {
  try {
    const institution = await prisma.institution.findUnique({
      where:   { id: req.params.id },
      include: {
        batches: {
          include: {
            sessions:  { include: { attendance: { select: { status: true } } } },
            students:  { select: { studentId: true } },
            trainers:  { include: { trainer: { select: { name: true } } } },
          },
        },
      },
    });
    if (!institution) return res.status(404).json({ error: "Not found" });
    res.json(institution);
  } catch (err) { next(err); }
});

// GET /institutions/:id/batches — Institution admin views their own batches
router.get("/:id/batches", clerkAuth, roleGuard("INSTITUTION", "PROGRAMME_MANAGER"), async (req, res, next) => {
  try {
    // Scope check for INSTITUTION role: can only view their own institution
    if (req.auth.role === "INSTITUTION") {
      const user = await prisma.user.findUnique({ where: { clerkUserId: req.auth.clerkUserId } });
      if (user.institutionId !== req.params.id)
        return res.status(403).json({ error: "Access denied to this institution" });
    }

    const batches = await prisma.batch.findMany({
      where:   { institutionId: req.params.id },
      include: {
        trainers: { include: { trainer: { select: { id: true, name: true, email: true } } } },
        students: { select: { studentId: true } },
        _count:   { select: { sessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(batches);
  } catch (err) { next(err); }
});

export default router;
