// src/components/PreventixDashboard.jsx
import React, { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import moment from "moment-timezone";
import { DNA } from 'react-loader-spinner';
import Modal from './Modal';  // Importa el componente Modal
import "./dashboard.css"; // Usa el mismo archivo CSS que el Dashboard

const PreventixDashboard = () => {
    const [preventixRecords, setPreventixRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
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

    const closeModal = () => {
        setSelectedAppointment(null);
    };

    const handleIdCuestionarioClick = (appointmentId) => {
        setSelectedAppointment(appointmentId);
    };

    /**
     * Función para eliminar acentos de una cadena y tratarla de forma normalizada.
     * Esto permite que la búsqueda sea más flexible en términos de acentuación.
     */
    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const getRowColor = (record) => {
        if (!record.tiempoFinProceso) {
            const daysDifference = moment().diff(moment(record.tiempoInicioProceso), 'days');
            if (daysDifference < 12) {
                return 'green';
            } else if (daysDifference === 12) {
                return 'yellow';
            } else if (daysDifference > 12) {
                return 'red';
            }
        }
        return '';
    };

    const getStatusButtonStyle = (record) => {
        const color = getRowColor(record);
        return {
            backgroundColor: color,
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer'
        };
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

    // Normaliza el término de búsqueda eliminando acentos y convirtiendo a minúsculas
    const normalizedSearchTerm = removeAccents(searchTerm.toLowerCase());

    // Filtra los registros según el término de búsqueda
    const filteredRecords = preventixRecords.filter((record) => {
        // Normaliza los campos para comparaciones flexibles
        const recordId = removeAccents(record._id.toLowerCase());
        const appointmentId = record.appointmentId && record.appointmentId._id ? removeAccents(record.appointmentId._id.toLowerCase()) : '';
        const estatusMuestra = record.estatusMuestra ? removeAccents(record.estatusMuestra.toLowerCase()) : '';
        const tecnicoWB = record.tecnicoWB ? removeAccents(record.tecnicoWB.toLowerCase()) : '';
        const folioDevelab = record.folioDevelab ? removeAccents(record.folioDevelab.toLowerCase()) : '';
        const patientFirstName = record.appointmentId && record.appointmentId.patientFirstName
            ? removeAccents(record.appointmentId.patientFirstName.toLowerCase())
            : '';
        const patientLastName = record.appointmentId && record.appointmentId.patientLastName
            ? removeAccents(record.appointmentId.patientLastName.toLowerCase())
            : '';

        // Si no hay término de búsqueda, se muestran todos los registros
        if (!normalizedSearchTerm) {
            return true;
        }

        // Comprueba si alguno de los campos coinciden con el término de búsqueda
        return (
            recordId.includes(normalizedSearchTerm) ||
            (appointmentId && appointmentId.includes(normalizedSearchTerm)) ||
            (estatusMuestra && estatusMuestra.includes(normalizedSearchTerm)) ||
            (tecnicoWB && tecnicoWB.includes(normalizedSearchTerm)) ||
            (patientFirstName && patientFirstName.includes(normalizedSearchTerm)) ||
            (patientLastName && patientLastName.includes(normalizedSearchTerm)) ||
            (folioDevelab && folioDevelab.includes(normalizedSearchTerm))
        );
    });

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
                        <FaSearch className="card-icon" /> <br />
                        <input
                            type="text"
                            placeholder="Buscar por ID, nombre o estado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            </div>
            <div className="appointments-list" style={{ overflowX: 'auto' }}>
                <table style={{ tableLayout: 'fixed', width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '7%' }}>Folio Develab</th>
                            <th style={{ width: '7%' }}>Estatus Tiempo</th>
                            <th style={{ width: '10%' }}>Fecha de Ingreso</th>
                            <th style={{ width: '7%' }}>Estatus Resultados</th>
                            <th style={{ width: '10%' }}>Fecha envió resultados</th>
                            <th style={{ width: '10%' }}>Estado de Muestra</th>
                            <th style={{ width: '10%' }}>Temperatura Recepción</th>
                            <th style={{ width: '10%' }}>Interpretación</th>
                            <th style={{ width: '7%' }}>Estado Western Blot</th>
                            <th style={{ width: '7%' }}>Resultado Western Blot</th>
                            <th style={{ width: '7%' }}>Estado Elisa</th>
                            <th style={{ width: '7%' }}>Resultado Elisa</th>
                            <th style={{ width: '10%' }}>Ubicación del Proceso</th>
                            <th style={{ width: '7%' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record) => (
                                <tr key={record._id}>
                                    <td>{record.folioDevelab}</td>
                                    <td>
                                        <button style={getStatusButtonStyle(record)}>
                                            {record.tiempoFinProceso ? 'Completado' : 'En proceso'}
                                        </button>
                                    </td>
                                    <td>{moment(record.tiempoInicioProceso).format("YYYY-MM-DD HH:mm")}</td>
                                    <td>{record.resultadosEnviados ? 'Enviado' : 'Pendiente'}</td>
                                    <td>{record.tiempoFinProceso ? moment(record.tiempoFinProceso).format("YYYY-MM-DD HH:mm") : 'N/A'}</td>
                                    <td>{record.estatusMuestra}</td>
                                    <td>{record.temperatura ? `${record.temperatura}º` : 'N/A'}</td>
                                    <td>{record.interpretacionPreventix}</td>
                                    <td>{record.estatusWesternBlot}</td>
                                    <td>{record.resultadoWesternBlot}</td>
                                    <td>{record.estatusElisa}</td>
                                    <td>{record.resultadoElisa}</td>
                                    <td>{record.lugarProceso}</td>
                                    <td>
                                        <button className="botontabla" onClick={(e) => {
                                            e.stopPropagation(); // Evita desencadenar otros eventos
                                            handleIdCuestionarioClick(record.appointmentId ? record.appointmentId : null);
                                        }}>
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="14">No se encontraron registros de Preventix.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Modal show={!!selectedAppointment} onClose={closeModal} appointment={selectedAppointment} />
        </section>
    );
};

export default PreventixDashboard;
