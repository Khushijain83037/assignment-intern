import { useState } from "react";
import Layout from "../../components/shared/Layout.jsx";
import { Card, Button, Badge, Spinner, ErrorMsg, Input, StatCard, EmptyState, Table } from "../../components/ui/index.jsx";
import { useFetch, useMutation } from "../../hooks/useApi.js";
import api from "../../lib/api.js";

const STATUS_COLOR = { PRESENT: "green", LATE: "orange", ABSENT: "red" };

export default function TrainerDashboard() {
  const { data: sessions, loading: sessLoading, error: sessError, refetch: refetchSessions } = useFetch("/sessions/trainer");
  const { data: myBatches, loading: batchLoading, error: batchError, refetch: refetchBatches } = useFetch("/batches/my");

  const { mutate: createSession, loading: creatingSession, error: createSessErr } = useMutation("post", "/sessions");
  const { mutate: createBatch,  loading: creatingBatch,   error: createBatchErr } = useMutation("post", "/batches");

  const [activeTab,   setActiveTab]   = useState("sessions"); // "sessions" | "batches"
  const [showSessForm,  setShowSessForm]  = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);

  const [sessForm,  setSessForm]  = useState({ title: "", date: "", startTime: "", endTime: "", batchId: "" });
  const [batchForm, setBatchForm] = useState({ name: "", institutionId: "" });

  const [inviteLinks, setInviteLinks] = useState({});
  const [attendance,  setAttendance]  = useState({});
  const [loadingAtt,  setLoadingAtt]  = useState({});
  const [expanded,    setExpanded]    = useState({});
  const [copied,      setCopied]      = useState({});

  function setSessField(k, v) { setSessForm((f) => ({ ...f, [k]: v })); }
  function setBatchField(k, v) { setBatchForm((f) => ({ ...f, [k]: v })); }

  async function handleCreateSession(e) {
    e.preventDefault();
    await createSession(sessForm);
    setSessForm({ title: "", date: "", startTime: "", endTime: "", batchId: "" });
    setShowSessForm(false);
    refetchSessions();
  }

  async function handleCreateBatch(e) {
    e.preventDefault();
    await createBatch(batchForm);
    setBatchForm({ name: "", institutionId: "" });
    setShowBatchForm(false);
    refetchBatches();
  }

  async function handleInvite(batchId) {
    try {
      const res = await api.post(`/batches/${batchId}/invite`);
      setInviteLinks((l) => ({ ...l, [batchId]: res.data.inviteUrl }));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate invite");
    }
  }

  async function handleViewAttendance(sessionId) {
    if (attendance[sessionId]) {
      setExpanded((e) => ({ ...e, [sessionId]: !e[sessionId] }));
      return;
    }
    setLoadingAtt((s) => ({ ...s, [sessionId]: true }));
    try {
      const res = await api.get(`/sessions/${sessionId}/attendance`);
      setAttendance((a) => ({ ...a, [sessionId]: res.data }));
      setExpanded((e) => ({ ...e, [sessionId]: true }));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to load attendance");
    }
    setLoadingAtt((s) => ({ ...s, [sessionId]: false }));
  }

  function handleCopy(batchId, text) {
    navigator.clipboard.writeText(text);
    setCopied((c) => ({ ...c, [batchId]: true }));
    setTimeout(() => setCopied((c) => ({ ...c, [batchId]: false })), 2000);
  }

  const totalMarked = sessions?.reduce((a, s) => a + (s.attendance?.length ?? 0), 0) ?? 0;

  const tabStyle = (t) => ({
    padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600,
    cursor: "pointer", border: "none", fontFamily: "'Sora', sans-serif",
    background: activeTab === t ? "var(--accent)" : "var(--bg3)",
    color: activeTab === t ? "#fff" : "var(--text2)",
    transition: "all 0.15s",
  });

  return (
    <Layout title="Trainer Dashboard" subtitle="Manage batches, sessions, attendance and invites">

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="My Batches"        value={myBatches?.length ?? 0}  icon="📚" color="blue" />
        <StatCard label="Total Sessions"    value={sessions?.length ?? 0}   icon="📅" color="accent" />
        <StatCard label="Attendance Marks"  value={totalMarked}              icon="✅" color="green" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button style={tabStyle("sessions")} onClick={() => setActiveTab("sessions")}>Sessions</button>
        <button style={tabStyle("batches")}  onClick={() => setActiveTab("batches")}>My Batches</button>
      </div>

      {/* ── SESSIONS TAB ── */}
      {activeTab === "sessions" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Sessions</h2>
            <Button onClick={() => setShowSessForm((v) => !v)} variant={showSessForm ? "ghost" : "primary"}>
              {showSessForm ? "✕ Cancel" : "+ New Session"}
            </Button>
          </div>

          {showSessForm && (
            <Card style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Create Session</h3>
              <ErrorMsg message={createSessErr} />
              <form onSubmit={handleCreateSession}>
                <Input label="Session Title" value={sessForm.title} onChange={(e) => setSessField("title", e.target.value)} required placeholder="e.g. Python Basics – Week 3" />
                <Input label="Batch" value={sessForm.batchId} onChange={(e) => setSessField("batchId", e.target.value)} required placeholder="Paste batch ID or pick from My Batches tab"
                  hint={myBatches?.length ? `Your batches: ${myBatches.map(b => b.name).join(", ")}` : "Create a batch first in My Batches tab"} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <Input label="Date"       type="date" value={sessForm.date}      onChange={(e) => setSessField("date",      e.target.value)} required />
                  <Input label="Start Time" type="time" value={sessForm.startTime} onChange={(e) => setSessField("startTime", e.target.value)} required />
                  <Input label="End Time"   type="time" value={sessForm.endTime}   onChange={(e) => setSessField("endTime",   e.target.value)} required />
                </div>
                {/* Quick-pick batch buttons */}
                {myBatches?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>Quick pick batch:</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {myBatches.map((b) => (
                        <button key={b.id} type="button" onClick={() => setSessField("batchId", b.id)}
                          style={{
                            padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                            background: sessForm.batchId === b.id ? "var(--accent)" : "var(--bg3)",
                            color: sessForm.batchId === b.id ? "#fff" : "var(--text2)",
                            border: "1px solid var(--border)", fontFamily: "'Sora', sans-serif",
                          }}>
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <Button type="submit" disabled={creatingSession}>
                  {creatingSession ? "Creating…" : "Create Session"}
                </Button>
              </form>
            </Card>
          )}

          <ErrorMsg message={sessError} />
          {sessLoading && <Spinner />}
          {!sessLoading && sessions?.length === 0 && (
            <EmptyState icon="📅" title="No sessions yet" subtitle="Create your first session above. Make sure you have a batch first." />
          )}

          {sessions?.map((session, i) => (
            <Card key={session.id} style={{ padding: "20px 24px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{session.title}</h3>
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text2)", flexWrap: "wrap" }}>
                    <span>📅 {new Date(session.date).toDateString()}</span>
                    <span>🕐 {session.startTime} – {session.endTime}</span>
                    <span>📚 {session.batch?.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                    Batch ID: {session.batchId}
                  </div>
                </div>
                <Badge color="accent">{session.attendance?.length ?? 0} marked</Badge>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="secondary" size="sm" onClick={() => handleViewAttendance(session.id)} disabled={loadingAtt[session.id]}>
                  {loadingAtt[session.id] ? "Loading…" : expanded[session.id] ? "Hide Attendance" : "View Attendance"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleInvite(session.batchId)}>
                  🔗 Generate Invite
                </Button>
              </div>

              {inviteLinks[session.batchId] && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--accent-bg)", border: "1px solid #6c63ff20", borderRadius: 8, display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ flex: 1, fontSize: 12, color: "var(--accent2)", wordBreak: "break-all", fontFamily: "'JetBrains Mono', monospace" }}>
                    {inviteLinks[session.batchId]}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(session.batchId, inviteLinks[session.batchId])}>
                    {copied[session.batchId] ? "✓ Copied!" : "Copy"}
                  </Button>
                </div>
              )}

              {expanded[session.id] && attendance[session.id] && (
                <div style={{ marginTop: 12 }}>
                  <Table
                    headers={["Student", "Email", "Status", "Time"]}
                    rows={attendance[session.id].map((a) => [
                      a.student?.name,
                      <span style={{ color: "var(--text2)", fontSize: 12 }}>{a.student?.email}</span>,
                      <Badge color={STATUS_COLOR[a.status]}>{a.status}</Badge>,
                      <span style={{ color: "var(--text2)", fontSize: 12 }}>{new Date(a.markedAt).toLocaleTimeString()}</span>,
                    ])}
                    emptyMsg="No attendance marked yet"
                  />
                </div>
              )}
            </Card>
          ))}
        </>
      )}

      {/* ── BATCHES TAB ── */}
      {activeTab === "batches" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>My Batches</h2>
            <Button onClick={() => setShowBatchForm((v) => !v)} variant={showBatchForm ? "ghost" : "primary"}>
              {showBatchForm ? "✕ Cancel" : "+ New Batch"}
            </Button>
          </div>

          {showBatchForm && (
            <Card style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Create Batch</h3>
              <ErrorMsg message={createBatchErr} />
              <form onSubmit={handleCreateBatch}>
                <Input label="Batch Name" value={batchForm.name} onChange={(e) => setBatchField("name", e.target.value)} required placeholder="e.g. Morning Batch 2026" />
                <Input label="Institution ID" value={batchForm.institutionId} onChange={(e) => setBatchField("institutionId", e.target.value)} required
                  placeholder="Institution ID (get from your Programme Manager)"
                  hint="Ask your Programme Manager for the institution ID to link this batch" />
                <Button type="submit" disabled={creatingBatch}>
                  {creatingBatch ? "Creating…" : "Create Batch"}
                </Button>
              </form>
            </Card>
          )}

          <ErrorMsg message={batchError} />
          {batchLoading && <Spinner />}
          {!batchLoading && myBatches?.length === 0 && (
            <EmptyState icon="📚" title="No batches yet" subtitle="Create your first batch above to start managing sessions." />
          )}

          {myBatches?.map((batch, i) => (
            <Card key={batch.id} style={{ padding: "20px 24px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{batch.name}</h3>
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text2)" }}>
                    <span>🎓 {batch.students?.length ?? 0} students</span>
                    <span>📅 {batch._count?.sessions ?? 0} sessions</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                    ID: {batch.id}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="ghost" size="sm" onClick={() => handleInvite(batch.id)}>
                    🔗 Invite Link
                  </Button>
                </div>
              </div>

              {inviteLinks[batch.id] && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--accent-bg)", border: "1px solid #6c63ff20", borderRadius: 8, display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ flex: 1, fontSize: 12, color: "var(--accent2)", wordBreak: "break-all", fontFamily: "'JetBrains Mono', monospace" }}>
                    {inviteLinks[batch.id]}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(batch.id, inviteLinks[batch.id])}>
                    {copied[batch.id] ? "✓ Copied!" : "Copy"}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </>
      )}
    </Layout>
  );
}
