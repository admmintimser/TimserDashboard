import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const WesternBlot = () => {
  const [appointments, setAppointments] = useState([]);
  const { isAuthenticated, authToken } = useContext(Context);

  useEffect(() => {
    if (!authToken) {
      toast.error("Authentication token not found. Please log in again.");
      return;
    }
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          "https://webapitimser.azurewebsites.net/api/v1/appointment/getall",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
        setAppointments(data.appointments);
      } catch (error) {
        console.error("Error fetching data", error);
        toast.error(error.response?.data?.message || "Failed to fetch appointments");
        setAppointments([]);
      }
    };
    fetchData();
  }, [authToken]);

  const handleUpdateField = async (appointmentId, field, newValue) => {
    try {
      const payload = { [field]: newValue };
      const { data } = await axios.put(
        `https://webapitimser.azurewebsites.net/api/v1/appointment/update/${appointmentId}`,
        payload,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId ? { ...appointment, ...payload } : appointment
        )
      );
      toast.success(`Field ${field} updated successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Error updating field ${field}`);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <>
      <section className="dashboard page">
        <h1>Western Blot Analysis</h1>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Folio</th>
              <th>Ayuno</th>
              <th>Fecha de Lavado</th>
              <th>Realizó Lavado</th>
              <th>Fecha de Precipitado</th>
              <th>Realizó Precipitado</th>
              <th>Resultado 4PL</th>
              <th>Interpretación Preventix</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? appointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>{`${appointment.patientFirstName} ${appointment.patientLastName}`}</td>
                <td>{appointment.FolioDevelab}</td>
                <td>{`${appointment.fastingHours} horas`}</td>
                {editableFields.map(field => (
                  <td key={field.key}>
                    <input
                      type={field.type}
                      value={appointment[field.key] || ''}
                      onChange={(e) => handleUpdateField(appointment._id, field.key, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            )) : <tr><td colSpan="10">No appointments found.</td></tr>}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default WesternBlot;
