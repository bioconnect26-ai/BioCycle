import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

export const ProtectedRoute = ({
  children,
  requiredRoles = [],
}: {
  children: React.ReactNode;
  requiredRoles?: string[];
}) => {
  const currentUser = authService.getCurrentUser();

  // Check if user is logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
