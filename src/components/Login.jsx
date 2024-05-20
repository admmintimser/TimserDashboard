import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Check if email and password are not empty
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      const response = await axios.post(
        "https://webapitimser.azurewebsites.net/api/v1/user/login",
        { email, password, role: "Admin" },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      toast.success(response.data.message);
      setIsAuthenticated(true);
      setAuthToken(response.data.token);  // Assuming the token is returned under response.data.token
      navigateTo("/dashboard");
      setEmail("");
      setPassword("");
    } catch (error) {
      // It's good to handle non-2xx responses gracefully
      toast.error(error.response?.data?.message || "Failed to login");
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />; // Redirect to a dashboard or home page on successful authentication
  }

  return (
    <section className="container form-component">
      <img src="/logo.png" alt="logo" className="logo" />
      <br /><br />
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuario"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div style={{ justifyContent: "center", alignItems: "center" }}>
          <button type="submit">Iniciar sesión</button>
        </div>
      </form>
    </section>
  );
};

export default Login;
