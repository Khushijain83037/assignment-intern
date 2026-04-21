import { useState } from "react";
import { SignUp, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { ROLE_PATHS } from "../../App.jsx";
import { AuthShell } from "./SignInPage.jsx";
import { Button, ErrorMsg } from "../../components/ui/index.jsx";

const ROLES = [
  { value: "STUDENT",            label: "Student",            icon: "🎓", desc: "Mark attendance & view sessions" },
  { value: "TRAINER",            label: "Trainer",            icon: "🏋️", desc: "Create sessions & manage batches" },
  { value: "INSTITUTION",        label: "Institution Admin",  icon: "🏛️", desc: "Oversee batches & trainers" },
  { value: "PROGRAMME_MANAGER",  label: "Programme Manager",  icon: "📊", desc: "Cross-institution analytics" },
  { value: "MONITORING_OFFICER", label: "Monitoring Officer", icon: "👁️", desc: "Read-only programme overview" },
];

export default function SignUpPage() {
  return <AuthShell><SignUp afterSignUpUrl="/onboard" routing="hash" /></AuthShell>;
}

export function OnboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [role,    setRole]    = useState("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  if (!isLoaded) return null;
  if (!isSignedIn) { navigate("/sign-in"); return null; }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const name  = user.fullName ||
                    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    "User";
      const email = user.primaryEmailAddress?.emailAddress;

      console.log("Syncing:", { name, email, role });
      const res = await api.post("/users/sync", { name, email, role });
      console.log("Sync OK:", res.data);

      // Reload Clerk session so publicMetadata.role is immediately available
      await user.reload();

      navigate(ROLE_PATHS[role]);
    } catch (err) {
      console.error("Sync error:", err?.response?.data || err.message);
      const msg = err?.response?.data?.error || err.message || "Setup failed. Please try again.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 520 }} className="fade-up">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px",
            background: "linear-gradient(135deg, var(--accent), #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, boxShadow: "0 0 28px var(--accent-bg)",
          }}>⚡</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
            Choose your role
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>
            Hi {user.firstName}! Select how you'll use SkillBridge.
          </p>
        </div>

        <ErrorMsg message={error} />

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {ROLES.map((r) => (
              <label key={r.value} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                background: role === r.value ? "var(--accent-bg)" : "var(--bg2)",
                border: `1px solid ${role === r.value ? "#6c63ff40" : "var(--border)"}`,
                transition: "all 0.15s",
              }}>
                <input
                  type="radio" name="role" value={r.value}
                  checked={role === r.value}
                  onChange={() => setRole(r.value)}
                  style={{ display: "none" }}
                />
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: role === r.value ? "var(--accent-bg)" : "var(--bg3)",
                  border: `1px solid ${role === r.value ? "#6c63ff30" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                }}>
                  {r.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: role === r.value ? "var(--accent2)" : "var(--text)",
                  }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                    {r.desc}
                  </div>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${role === r.value ? "var(--accent)" : "var(--border2)"}`,
                  background: role === r.value ? "var(--accent)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {role === r.value && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                  )}
                </div>
              </label>
            ))}
          </div>

          <Button type="submit" disabled={loading} size="lg" style={{ width: "100%" }}>
            {loading ? "Setting up…" : "Continue to Dashboard →"}
          </Button>
        </form>
      </div>
    </div>
  );
}