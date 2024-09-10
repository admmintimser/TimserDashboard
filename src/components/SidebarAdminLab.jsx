// src/components/Sidebar.jsx
import React, { useContext, useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { sidebarClasses } from 'react-pro-sidebar';
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill, RiDashboardLine, RiPassValidLine  } from "react-icons/ri";
import { FaVials } from "react-icons/fa";
import { IoCloudUploadOutline  } from "react-icons/io5";
import { FaVialCircleCheck } from "react-icons/fa6";
import { SlChemistry } from "react-icons/sl";
import { BsReception4, BsCardChecklist } from "react-icons/bs";
import { GiHamburgerMenu } from "react-icons/gi";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate } from "react-router-dom";

const SidebarAdminLab = () => {
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

  const handleNavigation = (path) => {
    navigate(path);
    setCollapsed(false);
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
                  backgroundColor: '#005f73', // Hover color
                  color: 'white',
                },
                [`&.active`]: {
                  backgroundColor: '#0d7a79', // Background color when active
                  color: '#005f73', // Text color when active
                },
              },
              label: {
                color: 'white', // Ensures submenu labels are white
              },
              submenuContent: {
                backgroundColor: '#0d7a79', // Background color for submenu
              }
            }}
          >
            {/* Add the image at the top */}
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '80%', maxWidth: '200px' }} />
            </div>
            <MenuItem icon={<GiHamburgerMenu />}  onClick={() => setCollapsed(!collapsed)}>Menu</MenuItem>

            <MenuItem icon={<TiHome />} component={<Link to="/" />}>Home</MenuItem>
            <MenuItem icon={<RiDashboardLine />} component={<Link to="/westernblot" />}>
                Western Blot
              </MenuItem>
              <MenuItem icon={<SlChemistry />} component={<Link to="/elisas" />}>
                Elisas
              </MenuItem>
              <MenuItem icon={<BsReception4 />} component={<Link to="/receptionlab" />}>
                Recepción
              </MenuItem>
              <MenuItem icon={<FaVials />} component={<Link to="/preventix" />}>
                Preventix
              </MenuItem>
              <MenuItem icon={<BsCardChecklist />} component={<Link to="/estatus-preventix-dashboard" />}>
                Estatus Muestra
              </MenuItem>
              <MenuItem icon={<RiPassValidLine  />} component={<Link to="/validacion" />}>
                Validación
              </MenuItem>
              <MenuItem icon={<FaVialCircleCheck  />} component={<Link to="/liberacion" />}>
                Liberación
              </MenuItem>
              <MenuItem icon={<IoCloudUploadOutline  />} component={<Link to="/reporte" />}>
                Carga Masiva
              </MenuItem>
            
            <MenuItem icon={<RiLogoutBoxFill />} onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Sidebar>
      )}
    </>
  );
};

export default SidebarAdminLab;
