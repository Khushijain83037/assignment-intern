import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { ROLE_PATHS } from "../App.jsx";

export default function RoleRoute({ allowedRole, children }) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  const role = user.publicMetadata?.role;

  // No role set yet — send to onboard, not a redirect loop
  if (!role) return <Navigate to="/onboard" replace />;

  // Wrong role — redirect to their correct dashboard
  if (role !== allowedRole) {
    return <Navigate to={ROLE_PATHS[role] || "/sign-in"} replace />;
  }

  return children;
}