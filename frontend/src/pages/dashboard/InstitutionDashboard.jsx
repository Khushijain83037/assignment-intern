import { useState, useEffect } from "react";
import Layout from "../../components/shared/Layout.jsx";
import { Card, Badge, Spinner, ErrorMsg, StatCard, EmptyState, Button, Input } from "../../components/ui/index.jsx";
import { useFetch, useMutation } from "../../hooks/useApi.js";
import api from "../../lib/api.js";

export default function InstitutionDashboard() {
  const [me, setMe]             = useState(null);
  const [meLoading, setMeLoading] = useState(true);
  const [meError, setMeError]   = useState(null);

  useEffect(() => {
    api.get("/users/me")
      .then((r) => setMe(r.data))
      .catch((e) => setMeError(e.response?.data?.error || "Failed to load user"))
      .finally(() => setMeLoading(false));
  }, []);

  const institutionId = me?.institutionId;

  const { data: batches, loading: batchLoading, error: batchError, refetch } =
    useFetch(institutionId ? `/institutions/${institutionId}/batches` : null);

  const { mutate: createBatch, loading: creating, error: createErr } = useMutation("post", "/batches");

  const [showForm,      setShowForm]      = useState(false);
  const [batchName,     setBatchName]     = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [deleteMsg,     setDeleteMsg]     = useState({});

  const { data: batchSummary, loading: summaryLoading } =
    useFetch(selectedBatch ? `/batches/${selectedBatch}/summary` : null);

  async function handleCreateBatch(e) {
    e.preventDefault();
    await createBatch({ name: batchName, institutionId });
    setBatchName(""); setShowForm(false); refetch();
  }

  async function handleDeleteBatch(id) {
    if (!confirm("Delete this batch? All sessions and attendance records will be removed.")) return;
    try {
      await api.delete(`/batches/${id}`);
      refetch();
    } catch (err) {
      setDeleteMsg((m) => ({ ...m, [id]: err.response?.data?.error || "Delete failed" }));
    }
  }

  if (meLoading) return <Layout title="Institution Dashboard"><Spinner /></Layout>;
  if (meError)   return <Layout title="Institution Dashboard"><ErrorMsg message={meError} /></Layout>;

  if (!institutionId) {
    return (
      <Layout title="Institution Dashboard">
        <Card>
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏛️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Not linked to an institution</h3>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 16 }}>
              Ask your Programme Manager to assign you to an institution.
            </p>
            <div style={{ padding: "10px 16px", background: "var(--bg3)", borderRadius: 8, fontSize: 12, color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace", display: "inline-block" }}>
              Your DB ID: {me?.id}
            </div>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Institution Dashboard" subtitle={`Managing: ${me?.institution?.name || institutionId}`}>
      <ErrorMsg message={batchError} />

      {batches && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Batches"  value={batches.length} icon="📚" color="blue" />
          <StatCard label="Total Students" value={batches.reduce((a, b) => a + (b.students?.length ?? 0), 0)} icon="🎓" color="green" />
          <StatCard label="Total Sessions" value={batches.reduce((a, b) => a + (b._count?.sessions ?? 0), 0)} icon="📅" color="accent" />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Batches</h2>
        <Button onClick={() => setShowForm((v) => !v)} variant={showForm ? "ghost" : "primary"}>
          {showForm ? "✕ Cancel" : "+ New Batch"}
        </Button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Create Batch</h3>
          <ErrorMsg message={createErr} />
          <form onSubmit={handleCreateBatch} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Input label="Batch Name" value={batchName} onChange={(e) => setBatchName(e.target.value)} required placeholder="e.g. Morning Batch 2026" />
            </div>
            <Button type="submit" disabled={creating} style={{ marginBottom: 16 }}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </form>
        </Card>
      )}

      {batchLoading && <Spinner />}
      {!batchLoading && batches?.length === 0 && (
        <EmptyState icon="📚" title="No batches yet" subtitle="Create your first batch above." />
      )}

      {batches?.map((batch) => (
        <Card key={batch.id} style={{ padding: "20px 24px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{batch.name}</h3>
              <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--text2)" }}>
                <span>🎓 {batch.students?.length ?? 0} students</span>
                <span>📅 {batch._count?.sessions ?? 0} sessions</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                ID: {batch.id}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Button variant="ghost" size="sm" onClick={() => setSelectedBatch(selectedBatch === batch.id ? null : batch.id)}>
                {selectedBatch === batch.id ? "Hide Summary" : "View Summary"}
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDeleteBatch(batch.id)}>
                Delete
              </Button>
            </div>
          </div>

          {deleteMsg[batch.id] && (
            <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 8 }}>{deleteMsg[batch.id]}</div>
          )}

          {batch.trainers?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Trainers</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {batch.trainers.map((bt) => <Badge key={bt.trainer.id} color="muted">{bt.trainer.name}</Badge>)}
              </div>
            </div>
          )}

          {selectedBatch === batch.id && (
            <div style={{ marginTop: 10, padding: 14, background: "var(--bg3)", borderRadius: 8 }}>
              {summaryLoading && <Spinner size={20} />}
              {batchSummary && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    Attendance Rate: <span style={{ color: "var(--green)" }}>{batchSummary.attendanceRate}</span>
                  </div>
                  {batchSummary.students?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Students ({batchSummary.students.length})
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {batchSummary.students.map((bs) => <Badge key={bs.student.id} color="muted">{bs.student.name}</Badge>)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Card>
      ))}
    </Layout>
  );
}
