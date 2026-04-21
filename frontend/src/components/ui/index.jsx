export function Card({ children, style, className = "" }) {
  return (
    <div className={`fade-up ${className}`} style={{
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: 24,
      marginBottom: 16,
      transition: "border-color 0.2s",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, type = "button", variant = "primary", disabled, style, size = "md" }) {
  const sizes = {
    sm: { padding: "6px 14px", fontSize: 13 },
    md: { padding: "10px 20px", fontSize: 14 },
    lg: { padding: "13px 28px", fontSize: 15 },
  };
  const variants = {
    primary:   { background: "var(--accent)", color: "#fff", border: "none", boxShadow: "0 0 20px var(--accent-bg)" },
    secondary: { background: "var(--bg3)", color: "var(--text)", border: "1px solid var(--border2)" },
    ghost:     { background: "transparent", color: "var(--text2)", border: "1px solid var(--border)" },
    danger:    { background: "var(--red-bg)", color: "var(--red)", border: "1px solid #f43f5e30" },
    success:   { background: "var(--green-bg)", color: "var(--green)", border: "1px solid #22d3a530" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...sizes[size], ...variants[variant],
      borderRadius: 8, fontWeight: 600,
      fontFamily: "'Sora', sans-serif",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "all 0.15s ease",
      whiteSpace: "nowrap",
      ...style,
    }}>
      {children}
    </button>
  );
}

export function Badge({ children, color = "accent" }) {
  const colors = {
    accent:  { background: "var(--accent-bg)",  color: "var(--accent2)" },
    green:   { background: "var(--green-bg)",   color: "var(--green)" },
    orange:  { background: "var(--orange-bg)",  color: "var(--orange)" },
    red:     { background: "var(--red-bg)",     color: "var(--red)" },
    blue:    { background: "var(--blue-bg)",    color: "var(--blue)" },
    muted:   { background: "var(--bg3)",        color: "var(--text2)" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 700,
      letterSpacing: "0.04em", textTransform: "uppercase",
      ...colors[color],
    }}>
      {children}
    </span>
  );
}

export function Spinner({ size = 28 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <div style={{
        width: size, height: size,
        border: "2px solid var(--border2)",
        borderTopColor: "var(--accent)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
    </div>
  );
}

export function ErrorMsg({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: "var(--red-bg)", color: "var(--red)",
      border: "1px solid #f43f5e25",
      padding: "12px 16px", borderRadius: 10,
      fontSize: 13, marginBottom: 16,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span>⚠</span> {message}
    </div>
  );
}

export function Input({ label, hint, ...props }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      {label && (
        <span style={{
          display: "block", marginBottom: 6,
          fontSize: 13, fontWeight: 600, color: "var(--text2)",
          letterSpacing: "0.02em",
        }}>
          {label}
        </span>
      )}
      <input style={{
        width: "100%", padding: "10px 14px",
        background: "var(--bg3)",
        border: "1px solid var(--border2)",
        borderRadius: 8, fontSize: 14,
        color: "var(--text)",
        outline: "none", boxSizing: "border-box",
        transition: "border-color 0.2s",
      }}
        onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
        onBlur={(e)  => e.target.style.borderColor = "var(--border2)"}
        {...props}
      />
      {hint && <span style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, display: "block" }}>{hint}</span>}
    </label>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      {label && (
        <span style={{
          display: "block", marginBottom: 6,
          fontSize: 13, fontWeight: 600, color: "var(--text2)",
        }}>
          {label}
        </span>
      )}
      <select style={{
        width: "100%", padding: "10px 14px",
        background: "var(--bg3)",
        border: "1px solid var(--border2)",
        borderRadius: 8, fontSize: 14,
        color: "var(--text)", outline: "none",
        boxSizing: "border-box",
        cursor: "pointer",
      }} {...props}>
        {children}
      </select>
    </label>
  );
}

export function StatCard({ label, value, color = "accent", icon }) {
  const colors = {
    accent: "var(--accent)", green: "var(--green)",
    orange: "var(--orange)", blue: "var(--blue)", red: "var(--red)",
  };
  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "20px 24px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: colors[color], opacity: 0.7,
      }} />
      {icon && <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>}
      <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 6, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
        {value}
      </div>
    </div>
  );
}

export function EmptyState({ icon = "📭", title, subtitle }) {
  return (
    <div style={{
      textAlign: "center", padding: "48px 24px",
      color: "var(--text3)",
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13 }}>{subtitle}</div>}
    </div>
  );
}

export function Table({ headers, rows, emptyMsg = "No data yet" }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--border)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: "10px 16px", textAlign: "left",
                fontWeight: 600, color: "var(--text2)",
                fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ padding: 32, textAlign: "center", color: "var(--text3)" }}>
                {emptyMsg}
              </td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{
              borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
              transition: "background 0.15s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg3)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "12px 16px", color: "var(--text)", verticalAlign: "middle" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
