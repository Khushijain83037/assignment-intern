export const roleGuard = (...allowedRoles) => (req, res, next) => {
  if (!req.auth?.role) {
    return res.status(401).json({ error: "Unauthenticated" });
  }
  if (!allowedRoles.includes(req.auth.role)) {
    return res.status(403).json({
      error: `Forbidden. Required: ${allowedRoles.join(", ")}`,
    });
  }
  next();
};
