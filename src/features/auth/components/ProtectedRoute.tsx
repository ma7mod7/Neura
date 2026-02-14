import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";



const ProtectedRoute = ( ) => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <p>Loading...</p>;
    if (user==null) {
        return <Navigate to="auth/login" replace />;
    }

    return <><Outlet/></>;
};

export default ProtectedRoute;
