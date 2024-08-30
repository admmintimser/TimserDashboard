// src/components/Validacion.jsx

import React, { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import { DNA } from 'react-loader-spinner';
import ModalValidation from './ModalValidation'; // Asegúrate de que este componente pueda mostrar todos los campos dinámicamente
import "./EstatusPreventix.css"; // Usar el mismo archivo CSS que los otros dashboards

const Validacion = () => {
    const [preventixRecords, setPreventixRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const { isAuthenticated } = useContext(Context);

    const fetchPreventixData = useCallback(async () => {
        try {
            const response = await axios.get(
                "https://webapitimser.azurewebsites.net/api/v1/preventix/getall",
                { withCredentials: true }
            );
            if (response.data.preventix) {
                setPreventixRecords(response.data.preventix.reverse());
            } else {
                throw new Error("No Preventix data received");
            }
        } catch (error) {
            toast.error("Error fetching Preventix records: " + error.message);
            setPreventixRecords([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPreventixData();
        const interval = setInterval(fetchPreventixData, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, [fetchPreventixData]);

    const handleViewClick = (record) => {
        // Asegúrate de que selectedRecord tenga solo los campos necesarios
        setSelectedRecord(record);
    };

    const handleValidationClick = async (record) => {
        if (record.estatusValidacion) {
            toast.info("Prueba ya validada");
            return;
        }

        const confirmValidation = window.confirm("¿Está seguro de que desea validar esta prueba?");
        if (!confirmValidation) {
            return;
        }

        try {
            // Clonar el registro y actualizar el campo de validación
            const updatedRecord = { ...record, estatusValidacion: true };

            // Enviar la actualización a la base de datos
            const response = await axios.put(
                `https://webapitimser.azurewebsites.net/api/v1/preventix/update/${record._id}`,
                updatedRecord,
                { withCredentials: true }
            );

            if (response.status === 200) {
                const updatedRecords = preventixRecords.map(r =>
                    r._id === record._id ? updatedRecord : r
                );
                setPreventixRecords(updatedRecords);
                toast.success("Prueba validada con éxito");
            }
        } catch (error) {
            toast.error("Error al validar la prueba: " + error.message);
        }
    };

    const closeModal = () => {
        setSelectedRecord(null);
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (loading) {
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
                    <p>Total Registros</p>
                    <h3>{preventixRecords.length}</h3>
                </div>
                <div className="thirdBox">
                    <div className="card-content">
                        <span className="card-title">Buscar</span>
                        <input
                            type="text"
                            placeholder="Buscar por ID, nombre o estado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                            className="search-input"
                        />
                        <FaSearch className="card-icon" />
                    </div>
                </div>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Folio Develab</th>
                            <th>Fecha de Ingreso</th>
                            <th>Temperatura</th>
                            <th>Resultado Western Blot</th>
                            <th>Resultado Elisa</th>
                            <th>Acción</th>
                            <th>Validación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {preventixRecords.length > 0 ? (
                            preventixRecords
                                .filter(
                                    (record) =>
                                        record._id.toLowerCase().includes(searchTerm) ||
                                        (record.folioDevelab && record.folioDevelab.toLowerCase().includes(searchTerm))
                                )
                                .map((record) => (
                                    <tr key={record._id}>
                                        <td>{record.folioDevelab}</td>
                                        <td>{record.tiempoInicioProceso ? new Date(record.tiempoInicioProceso).toLocaleString() : 'N/A'}</td>
                                        <td>{record.temperatura ? `${record.temperatura}º` : 'N/A'}</td>
                                        <td>{record.resultadoWesternBlot || 'N/A'}</td>
                                        <td>{record.resultadoElisa || 'N/A'}</td>
                                        <td>
                                            <button className="botontabla" onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering the row click event
                                                handleViewClick(record);
                                            }}>
                                                Ver
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="botontabla"
                                                style={{
                                                    backgroundColor: record.estatusValidacion ? 'green' : 'red',
                                                    cursor: record.estatusValidacion ? 'not-allowed' : 'pointer',
                                                    color: 'white',
                                                    padding: '5px 10px',
                                                    borderRadius: '5px',
                                                    border: 'none',
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleValidationClick(record);
                                                }}
                                                disabled={record.estatusValidacion}
                                            >
                                                {record.estatusValidacion ? 'Validado' : 'Validación'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="7">No se encontraron registros de Preventix.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {selectedRecord && (
    <ModalValidation show={true} onClose={closeModal} record={selectedRecord} />
)}
        </section>
    );
};

export default Validacion;
