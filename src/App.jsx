import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DashboardClient from "./components/DashboardClient";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import Flebos from "./components/Flebos";
import Recepcion from "./components/Recepcion";
import Clientes from "./components/Clientes";
import Cuestionario from "./components/Cuestionario";
import Elisas from "./components/Elisas";
import WesternBlot from "./components/WesternBlot";
import Informe from './components/Informe';
import SidebarComponent from "./components/Sidebar";
import SidebarRecepcionist from "./components/SidebarRecepcionist";
import SidebarElisas from "./components/SidebarElisas";
import SidebarWesternBlot from "./components/SidebarWesternBlot";
import SidebarDireccion from "./components/SidebarDireccion";
import SidebarComercial from "./components/SidebarComercial";
import SidebarAdminLab from "./components/SidebarAdminLab";
import AddNewAdmin from "./components/AddNewAdmin";
import AddNewFleb from "./components/AddNewFleb";
import Validacion from "./components/Validacion";
import Liberacion from "./components/Liberacion";
import AddNewUser from "./components/AddNewUser";
import PreventixDashboard from "./components/PreventixDashboard";
import EstatusPreventixDashboard from "./components/EstatusPreventixDashboard";
import MuestrasLiberadas from "./components/MuestrasLiberadas";
import { Context } from "./main";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const App = () => {
    const { isAuthenticated, setIsAuthenticated, admin, setAdmin, userRole, setUserRole } = useContext(Context);
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true); // Estado para manejar la carga inicial

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get("https://webapitimser.azurewebsites.net/api/v1/user/me", { withCredentials: true });
                
                if (response.data && response.data.user) { // Verifica que la respuesta contenga datos
                    setIsAuthenticated(true);
                    setAdmin(response.data.user);
                    setUserRole(response.data.user.role);
                    localStorage.setItem("isAuthenticated", true);
                    localStorage.setItem("admin", JSON.stringify(response.data.user));
                    localStorage.setItem("userRole", response.data.user.role);
                }

                const lastPath = localStorage.getItem("lastPath");
                if (lastPath && lastPath !== location.pathname) {
                    window.history.replaceState(null, "", lastPath);
                }
            } catch (error) {
                setIsAuthenticated(false);
                setAdmin({});
                setUserRole("");
                localStorage.removeItem("isAuthenticated");
                localStorage.removeItem("admin");
                localStorage.removeItem("userRole");
            } finally {
                setIsLoading(false); // Termina la carga inicial
            }
        };
        fetchUser();
    }, [setIsAuthenticated, setAdmin, setUserRole, location.pathname]);

    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem("lastPath", location.pathname);
        }
    }, [location.pathname, isAuthenticated]);

    // Selecciona el Sidebar adecuado basado en el rol del usuario
    let Sidebar;
    switch (userRole) {
        case "Receptionist":
            Sidebar = SidebarRecepcionist;
            break;
        case "Elisas":
            Sidebar = SidebarElisas;
            break;
        case "Westernblot":
            Sidebar = SidebarWesternBlot;
            break;
        case "Direccion":
            Sidebar = SidebarDireccion;
            break;
        case "Comercial":
            Sidebar = SidebarComercial;
            break;
        case "AdminLab":
            Sidebar = SidebarAdminLab;
            break;
        default:
            Sidebar = SidebarComponent; // Default to admin or generic sidebar
    }

    // Muestra un mensaje de carga o spinner hasta que los datos estén listos
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/login" element={<Login />} />

                    {/* Rutas abiertas a todos los roles por ahora */}
                    <Route path="/doctor/addnew" element={<AddNewDoctor />} />
                    <Route path="/admin/addnew" element={<AddNewAdmin />} />
                    <Route path="/user/addnew" element={<AddNewUser />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/flebos" element={<Flebos />} />
                    <Route path="/reception" element={<Recepcion />} />
                    <Route path="/preventix" element={<PreventixDashboard />} />
                    <Route path="/dashclient" element={<DashboardClient />} />
                    <Route path="/elisas" element={<Elisas />} />
                    <Route path="/westernblot" element={<WesternBlot />} />
                    <Route path="/data-for-dashboard" element={<Informe />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/cuestionario" element={<Cuestionario />} />
                    <Route path="/validacion" element={<Validacion />} />
                    <Route path="/liberacion" element={<Liberacion />} />
                    <Route path="/estatus-preventix-dashboard" element={<EstatusPreventixDashboard />} />
                    <Route path="/reporte" element={<MuestrasLiberadas />} />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <ToastContainer position="top-center" />
            </div>
        </div>
    );
};

export default App;
