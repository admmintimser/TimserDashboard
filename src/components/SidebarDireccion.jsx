// src/components/SidebarDireccion.jsx
import React, { useContext, useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { sidebarClasses } from 'react-pro-sidebar';
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill, RiDashboardFill } from "react-icons/ri";
import { FaUsers } from "react-icons/fa";
import { BsCardChecklist } from "react-icons/bs";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SidebarDireccion = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { isAuthenticated, setIsAuthenticated } = useContext(Context);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = await axios.get("https://webapitimser.azurewebsites.net/api/v1/user/admin/logout", {
                withCredentials: true,
            });
            toast.success(res.data.message);
            setIsAuthenticated(false);
        } catch (err) {
            toast.error(err.response.data.message);
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
                        <MenuItem icon={<FaUsers />} component={<Link to="/clientes" />}>Clientes</MenuItem>
                        <MenuItem icon={<BsCardChecklist />} component={<Link to="/preventix" />}>Preventix</MenuItem>
                        <MenuItem icon={<BsCardChecklist />} component={<Link to="/estatus-preventix-dashboard" />}>Estatus</MenuItem>
                        <SubMenu label="Dashboard" icon={<RiDashboardFill />}>
                            <MenuItem icon={<RiDashboardFill />} component={<Link to="/dashclient" />}>
                                Client Dashboard
                            </MenuItem>
                        </SubMenu>
                        <MenuItem icon={<RiLogoutBoxFill />} onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Sidebar>
            )}
        </>
    );
};

export default SidebarDireccion;
