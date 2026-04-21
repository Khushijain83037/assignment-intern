import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";

const ROLE_META = {
  STUDENT:            { label: "Student",            icon: "🎓", color: "var(--green)" },
  TRAINER:            { label: "Trainer",             icon: "🏋️", color: "var(--accent2)" },
  INSTITUTION:        { label: "Institution",         icon: "🏛️", color: "var(--blue)" },
  PROGRAMME_MANAGER:  { label: "Programme Manager",   icon: "📊", color: "var(--orange)" },
  MONITORING_OFFICER: { label: "Monitoring Officer",  icon: "👁️", color: "var(--red)" },
};

const NAV = {
  STUDENT:            [{ path: "/dashboard/student",      label: "My Sessions",  icon: "📅" }],
  TRAINER:            [{ path: "/dashboard/trainer",      label: "Dashboard",    icon: "⚡" }],
  INSTITUTION:        [{ path: "/dashboard/institution",  label: "Dashboard",    icon: "🏛️" }],
  PROGRAMME_MANAGER:  [{ path: "/dashboard/manager",      label: "Overview",     icon: "📈" }],
  MONITORING_OFFICER: [{ path: "/dashboard/monitoring",   label: "Monitor",      icon: "👁️" }],
};

export default function Layout({ children, title, subtitle }) {
  const { user }    = useUser();
  const { signOut } = useClerk();
  const navigate    = useNavigate();
  const location    = useLocation();
  const role        = user?.publicMetadata?.role || "";
  const meta        = ROLE_META[role] || {};

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: "var(--bg2)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        padding: "0", flexShrink: 0, position: "sticky",
        top: 0, height: "100vh", overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent), #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, boxShadow: "0 0 16px var(--accent-bg)",
            }}>
              ⚡
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>
              SkillBridge
            </span>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10,
            background: "var(--bg3)", border: "1px solid var(--border)",
          }}>
            <span style={{ fontSize: 18 }}>{meta.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, marginBottom: 1 }}>
                SIGNED IN AS
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>
                {meta.label}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {(NAV[role] || []).map((link) => {
            const active = location.pathname === link.path;
            return (
              <button key={link.path} onClick={() => navigate(link.path)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, marginBottom: 4,
                background: active ? "var(--accent-bg)" : "transparent",
                border: active ? "1px solid #6c63ff30" : "1px solid transparent",
                color: active ? "var(--accent2)" : "var(--text2)",
                fontSize: 14, fontWeight: active ? 600 : 500,
                cursor: "pointer", transition: "all 0.15s", textAlign: "left",
              }}>
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
              {user?.fullName || user?.firstName}
            </div>
            <div style={{
              fontSize: 11, color: "var(--text3)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
          <button onClick={() => signOut(() => navigate("/sign-in"))} style={{
            width: "100%", padding: "8px 12px",
            background: "var(--bg3)", border: "1px solid var(--border)",
            borderRadius: 8, color: "var(--text2)", fontSize: 13,
            fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
            fontFamily: "'Sora', sans-serif",
          }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", padding: "32px 36px", maxWidth: "calc(100vw - 240px)" }}>
        {(title || subtitle) && (
          <div style={{ marginBottom: 28 }} className="fade-up">
            {title && (
              <h1 style={{
                fontSize: 26, fontWeight: 800,
                letterSpacing: "-0.03em", color: "var(--text)",
                marginBottom: subtitle ? 6 : 0,
              }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p style={{ fontSize: 14, color: "var(--text2)" }}>{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
