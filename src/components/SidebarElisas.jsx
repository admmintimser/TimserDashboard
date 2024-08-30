// src/components/SidebarElisas.jsx
import React, { useContext, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { sidebarClasses } from 'react-pro-sidebar';
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { GiHamburgerMenu } from "react-icons/gi";
import { SlChemistry } from "react-icons/sl";
import { BsCardChecklist } from "react-icons/bs";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SidebarElisas = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { isAuthenticated, setIsAuthenticated } = useContext(Context);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = await axios.get("https://webapitimser.azurewebsites.net/api/v1/user/logout", { // Usa la ruta genérica de logout
                withCredentials: true, // Incluye las credenciales para que las cookies se envíen correctamente
            });
            toast.success(res.data.message); // Muestra un mensaje de éxito usando toast
            setIsAuthenticated(false); // Actualiza el estado de autenticación a falso
        } catch (err) {
            toast.error(err.response?.data?.message || "Error al cerrar sesión"); // Muestra un mensaje de error si ocurre un problema
        }
    };

    return (
        <>
            {isAuthenticated && (
                <Sidebar
                    className={collapsed ? 'collapsed' : ''}
                    rootStyles={{
                        [`.${sidebarClasses.container}`]: {
                            backgroundColor: '#0d7a79',
                            color: 'white',
                        },
                    }}
                    collapsed={collapsed}
                >
                    <Menu
                        menuItemStyles={{
                            button: {
                                [`&:hover`]: {
                                    backgroundColor: '#005f73',
                                    color: 'white',
                                },
                                [`&.active`]: {
                                    backgroundColor: '#0d7a79',
                                    color: '#005f73',
                                },
                            },
                            label: {
                                color: 'white',
                            },
                        }}
                    >
                        <MenuItem icon={<GiHamburgerMenu />} onClick={() => setCollapsed(!collapsed)}>Menu</MenuItem>
                        <MenuItem icon={<TiHome />} component={<Link to="/" />}>Home</MenuItem>
                        <MenuItem icon={<SlChemistry />} component={<Link to="/elisas" />}>Elisas</MenuItem>
                        <MenuItem icon={<BsCardChecklist />} component={<Link to="/estatus-preventix-dashboard" />}>Estatus</MenuItem>
                        <MenuItem icon={<BsCardChecklist />} component={<Link to="/preventix" />}>Preventix</MenuItem>
                        <MenuItem icon={<RiLogoutBoxFill />} onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Sidebar>
            )}
        </>
    );
};

export default SidebarElisas;
