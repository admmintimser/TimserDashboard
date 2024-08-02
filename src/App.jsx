// src/App.jsx
import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DashboardClient from "./components/DashboardClient";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import Flebos from "./components/Flebos";
import { Context } from "./main";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidebarComponent from "./components/Sidebar";
import AddNewAdmin from "./components/AddNewAdmin";
import AddNewFleb from "./components/AddNewFleb";
import Elisas from "./components/Elisas";
import WesternBlot from "./components/WesternBlot";
import Informe from './components/Informe';
import Recepcion from "./components/Recepcion"; 
import Clientes from "./components/Clientes"; 
import Cuestionario from "./components/Cuestionario";
import ProtectedRoute from "./components/ProtectedRoute"; 
import PreventixDashboard from "./components/PreventixDashboard"; 
import EstatusPreventixDashboard from "./components/EstatusPreventixDashboard";
import "./App.css";

const App = () => {
    const { isAuthenticated, setIsAuthenticated, admin, setAdmin, userRole, setUserRole } = useContext(Context);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(
                    "https://webapitimser.azurewebsites.net/api/v1/user/admin/me",
                    { withCredentials: true }
                );
                setIsAuthenticated(true);
                setAdmin(response.data.user);
                setUserRole(response.data.user.role); 
            } catch (error) {
                setIsAuthenticated(false);
                setAdmin({});
                setUserRole(""); 
            }
        };
        fetchUser();
    }, [isAuthenticated]);

    return (
        <Router>
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
                            <Route path="/estatus-preventix-dashboard" element={<EstatusPreventixDashboard />} /> {/* New route */}
                        </Route>
                        
                        <Route element={<ProtectedRoute roles={["Receptionist"]} />}>
                            <Route path="/reception" element={<Recepcion />} />
                            <Route path="/dashclient" element={<DashboardClient />} />
                            <Route path="/elisas" element={<Elisas />} />
                            <Route path="/westernblot" element={<WesternBlot />} />
                            <Route path="/data-for-dashboard" element={<Informe />} />
                            <Route path="/estatus-preventix-dashboard" element={<EstatusPreventixDashboard />} /> {/* New route */}
                        </Route>

                        <Route path="*" element={<Navigate to="/" />} /> 
                    </Routes>
                    <ToastContainer position="top-center" />
                </div>
            </div>
        </Router>
    );
};

export default App;
