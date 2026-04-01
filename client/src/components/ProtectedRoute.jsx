import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const fallbackPath =
    user?.role === "teacher" || user?.role === "org_admin"
      ? "/teacher"
      : "/dashboard";

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export default ProtectedRoute;
