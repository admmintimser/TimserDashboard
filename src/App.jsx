import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom"; // No es necesario importar BrowserRouter aquí
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
import AddNewAdmin from "./components/AddNewAdmin";
import AddNewFleb from "./components/AddNewFleb";
import PreventixDashboard from "./components/PreventixDashboard"; 
import EstatusPreventixDashboard from "./components/EstatusPreventixDashboard";
import { Context } from "./main";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const App = () => {
    const { isAuthenticated, setIsAuthenticated, admin, setAdmin, userRole, setUserRole } = useContext(Context);
    const location = useLocation(); // Esto funcionará porque App está dentro de Router

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get("https://webapitimser.azurewebsites.net/api/v1/user/admin/me", { withCredentials: true });
                setIsAuthenticated(true);
                setAdmin(response.data.user);
                setUserRole(response.data.user.role);

                // Persistir estado de autenticación y rol en localStorage
                localStorage.setItem("isAuthenticated", true);
                localStorage.setItem("admin", JSON.stringify(response.data.user));
                localStorage.setItem("userRole", response.data.user.role);

                // Redirigir a la última ruta guardada si la hay
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
            }
        };
        fetchUser();
    }, [setIsAuthenticated, setAdmin, setUserRole, location.pathname]);

    useEffect(() => {
        if (isAuthenticated) {
            // Guardar la ruta actual en localStorage
            localStorage.setItem("lastPath", location.pathname);
        }
    }, [location.pathname, isAuthenticated]);

    return (
        <div className="app-container">
            <SidebarComponent />
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/login" element={<Login />} />
                    
                    <Route element={<ProtectedRoute roles={["Admin"]} />}>
                        <Route path="/doctor/addnew" element={<AddNewDoctor />} />
                        <Route path="/admin/addnew" element={<AddNewAdmin />} />
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
                        <Route path="/estatus-preventix-dashboard" element={<EstatusPreventixDashboard />} />
                    </Route>
                    
                    <Route element={<ProtectedRoute roles={["Receptionist"]} />}>
                        <Route path="/reception" element={<Recepcion />} />
                        <Route path="/dashclient" element={<DashboardClient />} />
                        <Route path="/elisas" element={<Elisas />} />
                        <Route path="/westernblot" element={<WesternBlot />} />
                        <Route path="/data-for-dashboard" element={<Informe />} />
                        <Route path="/estatus-preventix-dashboard" element={<EstatusPreventixDashboard />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} /> 
                </Routes>
                <ToastContainer position="top-center" />
            </div>
        </div>
    );
};

export default App;
