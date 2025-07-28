import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, isAdminRoute = false, isAuthenticated, isAdmin, checkingAuth }) => {
    if (checkingAuth) {
        // While still checking, render nothing (or a placeholder if you wish)
        return null;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ error: "Authorization failed! No success." }} />;
    }
    if (isAdminRoute && !isAdmin) {
        return <Navigate to="/dashboard" />;
    }
    return children;
};

export default ProtectedRoute;