import { useState } from "react";
import Layout from "../../components/shared/Layout.jsx";
import { Card, Button, Badge, Spinner, ErrorMsg, EmptyState } from "../../components/ui/index.jsx";
import { useFetch, useMutation } from "../../hooks/useApi.js";

export default function StudentDashboard() {
  const { data: sessions, loading, error, refetch } = useFetch("/sessions/my");
  const { mutate: mark, loading: marking } = useMutation("post", "/attendance/mark");
  const [feedback, setFeedback] = useState({});

  async function handleMark(sessionId, status) {
    try {
      await mark({ sessionId, status });
      setFeedback((f) => ({ ...f, [sessionId]: { ok: true, text: `Marked ${status}` } }));
      refetch();
    } catch (err) {
      setFeedback((f) => ({ ...f, [sessionId]: { ok: false, text: err.message } }));
    }
  }

  function isToday(dateStr) {
    return new Date(dateStr).toDateString() === new Date().toDateString();
  }

  const STATUS_COLOR = { PRESENT: "green", LATE: "orange", ABSENT: "red" };

  return (
    <Layout title="My Sessions" subtitle="View and mark attendance for your enrolled sessions">
      <ErrorMsg message={error} />
      {loading && <Spinner />}

      {!loading && sessions?.length === 0 && (
        <EmptyState
          icon="📭"
          title="No sessions yet"
          subtitle="You're not enrolled in any batches. Ask your trainer for an invite link."
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {sessions?.map((session, i) => {
          const today       = isToday(session.date);
          const myRecord    = session.attendance?.[0];
          const marked      = !!myRecord;

          return (
            <div key={session.id} className={`fade-up stagger-${Math.min(i + 1, 5)}`} style={{ marginBottom: 12 }}>
              <Card style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
                        {session.title}
                      </h3>
                      {today && <Badge color="green">Today</Badge>}
                      {!today && <Badge color="muted">Upcoming</Badge>}
                      {marked && <Badge color={STATUS_COLOR[myRecord.status]}>{myRecord.status}</Badge>}
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text2)", flexWrap: "wrap" }}>
                      <span>📅 {new Date(session.date).toDateString()}</span>
                      <span>🕐 {session.startTime} – {session.endTime}</span>
                      <span>📚 {session.batch?.name}</span>
                      <span>👤 {session.trainer?.name}</span>
                    </div>
                  </div>
                </div>

                {today && !marked && (
                  <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Button onClick={() => handleMark(session.id, "PRESENT")} disabled={marking}>
                      ✓ Mark Present
                    </Button>
                    <Button variant="secondary" onClick={() => handleMark(session.id, "LATE")} disabled={marking}>
                      🕐 Mark Late
                    </Button>
                    {feedback[session.id] && (
                      <span style={{
                        fontSize: 13,
                        color: feedback[session.id].ok ? "var(--green)" : "var(--red)",
                      }}>
                        {feedback[session.id].text}
                      </span>
                    )}
                  </div>
                )}

                {today && marked && (
                  <div style={{
                    marginTop: 14, fontSize: 13, color: "var(--text3)",
                    padding: "8px 12px", background: "var(--bg3)",
                    borderRadius: 8, display: "inline-block",
                  }}>
                    ✓ Attendance recorded at {new Date(myRecord.markedAt).toLocaleTimeString()}
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
