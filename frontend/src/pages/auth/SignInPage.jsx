import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return <AuthShell><SignIn afterSignInUrl="/" routing="hash" /></AuthShell>;
}

export function AuthShell({ children }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "var(--bg)",
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 80px",
        background: "linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%)",
        borderRight: "1px solid var(--border)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "20%", left: "10%",
          width: 300, height: 300, borderRadius: "50%",
          background: "var(--accent)", opacity: 0.04, filter: "blur(80px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "5%",
          width: 200, height: 200, borderRadius: "50%",
          background: "#a855f7", opacity: 0.05, filter: "blur(60px)",
          pointerEvents: "none",
        }} />

        <div className="fade-up">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, var(--accent), #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, boxShadow: "0 0 24px var(--accent-bg)",
            }}>⚡</div>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
              SkillBridge
            </span>
          </div>

          <h1 style={{
            fontSize: 42, fontWeight: 800, lineHeight: 1.15,
            letterSpacing: "-0.04em", marginBottom: 16,
          }}>
            Attendance<br />
            <span style={{ color: "var(--accent2)" }}>Reimagined.</span>
          </h1>

          <p style={{ fontSize: 16, color: "var(--text2)", lineHeight: 1.7, maxWidth: 380 }}>
            A modern platform for state-level skilling programmes.
            Track attendance, manage batches, and gain real-time insights.
          </p>

          <div style={{ display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap" }}>
            {["5 Roles", "Real-time Data", "Invite Links", "Analytics"].map((f) => (
              <div key={f} style={{
                padding: "6px 14px", borderRadius: 999,
                background: "var(--bg3)", border: "1px solid var(--border2)",
                fontSize: 12, fontWeight: 600, color: "var(--text2)",
              }}>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 480, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 40,
        background: "var(--bg)",
      }}>
        <div style={{ width: "100%" }} className="fade-up stagger-1">
          {children}
        </div>
      </div>
    </div>
  );
}
