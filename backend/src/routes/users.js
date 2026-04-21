import { Router } from "express";
import { createClerkClient } from "@clerk/backend";
import { clerkAuth } from "../middleware/clerkAuth.js";
import prisma from "../db/prisma.js";

const router = Router();
const clerk  = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const VALID_ROLES = [
  "STUDENT", "TRAINER", "INSTITUTION",
  "PROGRAMME_MANAGER", "MONITORING_OFFICER",
];

// POST /users/sync — called once after signup
router.post("/sync", clerkAuth, async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const { clerkUserId } = req.auth;

    if (!VALID_ROLES.includes(role))
      return res.status(400).json({ error: "Invalid role" });

    const user = await prisma.user.upsert({
      where:  { clerkUserId },
      update: { name, email },
      create: { clerkUserId, name, email, role },
    });

    // Store role in Clerk publicMetadata for JWT claims
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { role },
    });

    res.status(201).json(user);
  } catch (err) { next(err); }
});

// GET /users/me — returns full user including institutionId from DB (not Clerk metadata)
router.get("/me", clerkAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where:   { clerkUserId: req.auth.clerkUserId },
      include: { institution: { select: { id: true, name: true } } },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) { next(err); }
});

export default router;
