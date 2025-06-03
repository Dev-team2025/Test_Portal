import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    if (!token) {
        // No token - redirect to login
        return <Navigate to="/login" replace />;
    }

    try {
        // Verify token is valid
        const decoded = jwtDecode(token);

        // Check for admin-only routes
        if (adminOnly && userType !== "admin") {
            // Not admin but trying to access admin route - redirect to dashboard
            return <Navigate to="/dashboard" replace />;
        }

        // Token is valid and user has required permissions
        return children;
    } catch (error) {
        // Invalid token - clear storage and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;