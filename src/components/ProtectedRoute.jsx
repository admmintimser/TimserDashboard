import React, { useContext, useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Context } from "../main";

const ProtectedRoute = ({ roles }) => {
    const { isAuthenticated, userRole } = useContext(Context);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simula una verificación de autenticación, puedes reemplazar con la lógica real
        const checkAuth = async () => {
            // Supón que estás verificando la autenticación en el servidor
            // Aquí podrías llamar a una API para verificar el estado
            // Después de obtener la respuesta, actualizas `isAuthenticated`
            // Simulación:
            setIsLoading(false); // Marca la carga como completada
        };
        checkAuth();
    }, []);

    if (isLoading) {
        // Mientras se carga, no hacer nada o mostrar un spinner
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(userRole)) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
