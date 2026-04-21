import Layout from "../../components/shared/Layout.jsx";
import { Card, Badge, Spinner, ErrorMsg, StatCard, EmptyState } from "../../components/ui/index.jsx";
import { useFetch } from "../../hooks/useApi.js";

export default function MonitoringDashboard() {
  const { data, loading, error } = useFetch("/programme/summary");
  const s = data?.summary ?? [];

  const totals = {
    institutions: s.length,
    batches:      s.reduce((a, i) => a + i.totalBatches, 0),
    sessions:     s.reduce((a, i) => a + i.totalSessions, 0),
    attendance:   s.reduce((a, i) => a + i.totalAttendance, 0),
  };

  function rateColor(rate) {
    const n = parseFloat(rate);
    if (isNaN(n)) return "muted";
    if (n >= 75) return "green";
    if (n >= 50) return "orange";
    return "red";
  }

  return (
    <Layout title="Programme Monitor" subtitle="Read-only view of programme-wide attendance">

      {/* Read-only banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", borderRadius: 10,
        background: "var(--orange-bg)", border: "1px solid #f59e0b20",
        marginBottom: 24, fontSize: 13, color: "var(--orange)",
      }} className="fade-up">
        <span>👁️</span>
        <span><strong>Read-only access</strong> — You can view all data but cannot create, edit, or delete anything.</span>
      </div>

      <ErrorMsg message={error} />
      {loading && <Spinner />}

      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }} className="fade-up stagger-1">
          <StatCard label="Institutions"       value={totals.institutions} icon="🏛️" color="blue" />
          <StatCard label="Total Batches"      value={totals.batches}      icon="📚" color="accent" />
          <StatCard label="Total Sessions"     value={totals.sessions}     icon="📅" color="orange" />
          <StatCard label="Attendance Records" value={totals.attendance}   icon="✅" color="green" />
        </div>
      )}

      {!loading && s.length === 0 && (
        <EmptyState icon="📊" title="No programme data yet" subtitle="Data will appear here as institutions and sessions are created." />
      )}

      {s.map((inst, i) => (
        <div key={inst.institutionId} className={`fade-up stagger-${Math.min(i + 2, 5)}`} style={{ marginBottom: 12 }}>
          <Card style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{inst.institutionName}</h3>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text2)", flexWrap: "wrap" }}>
                  <span>📚 {inst.totalBatches} batches</span>
                  <span>📅 {inst.totalSessions} sessions</span>
                  <span>📋 {inst.totalAttendance} records</span>
                </div>
              </div>
              <Badge color={rateColor(inst.presentRate)}>{inst.presentRate} attendance</Badge>
            </div>

            {inst.totalAttendance > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ height: 4, background: "var(--bg3)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    width: inst.presentRate,
                    background: parseFloat(inst.presentRate) >= 75 ? "var(--green)" : parseFloat(inst.presentRate) >= 50 ? "var(--orange)" : "var(--red)",
                  }} />
                </div>
              </div>
            )}
          </Card>
        </div>
      ))}
    </Layout>
  );
}
