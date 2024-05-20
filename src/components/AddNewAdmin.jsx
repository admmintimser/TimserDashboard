import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const AddNewAdmin = () => {
  const { isAuthenticated, authToken } = useContext(Context);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    password: ""
  });

  const navigateTo = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewAdmin = async (e) => {
    e.preventDefault();
    if (!authToken) {
      toast.error("No authentication token. Please log in again.");
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };

    try {
      const response = await axios.post(
        "https://webapitimser.azurewebsites.net/api/v1/user/admin/addnew",
        formData,
        { withCredentials: true, headers }
      );
      toast.success(response.data.message);
      navigateTo("/dashboard"); // Assuming you want to redirect to a dashboard after adding
      setFormData({ firstName: "", lastName: "", email: "", phone: "", dob: "", gender: "", password: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add new admin");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="page">
      <section className="container form-component add-admin-form">
        <img src="/logo.png" alt="logo" className="logo"/>
        <h1 className="form-title">Agregar nuevo administrador</h1>
        <form onSubmit={handleAddNewAdmin}>
          <div>
            <input
              type="text"
              name="firstName"
              placeholder="Nombre(s)"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Apellidos"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Correo"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              type="date"
              name="dob"
              placeholder="Date of Birth"
              value={formData.dob}
              onChange={handleChange}
            />
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div style={{ justifyContent: "center", alignItems: "center" }}>
            <button type="submit">Registrar Admin</button>
          </div>
        </form>
      </section>
    </section>
  );
};

export default AddNewAdmin;
