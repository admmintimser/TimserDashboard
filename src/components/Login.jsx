import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Button, Box, MenuItem, Select, FormControl, InputLabel, Typography, TextField } from '@mui/material';
import styled from 'styled-components';
import bgpic from "/breadcrumb-01.jpg"; // Asegúrate de tener esta imagen

const defaultTheme = createTheme();

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("admin"); // Default role

    const { isAuthenticated, setIsAuthenticated, setUserRole } = useContext(Context);

    const navigateTo = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("https://webapitimser.azurewebsites.net/api/v1/user/login", {
                email,
                password,
                role
            }, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });

            toast.success(data.message);
            setIsAuthenticated(true);
            setUserRole(data.user.role);

            const roleToPath = {
                admin: "/admin/dashboard",
                recepcionista: "/reception/dashboard",
                elisas: "/elisas/dashboard",
                westernblot: "/westernblot/dashboard",
                direccion: "/direccion/dashboard",
                comercial: "/comercial/dashboard",
                cliente: "/clientes/dashboard"
            };

            navigateTo(roleToPath[data.user.role] || "/"); // Redirige basado en el rol

            setEmail("");
            setPassword("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error en la autenticación");
        }
    };

    if (isAuthenticated) {
        return <Navigate to={"/"} />;
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <StyledBody>
                <StyledContainer>
                    <StyledLogo src="/logo.png" alt="logo" />
                    <StyledTypography variant="h4">Iniciar sesión</StyledTypography>
                    <form onSubmit={handleLogin}>
                        <FormControl fullWidth>
                            <InputLabel id="role-select-label">Seleccionar Rol</InputLabel>
                            <Select
                                labelId="role-select-label"
                                id="role-select"
                                value={role}
                                label="Seleccionar Rol"
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="recepcionista">Recepcionista</MenuItem>
                                <MenuItem value="elisas">Elisas</MenuItem>
                                <MenuItem value="westernblot">Western Blot</MenuItem>
                                <MenuItem value="direccion">Dirección</MenuItem>
                                <MenuItem value="comercial">Comercial</MenuItem>
                                <MenuItem value="cliente">Cliente</MenuItem>
                            </Select>
                        </FormControl>
                        <StyledTextField
                            type="text"
                            placeholder="Usuario"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                        />
                        <StyledTextField
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                        />
                        <StyledButton type="submit" fullWidth>
                            Iniciar sesión
                        </StyledButton>
                    </form>
                </StyledContainer>
            </StyledBody>
        </ThemeProvider>
    );
};

export default Login;

// Styled components (mismos estilos que se han definido anteriormente)
const StyledBody = styled.div`
  font-family: 'Source Sans Pro', sans-serif;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(${bgpic});
  background-size: cover;
  background-position: center;
`;

const StyledContainer = styled.div`
  background-color: rgb(255, 255, 255);
  border-radius: 9px;
  border-top: 10px solid #051096;
  border-bottom: 10px solid #051096;
  width: 400px;
  padding: 40px;
  box-shadow: 1px 1px 108.8px 19.2px rgb(25, 31, 53);
  text-align: center;

  @media (max-width: 600px) {
    width: 90%;
    padding: 20px;
  }
`;

const StyledLogo = styled.img`
  width: 250px;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    width: 80%;
  }
`;

const StyledTypography = styled(Typography)`
  color: rgba(1,10,135,1);
  margin-bottom: 10px;
`;

const StyledTextField = styled(TextField)`
  margin: 10px 0;
  & .MuiInputBase-root {
    background: #ffff;
    border-radius: 5px;
    color: #d6d6d6;
  }
  & .MuiInputLabel-root {
    color: #051096;
  }
  & .MuiInputBase-root.Mui-focused {
    border: 1px solid #79A6FE;
  }
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
  border-radius: 100px;
  background: #7f5feb;
  color: #dfdeee;
  &:hover {
    background: #5d33e6;
  }
`;
