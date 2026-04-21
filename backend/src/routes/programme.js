import { Router } from "express";
import { clerkAuth } from "../middleware/clerkAuth.js";
import { roleGuard } from "../middleware/roleGuard.js";
import prisma        from "../db/prisma.js";

const router = Router();

router.get("/summary", clerkAuth, roleGuard("PROGRAMME_MANAGER", "MONITORING_OFFICER"), async (req, res, next) => {
  try {
    const institutions = await prisma.institution.findMany({
      include: {
        batches: {
          include: {
            sessions: { include: { attendance: { select: { status: true } } } },
            _count: { select: { students: true } },
          },
        },
      },
    });

    const summary = institutions.map((inst) => {
      let totalSessions = 0, totalAttendance = 0, totalPresent = 0;
      inst.batches.forEach((b) => b.sessions.forEach((s) => {
        totalSessions++;
        s.attendance.forEach((a) => {
          totalAttendance++;
          if (a.status !== "ABSENT") totalPresent++;
        });
      }));
      return {
        institutionId:   inst.id,
        institutionName: inst.name,
        totalBatches:    inst.batches.length,
        totalSessions,
        totalAttendance,
        presentRate: totalAttendance > 0
          ? ((totalPresent / totalAttendance) * 100).toFixed(1) + "%"
          : "N/A",
      };
    });

    res.json({ summary, generatedAt: new Date() });
  } catch (err) { next(err); }
});

export default router;
