// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role: requiredRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (!children || typeof children !== "object" || !children.type) {
    console.error(
      "Invalid child component passed to ProtectedRoute:",
      children
    );
  }

  console.log("ProtectedRoute → token:", token);
  console.log("ProtectedRoute → role:", role);

  return children;
};

export default ProtectedRoute;
