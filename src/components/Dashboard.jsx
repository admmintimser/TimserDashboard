import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaSearch } from "react-icons/fa";
import PrintButton from "./PrintButton";
import moment from "moment-timezone";
import { DNA } from "react-loader-spinner";
import "./dashboard.css";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentst, setAppointmentst] = useState(0);
  const [appointmentstp, setAppointmentstp] = useState(0);
  const [tokenDevel, setTokenDevel] = useState(null);
  const { isAuthenticated, authToken, admin } = useContext(Context);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [searchTerm, setSearchTerm] = useState("");
  const [successfulUpdates, setSuccessfulUpdates] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [customerMapping, setCustomerMapping] = useState({});
  const [loading, setLoading] = useState(true);

  const cacheKey = "appointmentsCache";
  const cacheExpiry = 5 * 60 * 1000; // 5 minutos

  const fetchData = useCallback(async () => {
    setLoading(true);
    const cachedData = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(`${cacheKey}_time`);

    if (cachedData && cachedTime && Date.now() - cachedTime < cacheExpiry) {
      setAppointments(JSON.parse(cachedData));
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("https://webapitimser.azurewebsites.net/api/v1/appointment/getall", { withCredentials: true });
      if (response.data.appointments) {
        const appointmentsData = response.data.appointments.reverse();
        setAppointments(appointmentsData);
        sessionStorage.setItem(cacheKey, JSON.stringify(appointmentsData));
        sessionStorage.setItem(`${cacheKey}_time`, Date.now());
      } else {
        throw new Error("No appointments data received");
      }
    } catch (error) {
      toast.error("Error fetching appointments: " + error.message);
      setAppointments([]);
    }
    setLoading(false);
  }, []);

  const fetchLocationsAndCustomers = useCallback(async () => {
    try {
      const response = await axios.get("https://webapitimser.azurewebsites.net/api/v1/cliente/getall", { withCredentials: true });
      if (response.data.clientes) {
        const uniqueLocations = [
          ...new Set(response.data.clientes.flatMap(cliente => cliente.lugaresToma))
        ];
        setLocations(uniqueLocations);

        const customerMap = {};
        response.data.clientes.forEach(cliente => {
          cliente.lugaresToma.forEach(lugar => {
            customerMap[lugar] = cliente.idDevellab;
          });
        });
        setCustomerMapping(customerMap);
      } else {
        throw new Error("No clients data received");
      }
    } catch (error) {
      toast.error("Error fetching client locations and customers: " + error.message);
      setLocations([]);
      setCustomerMapping({});
    }
  }, []);

  const fetchDatat = useCallback(async () => {
    try {
      const response = await axios.get("https://webapitimser.azurewebsites.net/api/v1/appointment/count/today", { withCredentials: true });
      if (response.data.count !== undefined) {
        setAppointmentst(response.data.count);
      } else {
        throw new Error("No count data received");
      }
    } catch (error) {
      toast.error("Error fetching appointments: " + error.message);
      setAppointmentst(0);
    }
  }, []);

  const fetchDatatp = useCallback(async () => {
    try {
      const response = await axios.get("https://webapitimser.azurewebsites.net/api/v1/appointment/count/today-processed", { withCredentials: true });
      if (response.data.count !== undefined) {
        setAppointmentstp(response.data.count);
      } else {
        throw new Error("No count data received");
      }
    } catch (error) {
      toast.error("Error fetching appointments: " + error.message);
      setAppointmentstp(0);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchLocationsAndCustomers();
    fetchDatat();
    fetchDatatp();
    const interval = setInterval(fetchData, 60000);
    const interval1 = setInterval(fetchDatat, 60000);
    const interval2 = setInterval(fetchDatatp, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, [fetchData, fetchLocationsAndCustomers, fetchDatat, fetchDatatp]);

  const addPatient = () => setShowModal(true);

  const handleModalClose = () => {
    setShowModal(false);
    resetFormValues();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "email" && { confirmEmail: value }),
    }));
  };

  const handleFormSubmit1 = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://webapitimser.azurewebsites.net/api/v1/appointment/post", {
        ...formValues,
        birthDate: moment(formValues.birthDate).tz("America/Mexico_City").format(),
      }, { withCredentials: true });
      toast.success("Cita creada con éxito");
      handleModalClose();
      fetchData();
    } catch (error) {
      toast.error("Error al crear la cita: " + error.message);
    }
  };

  const handleUpdateDevelab = async (appointmentId, newStatus, appointment) => {
    if (successfulUpdates[appointmentId]) {
      const confirm = window.confirm("Esta cita ya fue procesada con éxito. ¿Deseas enviar de nuevo?");
      if (!confirm) return;
    }

    try {
      const currentDateTime = moment().tz("America/Mexico_City").toISOString();
      await axios.put(`https://webapitimser.azurewebsites.net/api/v1/appointment/update/${appointmentId}`, {
        tomaEntregada: newStatus,
        tomaProcesada: true,
        fechaToma: currentDateTime,
      }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt._id === appointmentId ? { ...appt, tomaEntregada: newStatus, tomaProcesada: true, fechaToma: currentDateTime } : appt
        )
      );

      setSuccessfulUpdates(prev => ({ ...prev, [appointmentId]: true }));
      toast.success("Estatus Develab actualizado con éxito");

      if (newStatus) {
        await performExternalApiCalls(appointment);
      }
    } catch (error) {
      toast.error("Error al actualizar el estatus Develab");
      setSuccessfulUpdates(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  const performExternalApiCalls = async (appointment) => {
    try {
      const loginResponse = await axios.post("https://webapi.devellab.mx/api/Account/login", {
        username: "preventix",
        password: "7b5cbac342284010ac18f17ceba6364f",
      });
      const token = loginResponse.data.accessToken;
      setTokenDevel(token);

      const patientData = {
        code: "",
        name: appointment.patientFirstName,
        lastname: appointment.patientLastName,
        address: "",
        phone: appointment.mobilePhone,
        birthDate: appointment.birthDate,
        gender: "F",
        email: appointment.email,
        comment: "",
        customerId: -1,
        extraField1: "",
        extraField2: "",
        extraField3: "",
        extraField4: "",
        extraField5: "",
        extraField6: "",
      };

      const patientResponse = await axios.post("https://webapi.devellab.mx/api/Patient/", patientData, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      const customerId = patientResponse.data.customerId;

      const fechaTomaValida = appointment.fechaToma ? moment(appointment.fechaToma).tz("America/Mexico_City") : moment().tz("America/Mexico_City");
      const sampleDate = fechaTomaValida.toISOString().slice(0, 16);

      const mappedCustomerId = customerMapping[appointment.sampleLocation] || 1783;

      const orderData = {
        branchId: 1,
        patientId: customerId,
        observations: "",
        customerId: mappedCustomerId,
        customerOrderNumber: "",
        extraField1: "",
        extraField2: "",
        extraField3: "",
        extraField4: "",
        extraField5: "",
        extraField6: "",
        exams: [{ examId: "E-470" }],
        sampleDate: sampleDate,
      };

      const orderResponse = await axios.post("https://webapi.devellab.mx/api/Order/", orderData, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      const updateFields = {
        FolioDevelab: orderResponse.data.orderNumber,
        OrderIDDevelab: orderResponse.data.orderId,
      };

      await axios.put(`https://webapitimser.azurewebsites.net/api/v1/appointment/update/${appointment._id}`, updateFields, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt._id === appointment._id ? { ...appt, ...updateFields } : appt
        )
      );

      toast.success("Paciente cargado exitosamente a Devellab y actualizado localmente");
    } catch (error) {
      toast.error("Error al procesar la información del paciente en Devellab o localmente: " + error.message);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm("¿Estás seguro que deseas eliminar esta cita?")) {
      try {
        await axios.delete(`https://webapitimser.azurewebsites.net/api/v1/appointment/delete/${appointmentId}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setAppointments(prevAppointments => prevAppointments.filter(appt => appt._id !== appointmentId));
        toast.success("Cita eliminada con éxito");
      } catch (error) {
        toast.error("Error al eliminar la cita");
      }
    }
  };

  const handleUpdateAppointment = async (appointmentId, updatedFields) => {
    try {
      await axios.put(`https://webapitimser.azurewebsites.net/api/v1/appointment/update/${appointmentId}`, {
        ...updatedFields,
        birthDate: moment(updatedFields.birthDate).tz("America/Mexico_City").format(),
      }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt._id === appointmentId ? { ...appt, ...updatedFields } : appt
        )
      );
      toast.success("Cita actualizada con éxito");
      setEditingAppointment(null);
      resetFormValues();
    } catch (error) {
      toast.error("Error al actualizar la cita");
    }
  };

  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment._id);
    setFormValues({
      ...appointment,
      birthDate: appointment.birthDate.split('T')[0],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleUpdateAppointment(editingAppointment, formValues);
  };

  const downloadExcel = async () => {
    try {
      const response = await axios.get("https://webapitimser.azurewebsites.net/api/v1/appointment/getall/today", { withCredentials: true });
      const appointments = response.data.appointments;
      const worksheet = XLSX.utils.json_to_sheet(appointments);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pacientes");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, "Reporte.xlsx");
    } catch (error) {
      toast.error("Error downloading Excel file: " + error.message);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment =>
      appointment._id.toLowerCase().includes(searchTerm) ||
      appointment.patientFirstName.toLowerCase().includes(searchTerm) ||
      appointment.patientLastName.toLowerCase().includes(searchTerm) ||
      appointment.sampleLocation.toLowerCase().includes(searchTerm)
    );
  }, [appointments, searchTerm]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <DNA
          visible={true}
          height="80"
          width="80"
          ariaLabel="dna-loading"
          wrapperStyle={{}}
          wrapperClass="dna-wrapper"
        />
      </div>
    );
  }

  return (
    <section className="dashboard page">
      <div className="banner">
        <InfoBox title="Cuestionarios" count={appointmentst} />
        <InfoBox title="Tomadas" count={appointmentstp} />
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Actions fetchData={fetchData} fetchDatat={fetchDatat} fetchDatatp={fetchDatatp} downloadExcel={downloadExcel} addPatient={addPatient} />
      </div>
      <div className="bannerd">
        {showModal && (
          <Modal handleModalClose={handleModalClose} handleFormSubmit1={handleFormSubmit1} formValues={formValues} handleFormChange={handleFormChange} locations={locations} />
        )}
        <AppointmentTable
          filteredAppointments={filteredAppointments}
          editingAppointment={editingAppointment}
          handleEditClick={handleEditClick}
          handleDeleteAppointment={handleDeleteAppointment}
          handleFormSubmit={handleFormSubmit}
          handleInputChange={handleInputChange}
          formValues={formValues}
          handleUpdateDevelab={handleUpdateDevelab}
        />
      </div>
    </section>
  );
};

