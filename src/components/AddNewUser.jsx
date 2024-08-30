// src/components/AddNewUser.jsx
import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Button, MenuItem, Select, FormControl, InputLabel, Typography, TextField } from '@mui/material';
import styled from 'styled-components';
import bgpic from "/breadcrumb-01.jpg"; // Asegúrate de tener esta imagen

const defaultTheme = createTheme();

const AddNewUser = () => {
    const { isAuthenticated, setIsAuthenticated } = useContext(Context);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("recepcionista"); // Rol por defecto

    const navigateTo = useNavigate();

    const handleAddNewUser = async (e) => {
        e.preventDefault();

        // Definir la URL según el rol seleccionado
        let url = "https://webapitimser.azurewebsites.net/api/v1/user";
        switch (role) {
            case "admin":
                url += "/admin/addnew";
                break;
            case "recepcionista":
                url += "/receptionist/addnew";
                break;
            case "elisas":
                url += "/elisas/addnew";
                break;
            case "westernblot":
                url += "/westernblot/addnew";
                break;
            case "direccion":
                url += "/direccion/addnew";
                break;
            case "comercial":
                url += "/comercial/addnew";
                break;
            case "cliente":
                url += "/cliente/addnew";
                break;
            default:
                toast.error("Rol no reconocido.");
                return;
        }

        try {
            await axios.post(url, {
                firstName,
                lastName,
                email,
                phone,
                dob,
                gender,
                password,
            }, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((res) => {
                toast.success(res.data.message);
                setIsAuthenticated(true);
                navigateTo("/");
                setFirstName("");
                setLastName("");
                setEmail("");
                setPhone("");
                setDob("");
                setGender("");
                setPassword("");
            });
        } catch (error) {
            toast.error(error.response.data.message || "Error en la solicitud");
        }
    };

    if (!isAuthenticated) {
        return <Navigate to={"/login"} />;
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <StyledBody>
                <StyledContainer>
                    <StyledLogo src="/logo.png" alt="logo" />
                    <StyledTypography variant="h4">Agregar Nuevo Usuario</StyledTypography>
                    <form onSubmit={handleAddNewUser}>
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
                            placeholder="Nombre(s)"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            fullWidth
                        />
                        <StyledTextField
                            type="text"
                            placeholder="Apellidos"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            fullWidth
                        />
                        <StyledTextField
                            type="text"
                            placeholder="Correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                        />
                        <StyledTextField
                            type="number"
                            placeholder="Teléfono"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            fullWidth
                        />
                        <StyledTextField
                            type="date"
                            placeholder="Fecha de nacimiento"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel id="gender-select-label">Género</InputLabel>
                            <Select
                                labelId="gender-select-label"
                                id="gender-select"
                                value={gender}
                                label="Género"
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <MenuItem value="Masculino">Masculino</MenuItem>
                                <MenuItem value="Femenino">Femenino</MenuItem>
                            </Select>
                        </FormControl>
                        <StyledTextField
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                        />
                        <StyledButton type="submit" fullWidth>
                            Agregar Usuario
                        </StyledButton>
                    </form>
                </StyledContainer>
            </StyledBody>
        </ThemeProvider>
    );
};

export default AddNewUser;

// Define los estilos que faltan
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
