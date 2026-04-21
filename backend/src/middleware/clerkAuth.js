import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function clerkAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = header.split(" ")[1];

  try {
    // Decode JWT without verifying — extract the sub (Clerk user ID)
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");

    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));

    if (!decoded.sub) throw new Error("No sub claim in token");

    // Check token is not expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return res.status(401).json({ error: "Token expired" });
    }

    // Fetch user from Clerk API to get publicMetadata (role)
    const clerkUser = await clerk.users.getUser(decoded.sub);

    req.auth = {
      clerkUserId: decoded.sub,
      role: clerkUser.publicMetadata?.role,
    };

    next();
  } catch (err) {
    console.error("clerkAuth error:", err.message);
    return res.status(401).json({ error: "Authentication failed: " + err.message });
  }
}
