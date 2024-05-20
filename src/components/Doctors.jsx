import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const { isAuthenticated, authToken } = useContext(Context); // Assuming authToken is also stored in context

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!authToken) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }
      try {
        const { data } = await axios.get(
          "https://webapitimser.azurewebsites.net/api/v1/user/doctors",
          {
            withCredentials: true,
            headers: {
              "Authorization": `Bearer ${authToken}` // Include the auth token in the request
            }
          }
        );
        setDoctors(data.doctors);
      } catch (error) {
        // Improved error handling
        const message = error.response ? error.response.data.message : "Failed to fetch doctors";
        toast.error(message);
      }
    };
    fetchDoctors();
  }, [authToken]); // Effect dependencies should include authToken

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="paged doctors">
      <h1>Doctors</h1>
      <div className="banner">
        {doctors && doctors.length > 0 ? (
          doctors.map((doctor, index) => (
            <div className="card" key={index}>
              <div className="details">
                <h4>{`${doctor.firstName} ${doctor.lastName}`}</h4> {/* Display full name */}
                <p>Email: <span>{doctor.email}</span></p>
                <p>Phone: <span>{doctor.phone}</span></p>
                <p>Department: <span>{doctor.department || 'N/A'}</span></p> {/* Added fallback for no department */}
                <p>NIC: <span>{doctor.nic}</span></p>
              </div>
            </div>
          ))
        ) : (
          <h2>No Doctors Found</h2> 
        )}
      </div>
    </section>
  );
};

export default Doctors;
