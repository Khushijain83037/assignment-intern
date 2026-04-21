import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useApiAuth } from "./lib/api.js";

import SignInPage                  from "./pages/auth/SignInPage.jsx";
import SignUpPage, { OnboardPage } from "./pages/auth/SignUpPage.jsx";
import StudentDashboard            from "./pages/dashboard/StudentDashboard.jsx";
import TrainerDashboard            from "./pages/dashboard/TrainerDashboard.jsx";
import InstitutionDashboard        from "./pages/dashboard/InstitutionDashboard.jsx";
import ManagerDashboard            from "./pages/dashboard/ManagerDashboard.jsx";
import MonitoringDashboard         from "./pages/dashboard/MonitoringDashboard.jsx";
import JoinPage                    from "./pages/JoinPage.jsx";
import RoleRoute                   from "./lib/RoleRoute.jsx";

export const ROLE_PATHS = {
  STUDENT:            "/dashboard/student",
  TRAINER:            "/dashboard/trainer",
  INSTITUTION:        "/dashboard/institution",
  PROGRAMME_MANAGER:  "/dashboard/manager",
  MONITORING_OFFICER: "/dashboard/monitoring",
};

function RootRedirect() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 32, height: 32, border: "2px solid var(--border2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  const role = user.publicMetadata?.role;
  if (!role) return <Navigate to="/onboard" replace />;
  return <Navigate to={ROLE_PATHS[role] || "/sign-in"} replace />;
}

export default function App() {
  useApiAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<RootRedirect />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/onboard" element={<OnboardPage />} />
        <Route path="/join"    element={<JoinPage />} />

        <Route path="/dashboard/student" element={
          <RoleRoute allowedRole="STUDENT"><StudentDashboard /></RoleRoute>
        }/>
        <Route path="/dashboard/trainer" element={
          <RoleRoute allowedRole="TRAINER"><TrainerDashboard /></RoleRoute>
        }/>
        <Route path="/dashboard/institution" element={
          <RoleRoute allowedRole="INSTITUTION"><InstitutionDashboard /></RoleRoute>
        }/>
        <Route path="/dashboard/manager" element={
          <RoleRoute allowedRole="PROGRAMME_MANAGER"><ManagerDashboard /></RoleRoute>
        }/>
        <Route path="/dashboard/monitoring" element={
          <RoleRoute allowedRole="MONITORING_OFFICER"><MonitoringDashboard /></RoleRoute>
        }/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