const initialFormValues = {
  privacyConsent: true,
  informedConsent: true,
  fastingHours: 4,
  patientFirstName: "",
  patientLastName: "",
  email: "",
  birthDate: "",
  mobilePhone: "",
  sampleLocation: "",
};

const resetFormValues = () => ({
  privacyConsent: true,
  informedConsent: true,
  fastingHours: 4,
  patientFirstName: "",
  patientLastName: "",
  email: "",
  birthDate: "",
  mobilePhone: "",
  sampleLocation: "",
});

const InfoBox = ({ title, count }) => (
  <div className="secondBox">
    <p>{title}</p>
    <h3>{count}</h3>
  </div>
);

const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className="thirdBox">
    <div className="card-content">
      <input
        type="text"
        placeholder="Buscar por ID, nombre, apellido o lugar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        className="search-input"
      />
      <FaSearch className="card-icon" />
    </div>
  </div>
);

const Actions = ({ fetchData, fetchDatat, fetchDatatp, downloadExcel, addPatient }) => (
  <div className="card-content1">
    <button onClick={() => { fetchData(); fetchDatat(); fetchDatatp(); }} className="update-button">Actualizar</button>
    <button onClick={downloadExcel} className="download-button">Descargar Excel</button>
    <button onClick={addPatient} className="appoin-button">Agregar</button>
  </div>
);

