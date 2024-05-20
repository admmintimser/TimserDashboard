import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Context } from "../main";

const AddNewFleb = () => {
  const { isAuthenticated, authToken } = useContext(Context);

  const [flebData, setFlebData] = useState({
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
    setFlebData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleAddNewFleb = async (e) => {
    e.preventDefault();
    if (!authToken) {
      toast.error("Authentication token not found. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(
        "https://webapitimser.azurewebsites.net/api/v1/user/flebo/addnew",
        flebData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
      );
      toast.success(response.data.message);
      navigateTo("/dashboard"); // Redirecting after successful addition
      setFlebData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        password: ""
      }); // Resetting form
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add new flebotomist");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="page">
      <section className="container form-component add-fleb-form">
        <img src="/logo.png" alt="logo" className="logo"/>
        <h1 className="form-title">Agregar Flebotomista</h1>
        <form onSubmit={handleAddNewFleb}>
          <input
            type="text"
            name="firstName"
            placeholder="Nombre(s)"
            value={flebData.firstName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Apellidos"
            value={flebData.lastName}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={flebData.email}
            onChange={handleChange}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Teléfono"
            value={flebData.phone}
            onChange={handleChange}
          />
          <input
            type="date"
            name="dob"
            placeholder="Fecha de nacimiento"
            value={flebData.dob}
            onChange={handleChange}
          />
          <select name="gender" value={flebData.gender} onChange={handleChange}>
            <option value="">Género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={flebData.password}
            onChange={handleChange}
          />
          <button type="submit" style={{ margin: "10px 0" }}>Agregar Flebotomista</button>
        </form>
      </section>
    </section>
  );
};

export default AddNewFleb;
