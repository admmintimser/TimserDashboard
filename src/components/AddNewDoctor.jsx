import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";

const AddNewDoctor = () => {
  const { isAuthenticated, authToken } = useContext(Context);

  const [doctorData, setDoctorData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nic: "",  // Assuming NIC is a unique identifier like a medical license number
    password: ""
  });

  const navigateTo = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleAddNewDoctor = async (e) => {
    e.preventDefault();
    if (!authToken) {
      toast.error("Authentication token not found. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(
        "https://webapitimser.azurewebsites.net/api/v1/user/doctor/addnew",
        { ...doctorData, role: "Doctor" },  // Explicitly setting the role
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`  // Including the auth token in the header
          }
        }
      );
      toast.success(response.data.message);
      navigateTo("/dashboard");  // Assuming you want to redirect to a dashboard
      setDoctorData({ firstName: "", lastName: "", email: "", phone: "", nic: "", password: "" }); // Reset form
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add new doctor");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="page">
      <section className="container add-doctor-form">
        <img src="/logo.png" alt="logo" className="logo"/>
        <h1 className="form-title">Register New Doctor</h1>
        <form onSubmit={handleAddNewDoctor}>
          <div className="form-wrapper">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={doctorData.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={doctorData.lastName}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={doctorData.email}
              onChange={handleChange}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={doctorData.phone}
              onChange={handleChange}
            />
            <input
              type="text"
              name="nic"
              placeholder="NIC"
              value={doctorData.nic}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={doctorData.password}
              onChange={handleChange}
            />
            <button type="submit" className="btn btn-primary">Register Doctor</button>
          </div>
        </form>
      </section>
    </section>
  );
};

export default AddNewDoctor;
