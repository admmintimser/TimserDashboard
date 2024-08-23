import React, { createContext, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // Importa y usa Router aquí
import App from "./App.jsx";

export const Context = createContext({ isAuthenticated: false });

const AppWrapper = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState({});
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        const savedAuthStatus = localStorage.getItem("isAuthenticated") === "true";
        const savedAdmin = JSON.parse(localStorage.getItem("admin")) || {};
        const savedUserRole = localStorage.getItem("userRole") || "";

        setIsAuthenticated(savedAuthStatus);
        setAdmin(savedAdmin);
        setUserRole(savedUserRole);
    }, []);

    return (
        <Context.Provider
            value={{
                isAuthenticated,
                setIsAuthenticated,
                admin,
                setAdmin,
                userRole,
                setUserRole,
            }}
        >
            <Router>
                <App />
            </Router>
        </Context.Provider>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AppWrapper />
    </React.StrictMode>
);
