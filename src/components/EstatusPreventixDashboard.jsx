import React, { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import moment from "moment-timezone";
import { DNA } from 'react-loader-spinner';
import "./EstatusPreventix.css"; // Usar el mismo archivo CSS que el Dashboard

const EstatusPreventixDashboard = () => {
    const [preventixRecords, setPreventixRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
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

    const calculateProgress = (record) => {
        const totalSteps = 6;
        let completedSteps = 0;

        if (record.estatusTomaMuestra) completedSteps++;
        if (record.estatusRecepcion) completedSteps++;
        if (record.estatusELisa) completedSteps++;
        if (record.estatusWB) completedSteps++;
        if (record.estatusValidacion) completedSteps++;
        if (record.estatusLiberacion) completedSteps++;

        return (completedSteps / totalSteps) * 100;
    };

    const renderStatus = (status) => {
        const statusClass = status ? 'status-completed' : 'status-pending';
        return (
            <div className={`status-circle ${statusClass}`} />
        );
    };

    const renderProgressBar = (record) => {
        const progress = calculateProgress(record);
        return (
            <div className="progress-wrapper">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
                <span className="progress-text">{`${progress}%`}</span>
            </div>
        );
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
                            <th>Progreso</th>
                            <th>Toma Muestra</th>
                            <th>Recepción</th>
                            <th>Elisa</th>
                            <th>WB</th>
                            <th>Validación</th>
                            <th>Liberación</th>
                            <th>Western Blot</th>
                            <th>Elisa</th>
                            <th>Interpretación</th>
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
                                        <td>{renderProgressBar(record)}</td>
                                        <td>{renderStatus(record.estatusTomaMuestra)}</td>
                                        <td>{renderStatus(record.estatusRecepcion)}</td>
                                        <td>{renderStatus(record.estatusELisa)}</td>
                                        <td>{renderStatus(record.estatusWB)}</td>
                                        <td>{renderStatus(record.estatusValidacion)}</td>
                                        <td>{renderStatus(record.estatusLiberacion)}</td>
                                        <td>{record.resultadoWesternBlot}</td>
                                        <td>{record.resultadoElisa}</td>
                                        <td>{record.interpretacionPreventix}</td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="11">No se encontraron registros de Preventix.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default EstatusPreventixDashboard;
