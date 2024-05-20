import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          "https://webapitimser.azurewebsites.net/api/v1/appointment/getall",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,  // Include the authorization token
            }
          }
        );
        setAppointments(data.appointments);
      } catch (error) {
        console.error("Error fetching data", error);
        setAppointments([]);
      }
    };
    fetchData();
  }, []);

  const handleUpdateDevelab = async (appointmentId, newStatus) => {
    try {
      const { data } = await axios.put(
        `https://webapitimser.azurewebsites.net/api/v1/appointment/update/${appointmentId}`,
        { tomaEntregada: newStatus },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,  // Include the authorization token
          }
        }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, tomaEntregada: newStatus }
            : appointment
        )
      );
      toast.success("Estatus Develab actualizado con éxito");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al actualizar el estatus Develab");
    }
  };
  const handleUpdateFlebo = async (appointmentId, newFlebo) => {
    try {
      const { data } = await axios.put(
        `https://webapitimser.azurewebsites.net/api/v1/appointment/update/${appointmentId}`,
        { flebotomista: newFlebo },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,  // Include the authorization token
          }
        }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, flebotomista: newFlebo }
            : appointment
        )
      );
      toast.success("Flebotomista actualizado con éxito");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al actualizar el flebotomista");
    }
  };


  const handleUpdateDateTime = async (appointmentId, newDateTime) => {
    try {
      const { data } = await axios.put(
        `https://webapitimser.azurewebsites.net/api/v1/appointment/update/${appointmentId}`,
        { fechaToma: newDateTime },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,  // Include the authorization token
          }
        }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, fechaToma: newDateTime }
            : appointment
        )
      );
      toast.success("Fecha y hora actualizadas con éxito");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al actualizar la fecha y hora");
    }
  };

  const { isAuthenticated, admin } = useContext(Context);
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <>
      <section className="dashboard page">
        <div className="banner">
          <div className="firstBox">
            <div className="content">
              <div>
                <h5>{admin && `${admin.firstName} ${admin.lastName}`}</h5>
              </div>
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
                      onChange={(e) => handleUpdateDateTime(appointment._id, 'tomaProcesada', e.target.value === 'true')}
                      className={appointment.tomaProcesada ? "value-accepted" : "value-rejected"}
                    >
                      <option value="true">Procesada</option>
                      <option value="false">Enviada</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={appointment.flebotomista}
                      onChange={(e) => handleUpdateFlebo(appointment._id, e.target.value)}
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
                      onChange={(e) => handleUpdateDateTime(appointment._id, e.target.value)}
                      className="date-time-input"
                    />
                  </td>
                  <td>
                    <select
                      value={appointment.tomaEntregada}
                      onChange={(e) => handleUpdateDevelab(appointment._id, e.target.value === 'true')}
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
