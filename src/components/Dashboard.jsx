import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const { isAuthenticated, authToken, admin } = useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
        if (!authToken) {
            console.error("Authentication token not available.");
            return;
        }
        try {
            const response = await axios.get(
                "https://webapitimser.azurewebsites.net/api/v1/user/admin/me",
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    withCredentials: true,
                }
            );
            setIsAuthenticated(true);
            setAdmin(response.data.user);
        } catch (error) {
            setIsAuthenticated(false);
            setAdmin({});
            console.error("Failed to fetch user data", error);
            toast.error("Failed to authenticate.");
        }
    };
    if (isAuthenticated) {
        fetchUser();
    }
}, [authToken, isAuthenticated]);  // Include authToken in the dependencies

  const handleUpdate = async (appointmentId, field, newValue) => {
    try {
      const { data } = await axios.put(
        `https://webapitimser.azurewebsites.net/api/v1/appointment/update/${appointmentId}`,
        { [field]: newValue },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          }
        }
      );
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment._id === appointmentId ? { ...appointment, [field]: newValue } : appointment
        )
      );
      toast.success(`Appointment ${field} updated successfully.`);
    } catch (error) {
      toast.error(`Failed to update appointment: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <section className="dashboard page">
        <div className="banner">
          <div className="firstBox">
            <div className="content">
              <h5>{admin && `${admin.firstName} ${admin.lastName}`}</h5>
            </div>
          </div>
          <div className="secondBox">
            <p>Pacientes</p>
            <h3>{appointments.length}</h3>
          </div>
          <div className="thirdBox">
            <p>Procesadas</p>
            <h3>{appointments.filter(appt => appt.tomaProcesada).length}</h3>
          </div>
        </div>
        <div className="banner">
          <h5>Preventix</h5>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Lugar de toma</th>
                <th>Ayuno</th>
                <th>Procesada</th>
                <th>Flebotomista</th>
                <th>Fecha y Hora de Toma</th>
                <th>Estatus Develab</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{`${appointment.patientFirstName} ${appointment.patientLastName}`}</td>
                  <td>{appointment.sampleLocation}</td>
                  <td>{`${appointment.fastingHours} horas`}</td>
                  <td>
                    <select
                      value={appointment.tomaProcesada}
                      onChange={(e) => handleUpdate(appointment._id, 'tomaProcesada', e.target.value === 'true')}
                      className={appointment.tomaProcesada ? "value-accepted" : "value-rejected"}
                    >
                      <option value="true">Procesada</option>
                      <option value="false">Enviada</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={appointment.flebotomista}
                      onChange={(e) => handleUpdate(appointment._id, 'flebotomista', e.target.value)}
                      className="dropdown-selector"
                    >
                      <option value="">Selecciona un flebotomista</option>
                      <option value="Gabriela Mata">Gabriela Mata</option>
                      <option value="Nohemi Garcia">Nohemi Garcia</option>
                      <option value="Ayudante MHS">Ayudante MHS</option>
                      <option value="MHS">MHS</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      value={appointment.fechaToma ? new Date(appointment.fechaToma).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleUpdate(appointment._id, 'fechaToma', e.target.value)}
                      className="date-time-input"
                    />
                  </td>
                  <td>
                    <select
                      value={appointment.tomaEntregada}
                      onChange={(e) => handleUpdate(appointment._id, 'tomaEntregada', e.target.value === 'true')}
                      className="dropdown-selector"
                    >
                      <option value="false">Pendiente</option>
                      <option value="true">Enviada</option>
                    </select>
                  </td>
                </tr>
              )) : <tr><td colSpan="7">No appointments found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
