import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Context } from "../main";

const ProtectedRoute = ({ roles }) => {
    const { isAuthenticated, userRole } = useContext(Context);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!roles.includes(userRole)) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
