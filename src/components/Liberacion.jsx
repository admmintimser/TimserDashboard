// src/components/Liberacion.jsx

import React, { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import { DNA } from 'react-loader-spinner';
import ModalValidation from './ModalValidation'; // Asegúrate de que este componente pueda mostrar todos los campos dinámicamente
import "./EstatusPreventix.css"; // Usar el mismo archivo CSS que los otros dashboards

const Liberacion = () => {
    const [preventixRecords, setPreventixRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [folioMin, setFolioMin] = useState("");
    const [folioMax, setFolioMax] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedRecords, setSelectedRecords] = useState([]);
    const { isAuthenticated } = useContext(Context);

    const fetchPreventixData = useCallback(async () => {
        try {
            const response = await axios.get(
                "https://webapitimser.azurewebsites.net/api/v1/preventix/getall",
                { withCredentials: true }
            );
            if (response.data.preventix) {
                // Filtrar registros que ya tienen estatusValidacion = true
                const validRecords = response.data.preventix.filter(record => record.estatusValidacion === true);
                setPreventixRecords(validRecords.reverse());
                setFilteredRecords(validRecords.reverse());
            } else {
                throw new Error("No Preventix data received");
            }
        } catch (error) {
            toast.error("Error fetching Preventix records: " + error.message);
            setPreventixRecords([]);
            setFilteredRecords([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPreventixData();
        const interval = setInterval(fetchPreventixData, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, [fetchPreventixData]);

    // Manejar el filtro por folio mínimo y máximo
    const handleFilterByFolio = () => {
        const filtered = preventixRecords.filter(record => {
            const folio = parseInt(record.folioDevelab, 10);
            const min = folioMin ? parseInt(folioMin, 10) : -Infinity;
            const max = folioMax ? parseInt(folioMax, 10) : Infinity;
            return folio >= min && folio <= max;
        });
        setFilteredRecords(filtered);
    };

    const handleViewClick = (record) => {
        setSelectedRecord(record);
    };

    const handleLiberacionClick = async (record) => {
        if (record.estatusLiberacion) {
            toast.info("Registro ya liberado");
            return;
        }

        const confirmLiberacion = window.confirm("¿Está seguro de que desea liberar este registro?");
        if (!confirmLiberacion) {
            return;
        }

        try {
            // Clonar el registro y actualizar el campo de liberación
            const updatedRecord = { ...record, estatusLiberacion: true };

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
                setFilteredRecords(updatedRecords);
                toast.success("Registro liberado con éxito");
            }
        } catch (error) {
            toast.error("Error al liberar el registro: " + error.message);
        }
    };

    const handleSelectRecord = (record) => {
        setSelectedRecords(prevSelected => {
            if (prevSelected.includes(record)) {
                return prevSelected.filter(r => r._id !== record._id);
            } else {
                return [...prevSelected, record];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedRecords.length === filteredRecords.length) {
            setSelectedRecords([]);
        } else {
            setSelectedRecords(filteredRecords);
        }
    };

    const handleLiberacionMasiva = async () => {
        if (selectedRecords.length === 0) {
            toast.warn("No hay registros seleccionados para liberar");
            return;
        }

        const confirmLiberacion = window.confirm("¿Está seguro de que desea liberar todos los registros seleccionados?");
        if (!confirmLiberacion) {
            return;
        }

        try {
            const updatePromises = selectedRecords.map(record => {
                if (!record.estatusLiberacion) {
                    return axios.put(
                        `https://webapitimser.azurewebsites.net/api/v1/preventix/update/${record._id}`,
                        { ...record, estatusLiberacion: true },
                        { withCredentials: true }
                    );
                }
                return Promise.resolve();
            });

            await Promise.all(updatePromises);

            const updatedRecords = preventixRecords.map(record => {
                if (selectedRecords.includes(record)) {
                    return { ...record, estatusLiberacion: true };
                }
                return record;
            });

            setPreventixRecords(updatedRecords);
            setFilteredRecords(updatedRecords);
            setSelectedRecords([]);
            toast.success("Liberación masiva completada con éxito");
        } catch (error) {
            toast.error("Error en la liberación masiva: " + error.message);
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
                    <h3>{filteredRecords.length}</h3>
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
            <div className="banner">
                <div className="card-content">
                    <input
                        type="number"
                        placeholder="Folio Min"
                        value={folioMin}
                        onChange={(e) => setFolioMin(e.target.value)}
                        className="input"
                    />
                    <input
                        type="number"
                        placeholder="Folio Max"
                        value={folioMax}
                        onChange={(e) => setFolioMax(e.target.value)}
                        className="input"
                    />
                    <button onClick={handleFilterByFolio} className="buttondashboard">Filtrar</button>
                </div>
            </div>
            <div className="banner">
                <button onClick={handleSelectAll} className="buttondashboard">Seleccionar Todo</button>
                <button onClick={handleLiberacionMasiva} className="buttondashboard">Liberación Masiva</button>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Seleccionar</th>
                            <th>Folio Develab</th>
                            <th>Fecha de Ingreso</th>
                            <th>Temperatura</th>
                            <th>Resultado Western Blot</th>
                            <th>Resultado Elisa</th>
                            <th>Acción</th>
                            <th>Liberación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length > 0 ? (
                            filteredRecords
                                .filter(
                                    (record) =>
                                        record._id.toLowerCase().includes(searchTerm) ||
                                        (record.folioDevelab && record.folioDevelab.toLowerCase().includes(searchTerm))
                                )
                                .map((record) => (
                                    <tr key={record._id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedRecords.includes(record)}
                                                onChange={() => handleSelectRecord(record)}
                                            />
                                        </td>
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
                                                    backgroundColor: record.estatusLiberacion ? 'green' : 'red',
                                                    cursor: record.estatusLiberacion ? 'not-allowed' : 'pointer',
                                                    color: 'white',
                                                    padding: '5px 10px',
                                                    borderRadius: '5px',
                                                    border: 'none',
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLiberacionClick(record);
                                                }}
                                                disabled={record.estatusLiberacion}
                                            >
                                                {record.estatusLiberacion ? 'Liberado' : 'Liberación'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="8">No se encontraron registros de Preventix.</td>
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

export default Liberacion;
