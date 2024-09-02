// src/components/RecepcionLab.jsx

import React, { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import moment from "moment-timezone";
import { DNA } from 'react-loader-spinner';
import "./dashboard.css"; // Usar el mismo archivo CSS que el Dashboard

const RecepcionLab = () => {
    const [appointments, setAppointments] = useState([]);
    const [scannedAppointments, setScannedAppointments] = useState([]); // Estado para citas escaneadas
    const [selectedAppointments, setSelectedAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [localChanges, setLocalChanges] = useState({}); // Estado para almacenar cambios locales
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

        // Encontrar la cita que coincide con el término de búsqueda
        const matchedAppointment = appointments.find(appointment => 
            appointment.FolioDevelab && appointment.FolioDevelab.toString() === value
        );

        // Si se encuentra una coincidencia, agregarla a las citas escaneadas
        if (matchedAppointment && !scannedAppointments.includes(matchedAppointment)) {
            setScannedAppointments(prev => [...prev, matchedAppointment]);
        }

        // Limpiar el campo de entrada
        e.target.value = "";
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

    const handleLocalChange = (id, field, value) => {
        setLocalChanges((prevChanges) => ({
            ...prevChanges,
            [id]: {
                ...prevChanges[id],
                [field]: value,
            },
        }));
    };

    const handleUpdateField = useCallback(async (appointmentId) => {
        const changes = localChanges[appointmentId];
        if (!changes) return; // Si no hay cambios, no hacer nada

        try {
            await axios.put(`https://webapitimser.azurewebsites.net/api/v1/appointment/update/${appointmentId}`, changes, { withCredentials: true });
            setAppointments((prevAppointments) =>
                prevAppointments.map((appointment) =>
                    appointment._id === appointmentId ? { ...appointment, ...changes } : appointment
                )
            );
            setLocalChanges((prevChanges) => {
                const { [appointmentId]: _, ...rest } = prevChanges;
                return rest;
            });
            toast.success(`Registro ${appointmentId} actualizado con éxito`);
        } catch (error) {
            toast.error(error.response?.data?.message || `Error al actualizar el registro ${appointmentId}`);
        }
    }, [localChanges]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

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
                        <div className="barcode-container">
                            <input
                                type="text"
                                id="barcode-input"
                                placeholder="Escanear código de barras"
                                className="barcode-input"
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
                            <th>Estado Muestra</th>
                            <th>Temperatura</th>
                            <th>Actualizar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scannedAppointments.length > 0 ? (
                            scannedAppointments.map((appointment) => (
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
                                    <td>
                                        <select
                                            value={localChanges[appointment._id]?.estatusMuestra || appointment.estatusMuestra || "Buen Estado"}
                                            onChange={(e) => handleLocalChange(appointment._id, 'estatusMuestra', e.target.value)}
                                            className="input"
                                        >
                                            <option value="Buen Estado">Buen Estado</option>
                                            <option value="Lipémica +">Lipémica +</option>
                                            <option value="Lipémica ++">Lipémica ++</option>
                                            <option value="Lipémica +++">Lipémica +++</option>
                                            <option value="Hemolizada +">Hemolizada +</option>
                                            <option value="Hemolizada ++">Hemolizada ++</option>
                                            <option value="Hemolizada +++">Hemolizada +++</option>
                                            <option value="Ictericia +">Ictericia +</option>
                                            <option value="Ictericia ++">Ictericia ++</option>
                                            <option value="Ictericia +++">Ictericia +++</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={localChanges[appointment._id]?.temperatura || appointment.temperatura || ""}
                                            onChange={(e) => handleLocalChange(appointment._id, 'temperatura', e.target.value)}
                                            className="input"
                                        />
                                    </td>
                                    <td>
                                        <button
                                            className="botonactualizar"
                                            onClick={() => handleUpdateField(appointment._id)}
                                            disabled={!localChanges[appointment._id]} // Deshabilitar si no hay cambios
                                        >
                                            Actualizar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">No se encontraron citas escaneadas.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default RecepcionLab;
