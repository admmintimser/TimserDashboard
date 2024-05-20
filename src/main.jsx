import React, { createContext, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

export const Context = createContext({ 
  isAuthenticated: false, 
  authToken: null  // Add this to provide a default value
});

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);  // Add state for authToken
  const [admin, setAdmin] = useState({});

  return (
    <Context.Provider
      value={{ isAuthenticated, setIsAuthenticated, authToken, setAuthToken, admin, setAdmin }}
    >
      <App />
    </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
