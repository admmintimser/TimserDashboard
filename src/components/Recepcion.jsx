// src/components/Recepcion.jsx
import React, { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import moment from "moment-timezone";
import { DNA } from 'react-loader-spinner';
import "./dashboard.css"; // Usar el mismo archivo CSS que el Dashboard

const Recepcion = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointments, setSelectedAppointments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formValues, setFormValues] = useState({
        tiempoInicioProceso: "",
        estatusMuestra: "Buen Estado",
        temperatura: ""
    });

    const { isAuthenticated } = useContext(Context);

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get(
                "https://webapitimser.azurewebsites.net/api/v1/appointment/getall",
                { withCredentials: true }
            );

            const appointments = response.data.appointments || [];
            const filteredAppointments = appointments.filter(appointment => appointment.tomaProcesada === true);
            setAppointments(filteredAppointments.reverse());
        } catch (error) {
            toast.error("Error fetching appointments: " + error.message);
            setAppointments([]);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleBarcodeInput = (e) => {
        const value = e.target.value.trim();
        setSearchTerm(value);
    };

    const handleClearBarcodeInput = () => {
        setSearchTerm("");
    };

    const handleSelectAppointment = (appointment) => {
        setSelectedAppointments((prev) =>
            prev.includes(appointment)
                ? prev.filter((appt) => appt !== appointment)
                : [...prev, appointment]
        );
    };

    const handleModalOpen = () => {
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setFormValues({
            tiempoInicioProceso: "",
            estatusMuestra: "Buen Estado",
            temperatura: ""
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            await Promise.all(selectedAppointments.map(appointment =>
                axios.post(
                    "https://webapitimser.azurewebsites.net/api/v1/preventix/post",
                    {
                        appointmentId: appointment._id,
                        tiempoInicioProceso: formValues.tiempoInicioProceso,
                        estatusMuestra: formValues.estatusMuestra,
                        temperatura: formValues.temperatura,
                        folioDevelab: appointment.FolioDevelab,
                        estatusTomaMuestra: true,
                        estatusRecepcion: true
                    },
                    { withCredentials: true }
                )
            ));
            toast.success("Preventix entries created successfully");
            handleModalClose();
            fetchData();
        } catch (error) {
            toast.error("Error creating Preventix entries: " + error.message);
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const filteredAppointments = appointments.filter(appointment =>
        (appointment.FolioDevelab && appointment.FolioDevelab.toString().includes(searchTerm)) ||
        (appointment.patientFirstName && appointment.patientFirstName.toLowerCase().includes(searchTerm)) ||
        (appointment.patientLastName && appointment.patientLastName.toLowerCase().includes(searchTerm)) ||
        (appointment.email && appointment.email.toLowerCase().includes(searchTerm)) ||
        (appointment.sampleLocation && appointment.sampleLocation.toLowerCase().includes(searchTerm))
    );

    if (!appointments.length) {
        return (
            <div className="loading-container">
                    <DNA
                    visible={true}
                    height="180"
                    width="180"
                    color="pink"
                    ariaLabel="dna-loading"
                    wrapperClass="dna-wrapper"
                    />
            </div>
        );
    }

    return (
        <section className="dashboard page">
            <div className="banner">
                <div className="secondBox">
                    <p>Muestras Tomadas</p>
                    <h3>{appointments.length}</h3>
                </div>
                <div className="thirdBox">
          <div className="card-content">
          <button onClick={handleModalOpen} className="appoin-button1">
                    Ingresar a Laboratorio
                </button>
                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={handleModalClose}>
                                &times;
                            </span>
                            <h2>Ingresar a Laboratorio</h2>
                            <form onSubmit={handleFormSubmit}>
                                <input
                                    type="datetime-local"
                                    name="tiempoInicioProceso"
                                    placeholder="Tiempo de Inicio de Proceso"
                                    value={formValues.tiempoInicioProceso}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                />
                                <select
                                    name="estatusMuestra"
                                    onChange={handleFormChange}
                                    className="input"
                                    value={formValues.estatusMuestra}
                                    required
                                >
                                    <option value="Buen Estado">Buen Estado</option>
                                    <option value="Lipémica">Lipémica</option>
                                    <option value="Hemolizada">Hemolizada</option>
                                    <option value="Ictericia">Ictericia</option>
                                </select>
                                <input
                                    type="number"
                                    name="temperatura"
                                    placeholder="Temperatura º"
                                    value={formValues.temperatura}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                />
                                <button type="submit" className="save-button">
                                    Guardar
                                </button>
                            </form>
                        </div>
                    </div>
                )}
          </div>
          <div className="card-content">
          <div className="barcode-container">
                    <input
                        type="text"
                        id="barcode-input"
                        placeholder="Escanear código de barras"
                        className="barcode-input"
                        value={searchTerm}
                        onChange={handleBarcodeInput}
                        autoFocus
                    />
                    <FaTrash className="clear-icon" onClick={handleClearBarcodeInput} />
                </div>
          </div>
          </div>
            </div>
            <div className="appointments-list">
                
                <table>
                    <thead>
                        <tr>
                            <th>Seleccionar</th>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Lugar de Toma</th>
                            <th>Folio Develab</th>
                            <th>Fecha Toma</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map((appointment) => (
                                <tr key={appointment._id}>
                                    <td>
                                        <input
                                            className="roundedOne"
                                            type="checkbox"
                                            checked={selectedAppointments.includes(appointment)}
                                            onChange={() => handleSelectAppointment(appointment)}
                                        />
                                    </td>
                                    <td>{`${appointment.patientFirstName} ${appointment.patientLastName}`}</td>
                                    <td>{appointment.email}</td>
                                    <td>{appointment.sampleLocation}</td>
                                    <td>{appointment.FolioDevelab}</td>
                                    <td>{moment(appointment.fechaToma).format("YYYY-MM-DD HH:mm")}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No se encontraron citas procesadas hoy.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default Recepcion;
