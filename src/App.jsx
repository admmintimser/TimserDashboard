import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DashboardClient from "./components/DashboardClient";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import Flebos from "./components/Flebos";
import Sidebar from "./components/Sidebar";
import AddNewAdmin from "./components/AddNewAdmin";
import AddNewFleb from "./components/AddNewFleb";
import Elisas from "./components/Elisas";
import WesternBlot from "./components/WesternBlot";
import Informe from './components/Informe';
import "./App.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Context } from "./main";

const App = () => {
  const { isAuthenticated, setIsAuthenticated, admin, setAdmin, authToken } = useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      if (!authToken) {
        toast.info("No authentication token found, please login.");
        return;  // Stop the function if there is no token
      }
      try {
        const response = await axios.get("https://webapitimser.azurewebsites.net/api/v1/user/admin/me", {
          headers: {
            Authorization: `Bearer ${authToken}`,  // Assuming authToken is stored and managed in your context
          },
          withCredentials: true
        });
        setIsAuthenticated(true);
        setAdmin(response.data.user);
        toast.success("Login Successful!");
      } catch (error) {
        setIsAuthenticated(false);
        setAdmin({});
        toast.error(`Failed to fetch user data: ${error.response ? error.response.data.message : error.message}`);
      }
    };

    if (!isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, setIsAuthenticated, setAdmin, authToken]);  // Include authToken in the dependencies array

  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor/addnew" element={<AddNewDoctor />} />
        <Route path="/admin/addnew" element={<AddNewAdmin />} />
        <Route path="/flebo/addnew" element={<AddNewFleb />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/flebos" element={<Flebos />} />
        <Route path="/dashclient" element={<DashboardClient />} />
        <Route path="/elisas" element={<Elisas />} />
        <Route path="/westernblot" element={<WesternBlot />} />
        <Route path="/data-for-dashboard" element={<Informe />} />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;
