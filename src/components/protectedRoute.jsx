import { Navigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children, isAdminRoute = false, isAuthenticated, isAdmin }) => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ error: "Authorization failed! No success." }} />;
    }

    // If route requires admin privileges but user is not an admin, redirect to normal dashboard
    if (isAdminRoute && !isAdmin) {
        return <Navigate to="/dashboard" />;
    }

    // Render the component if all conditions are met
    return children;
};

export default ProtectedRoute;
