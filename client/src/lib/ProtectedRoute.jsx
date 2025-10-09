// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useRole } from "@/Context/RoleProvider";

export const ProtectedRoute = () => {
  const { role, loading } = useRole();

  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  return role ? <Outlet /> : <Navigate to="/login" replace />;
};
