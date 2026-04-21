import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import api from "../lib/api.js";
import { Button, ErrorMsg, Spinner } from "../components/ui/index.jsx";

export default function JoinPage() {
  const [searchParams] = useSearchParams();
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate    = useNavigate();
  const inviteCode  = searchParams.get("code");
  const [status,  setStatus]  = useState("idle");
  const [message, setMessage] = useState("");
  const [batch,   setBatch]   = useState(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn)
      navigate(`/sign-in?redirect=/join?code=${inviteCode}`);
  }, [isLoaded, isSignedIn, inviteCode, navigate]);

  if (!isLoaded) return <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>;

  const role = user?.publicMetadata?.role;

  async function handleJoin() {
    setStatus("joining");
    try {
      const res = await api.post("/batches/join-by-code", { inviteCode });
      setBatch(res.data.batch);
      setStatus("success");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to join. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: 36,
        textAlign: "center",
      }} className="fade-up">
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔗</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Batch Invite
        </h2>

        {!inviteCode && <p style={{ color: "var(--text2)", fontSize: 14 }}>No invite code in this link.</p>}

        {inviteCode && status === "idle" && (
          <>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              You've been invited to join a SkillBridge batch.
            </p>
            {role !== "STUDENT" && (
              <div style={{
                background: "var(--orange-bg)", color: "var(--orange)",
                border: "1px solid #f59e0b25", borderRadius: 8,
                padding: "10px 14px", fontSize: 13, marginBottom: 16,
              }}>
                ⚠️ Only students can join batches. You're signed in as {role?.replace(/_/g, " ")}.
              </div>
            )}
            <Button onClick={handleJoin} disabled={role !== "STUDENT"} size="lg" style={{ width: "100%" }}>
              Accept Invite
            </Button>
          </>
        )}

        {status === "joining" && <Spinner />}

        {status === "success" && (
          <>
            <div style={{ color: "var(--green)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
              ✓ Joined <strong>{batch?.name}</strong> successfully!
            </div>
            <Button onClick={() => navigate("/dashboard/student")} size="lg" style={{ width: "100%" }}>
              Go to Dashboard →
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorMsg message={message} />
            <Button variant="secondary" onClick={() => setStatus("idle")} style={{ width: "100%" }}>
              Try Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
