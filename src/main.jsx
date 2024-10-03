import React, { createContext, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.jsx";

export const Context = createContext({ isAuthenticated: false });

const AppWrapper = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState({});
    const [userRole, setUserRole] = useState("");

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