const Modal = ({ handleModalClose, handleFormSubmit1, formValues, handleFormChange, locations }) => (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={handleModalClose}>&times;</span>
      <h2>Agregar Nueva Cita</h2>
      <form onSubmit={handleFormSubmit1}>
        <input type="text" name="patientFirstName" placeholder="Nombre" value={formValues.patientFirstName} onChange={handleFormChange} className="input" required />
        <input type="text" name="patientLastName" placeholder="Apellido" value={formValues.patientLastName} onChange={handleFormChange} className="input" required />
        <input type="email" name="email" placeholder="Correo Electrónico" value={formValues.email} onChange={handleFormChange} className="input" required />
        <input type="date" name="birthDate" placeholder="Fecha de Nacimiento" value={formValues.birthDate} onChange={handleFormChange} className="input" required />
        <input type="text" name="mobilePhone" placeholder="Teléfono móvil" value={formValues.mobilePhone} onChange={handleFormChange} className="input" required />
        <select name="sampleLocation" onChange={handleFormChange} className="input" required>
          <option value="">Selecciona una ubicación</option>
          {locations.map((location, index) => <option key={index} value={location}>{location}</option>)}
        </select>
        <button type="submit" className="save-button">Guardar</button>
      </form>
    </div>
  </div>
);

const AppointmentTable = ({ filteredAppointments, editingAppointment, handleEditClick, handleDeleteAppointment, handleFormSubmit, handleInputChange, formValues, handleUpdateDevelab }) => (
  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Correo</th>
        <th>Lugar de toma</th>
        <th>Fecha de nacimiento</th>
        <th>Ayuno</th>
        <th>Tomada</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {filteredAppointments.length > 0 ? (
        filteredAppointments.map((appointment) => (
          <tr key={appointment._id}>
            {editingAppointment === appointment._id ? (
              <td colSpan="8">
                <form onSubmit={handleFormSubmit}>
                  <input type="text" name="patientFirstName" value={formValues.patientFirstName} onChange={handleInputChange} className="input" />
                  <input type="text" name="email" value={formValues.email} onChange={handleInputChange} className="input" />
                  <input type="text" name="patientLastName" value={formValues.patientLastName} onChange={handleInputChange} className="input" />
                  <input type="text" name="sampleLocation" value={formValues.sampleLocation} onChange={handleInputChange} className="input" />
                  <input type="date" name="birthDate" value={formValues.birthDate} onChange={handleInputChange} className="input" />
                  <input type="text" name="fastingHours" value={formValues.fastingHours} onChange={handleInputChange} className="input" />
                  <button type="submit" className="update-button">Guardar</button>
                  <button type="button" onClick={() => setEditingAppointment(null)} className="cancel-button">Cancelar</button>
                </form>
              </td>
            ) : (
              <>
                <td>{`${appointment.patientFirstName} ${appointment.patientLastName}`}</td>
                <td>{appointment.email}</td>
                <td>{appointment.sampleLocation}</td>
                <td>{appointment.birthDate.split('T')[0]}</td>
                <td>{appointment.fastingHours}</td>
                <td>
                  <button
                    onClick={() => handleUpdateDevelab(appointment._id, true, appointment)}
                    className={`processbot ${appointment.tomaEntregada ? "processbot-green" : ""}`}
                  >
                    Procesar Toma
                  </button>
                </td>
                <td>
                  <PrintButton appointment={appointment} />
                  <button onClick={() => handleEditClick(appointment)} className="update-button1">Editar</button>
                  <button onClick={() => handleDeleteAppointment(appointment._id)} className="delete-button">Eliminar</button>
                </td>
              </>
            )}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="8">No appointments found.</td>
        </tr>
      )}
    </tbody>
  </table>
);

export default Dashboard;
