import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { isAuthenticated, setIsAuthenticated, setUserRole } = useContext(Context);

    const navigateTo = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("https://webapitimser.azurewebsites.net/api/v1/user/login", {
                email,
                password
            }, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });

            toast.success(data.message);
            setIsAuthenticated(true);
            setUserRole(data.user.role); // Almacenar el rol del usuario

            if (data.user.role === "Admin") {
                navigateTo("/admin");
            } else if (data.user.role === "Receptionist") {
                navigateTo("/reception");
            } else if (data.user.role === "Patient") {
                navigateTo("/patient");
            }

            setEmail("");
            setPassword("");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    if (isAuthenticated) {
        return <Navigate to={"/"} />;
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
                    onChange={(e) => setEmail(e.target.value)} />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                <div style={{ justifyContent: "center", alignItems: "center" }}>
                    <button type="submit">Iniciar sesión</button>
                </div>
            </form>
        </section>
    );
};

export default Login;
