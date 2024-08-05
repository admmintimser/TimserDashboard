import React, { createContext, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

export const Context = createContext({ isAuthenticated: false });

const AppWrapper = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState({});
    const [userRole, setUserRole] = useState(""); // Nuevo estado para el rol del usuario

    return (
        <Context.Provider
            value={{
                isAuthenticated,
                setIsAuthenticated,
                admin,
                setAdmin,
                userRole,
                setUserRole // Añadir setter para el rol del usuario
            }}
        >
            <App />
        </Context.Provider>
    );
};

ReactDOM
    .createRoot(document.getElementById("root"))
    .render(
        <React.StrictMode>
            <AppWrapper />
        </React.StrictMode>
    );
