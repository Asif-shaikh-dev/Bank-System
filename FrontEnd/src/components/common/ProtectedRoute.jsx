import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Swap for a real splash screen / skeleton — this is the brief
    // window where we're checking the refresh cookie on app boot
    return null;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}