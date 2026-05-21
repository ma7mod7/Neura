import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { hasAdminRole } from "../../../utils/jwt";

const AdminRoute = () => {
    const { token, isLoading } = useAuth();

    if (isLoading) return <p>Loading...</p>;
    
    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    if (!hasAdminRole(token)) {
        return <Navigate to="/" replace />;
    }

    return <><Outlet/></>;
};

export default AdminRoute;
