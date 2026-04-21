import { useState } from "react";
import Layout from "../../components/shared/Layout.jsx";
import { Card, Badge, Spinner, ErrorMsg, StatCard, EmptyState, Button, Input, Table } from "../../components/ui/index.jsx";
import { useFetch, useMutation } from "../../hooks/useApi.js";
import api from "../../lib/api.js";

export default function ManagerDashboard() {
  const { data: summary, loading: sumLoading, error: sumError, refetch: refetchSummary } = useFetch("/programme/summary");
  const { data: institutions, loading: instLoading, refetch: refetchInst } = useFetch("/institutions");
  const { data: users, loading: usersLoading, refetch: refetchUsers } = useFetch("/institutions/users/all");

  const { mutate: createInst, loading: creating, error: createErr } = useMutation("post", "/institutions");
  const { mutate: deleteInst } = useMutation("delete", "/institutions");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [instName, setInstName]             = useState("");
  const [showAssign, setShowAssign]         = useState(null); // institutionId being assigned
  const [assignUserId, setAssignUserId]     = useState("");
  const [assignMsg, setAssignMsg]           = useState({});

  const s = summary?.summary ?? [];
  const totals = {
    institutions: s.length,
    batches:      s.reduce((a, i) => a + i.totalBatches,    0),
    sessions:     s.reduce((a, i) => a + i.totalSessions,   0),
    attendance:   s.reduce((a, i) => a + i.totalAttendance, 0),
  };

  function rateColor(rate) {
    const n = parseFloat(rate);
    if (isNaN(n)) return "muted";
    if (n >= 75)  return "green";
    if (n >= 50)  return "orange";
    return "red";
  }

  async function handleCreateInst(e) {
    e.preventDefault();
    await createInst({ name: instName });
    setInstName(""); setShowCreateForm(false);
    refetchInst(); refetchSummary();
  }

  async function handleDeleteInst(id) {
    if (!confirm("Delete this institution? This cannot be undone.")) return;
    try {
      await api.delete(`/institutions/${id}`);
      refetchInst(); refetchSummary();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  }

  async function handleAssign(institutionId) {
    if (!assignUserId) return;
    try {
      await api.post(`/institutions/${institutionId}/assign-user`, { userId: assignUserId });
      setAssignMsg((m) => ({ ...m, [institutionId]: "✓ Assigned successfully" }));
      setAssignUserId(""); setShowAssign(null);
      refetchUsers();
    } catch (err) {
      setAssignMsg((m) => ({ ...m, [institutionId]: err.response?.data?.error || "Failed" }));
    }
  }

  return (
    <Layout title="Programme Manager" subtitle="Manage institutions and monitor attendance across the programme">

      {/* Top stats */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
          <StatCard label="Institutions"       value={totals.institutions} icon="🏛️" color="blue" />
          <StatCard label="Total Batches"      value={totals.batches}      icon="📚" color="accent" />
          <StatCard label="Total Sessions"     value={totals.sessions}     icon="📅" color="orange" />
          <StatCard label="Attendance Records" value={totals.attendance}   icon="✅" color="green" />
        </div>
      )}

      {/* Create Institution */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Institutions</h2>
        <Button onClick={() => setShowCreateForm((v) => !v)} variant={showCreateForm ? "ghost" : "primary"}>
          {showCreateForm ? "✕ Cancel" : "+ New Institution"}
        </Button>
      </div>

      {showCreateForm && (
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Create Institution</h3>
          <ErrorMsg message={createErr} />
          <form onSubmit={handleCreateInst} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Institution Name"
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                required
                placeholder="e.g. Delhi Skill Centre"
              />
            </div>
            <Button type="submit" disabled={creating} style={{ marginBottom: 16 }}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </form>
        </Card>
      )}

      <ErrorMsg message={sumError} />
      {(sumLoading || instLoading) && <Spinner />}

      {!sumLoading && s.length === 0 && (
        <EmptyState icon="🏛️" title="No institutions yet" subtitle="Create your first institution above." />
      )}

      {/* Institution cards with assign + summary */}
      {institutions?.map((inst, i) => {
        const summaryRow = s.find((x) => x.institutionId === inst.id);
        const unassignedUsers = users?.filter((u) => !u.institutionId) ?? [];

        return (
          <Card key={inst.id} style={{ padding: "20px 24px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{inst.name}</h3>
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--text2)" }}>
                  <span>📚 {inst._count?.batches ?? 0} batches</span>
                  <span>👥 {inst._count?.users ?? 0} users</span>
                  {summaryRow && <span>📅 {summaryRow.totalSessions} sessions</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                  ID: {inst.id}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {summaryRow && (
                  <Badge color={rateColor(summaryRow.presentRate)}>{summaryRow.presentRate}</Badge>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowAssign(showAssign === inst.id ? null : inst.id)}>
                  Assign User
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDeleteInst(inst.id)}>
                  Delete
                </Button>
              </div>
            </div>

            {/* Attendance progress bar */}
            {summaryRow?.totalAttendance > 0 && (
              <div style={{ height: 4, background: "var(--bg3)", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  width: summaryRow.presentRate,
                  background: parseFloat(summaryRow.presentRate) >= 75 ? "var(--green)" : parseFloat(summaryRow.presentRate) >= 50 ? "var(--orange)" : "var(--red)",
                  transition: "width 0.8s ease",
                }} />
              </div>
            )}

            {/* Assign User Panel */}
            {showAssign === inst.id && (
              <div style={{ marginTop: 10, padding: "14px", background: "var(--bg3)", borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                  Assign Trainer / Institution Admin
                </div>
                {usersLoading && <Spinner size={20} />}
                {!usersLoading && (
                  <>
                    <select
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                      style={{
                        width: "100%", padding: "8px 12px", marginBottom: 10,
                        background: "var(--bg2)", border: "1px solid var(--border2)",
                        borderRadius: 6, color: "var(--text)", fontSize: 13,
                      }}
                    >
                      <option value="">Select a user to assign...</option>
                      {users?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role}) {u.institution ? `— currently at ${u.institution.name}` : "— unassigned"}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Button onClick={() => handleAssign(inst.id)} disabled={!assignUserId} size="sm">
                        Assign
                      </Button>
                      {assignMsg[inst.id] && (
                        <span style={{ fontSize: 12, color: "var(--green)" }}>{assignMsg[inst.id]}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </Layout>
  );
}
