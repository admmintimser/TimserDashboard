// weternblot.jsx

import React, { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import moment from "moment-timezone";
import * as XLSX from 'xlsx';
import { DNA } from 'react-loader-spinner';
import "./dashboard.css"; // Usar el mismo archivo CSS que el Dashboard
import PrintButtonMicro from "./PrintButtonMicro";

const Modal = ({ show, onClose, appointment }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Informe Médico del Paciente</h2>
                <div className="report-section">
                    <p><strong>ID:</strong> {appointment._id}</p>
                    <p><strong>Consentimiento de Privacidad:</strong> {appointment.privacyConsent ? 'Sí' : 'No'}</p>
                    <p><strong>Consentimiento Informado:</strong> {appointment.informedConsent ? 'Sí' : 'No'}</p>
                    <p><strong>Horas de Ayuno:</strong> {appointment.fastingHours}</p>
                    <p><strong>Última Comida:</strong> {appointment.lastMealTime}</p>
                    <p><strong>Tipo de Última Comida:</strong> {appointment.lastMealType}</p>
                </div>
                <div className="report-section">
                    <h3>Información del Paciente</h3>
                    <p><strong>Nombre:</strong> {`${appointment.patientFirstName} ${appointment.patientLastName}`}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {appointment.birthDate}</p>
                    <p><strong>Área de Residencia:</strong> {appointment.areaType}</p>
                    <p><strong>Nivel Educativo:</strong> {appointment.educationLevel}</p>
                    <p><strong>Ubicación de la Muestra:</strong> {appointment.sampleLocation}</p>
                    <p><strong>Valor de Ubicación de la Muestra:</strong> {appointment.sampleLocationValue}</p>
                </div>
                <div className="report-section">
                    <h3>Contacto</h3>
                    <p><strong>Email:</strong> {appointment.email}</p>
                    <p><strong>Confirmar Email:</strong> {appointment.confirmEmail}</p>
                    <p><strong>Teléfono Móvil:</strong> {appointment.mobilePhone}</p>
                </div>
                <div className="report-section">
                    <h3>Datos Médicos</h3>
                    <p><strong>Peso:</strong> {appointment.weight} kg</p>
                    <p><strong>Altura:</strong> {appointment.height} cm</p>
                    <p><strong>Doctor Asignado:</strong> {appointment.docName}</p>
                    <p><strong>Vacunación VPH:</strong> {appointment.vphVaccination}</p>
                    <p><strong>Condiciones Detectadas:</strong> {appointment.detectedConditions}</p>
                    <p><strong>Consumo de Tabaco:</strong> {appointment.tobaccoConsumption}</p>
                </div>
                <div className="report-section">
                    <h3>Historial Médico</h3>
                    <p><strong>Cigarrillos por Semana (Antes):</strong> {appointment.cigarettesPerWeekBefore}</p>
                    <p><strong>Cigarrillos por Semana (Actualmente):</strong> {appointment.cigarettesPerWeekCurrent}</p>
                    <p><strong>Prueba de Papanicolaou:</strong> {appointment.papanicolaouTest}</p>
                    <p><strong>Año de Papanicolaou:</strong> {appointment.papanicolaouYear}</p>
                    <p><strong>Resultado de Papanicolaou:</strong> {appointment.papanicolaouResult}</p>
                    <p><strong>Colposcopia:</strong> {appointment.colposcopy}</p>
                    <p><strong>Año de Colposcopia:</strong> {appointment.colposcopyYear}</p>
                    <p><strong>Resultado de Colposcopia:</strong> {appointment.colposcopyResult}</p>
                    <p><strong>Histerectomía:</strong> {appointment.hysterectomy}</p>
                    <p><strong>Razón de Histerectomía:</strong> {appointment.hysterectomyReason}</p>
                    <p><strong>Fecha de Última Menstruación:</strong> {appointment.lastMenstruationDate}</p>
                    <p><strong>Edad de Primera Menstruación:</strong> {appointment.firstMenstruationAge}</p>
                    <p><strong>Relaciones Sexuales:</strong> {appointment.sexualRelations}</p>
                    <p><strong>Edad de Primera Relación Sexual:</strong> {appointment.firstSexualRelationAge}</p>
                    <p><strong>Parejas Sexuales:</strong> {appointment.sexualPartners}</p>
                    <p><strong>Método Anticonceptivo Actual:</strong> {appointment.currentContraceptiveMethod}</p>
                    <p><strong>Duración del Uso de Anticonceptivos Orales:</strong> {appointment.oralContraceptiveUsageDuration}</p>
                    <p><strong>Embarazos:</strong> {appointment.pregnancies}</p>
                    <p><strong>Partos Naturales:</strong> {appointment.naturalBirths}</p>
                    <p><strong>Cesáreas:</strong> {appointment.cesareans}</p>
                    <p><strong>Abortos:</strong> {appointment.abortions}</p>
                    <p><strong>Conteo de Abortos:</strong> {appointment.abortionCount}</p>
                </div>
                <div className="report-section">
                    <h3>Información de la Toma de Muestra</h3>
                    <p><strong>Folio Develab:</strong> {appointment.FolioDevelab}</p>
                    <p><strong>Cliente Develab:</strong> {appointment.ClienteDevelab}</p>
                    <p><strong>Fecha de Toma:</strong> {appointment.fechaToma}</p>
                    <p><strong>Toma Recibida:</strong> {appointment.tomaRecibida ? 'Sí' : 'No'}</p>
                    <p><strong>Toma Procesada:</strong> {appointment.tomaProcesada ? 'Sí' : 'No'}</p>
                    <p><strong>Toma Enviada:</strong> {appointment.tomaEnviada ? 'Sí' : 'No'}</p>
                </div>
            </div>
        </div>
    );
};

const BulkEditModal = ({ show, onClose, onSave }) => {
    const [estatusWesternBlot, setEstatusWesternBlot] = useState("");
    const [lavoWestern, setLavoWestern] = useState("");
    const [fechaPrecipitado, setFechaPrecipitado] = useState("");
    const [fechaLavado, setFechaLavado] = useState("");
    const [tecnicoWB, setTecnicoWB] = useState("");
    const [resultadoWesternBlot, setResultadoWesternBlot] = useState("");

    const handleSave = () => {
        onSave(
            estatusWesternBlot,
            lavoWestern,
            fechaPrecipitado,
            fechaLavado,
            tecnicoWB,
            resultadoWesternBlot
        );
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Editar Seleccionados</h2>
                <form>
                <select
                        value={estatusWesternBlot || ""}
                        onChange={(e) => setEstatusWesternBlot(e.target.value)}
                        className="input"
                        required
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Preparación">Preparación</option>
                        <option value="Electroforesis">Electroforesis</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Bloqueo">Bloqueo</option>
                        <option value="Incubación">Incubación</option>
                        <option value="Análisis">Análisis</option>
                    </select>

                    <input
                        type="text"
                        name="lavoWestern"
                        placeholder="Lavado WB"
                        value={lavoWestern}
                        onChange={(e) => setLavoWestern(e.target.value)}
                        className="input"
                        required
                    />
                    <input
                        type="date"
                        name="fechaPrecipitado"
                        placeholder="Fecha Precipitado"
                        value={fechaPrecipitado}
                        onChange={(e) => setFechaPrecipitado(e.target.value)}
                        className="input"
                        required
                    />
                    <input
                        type="date"
                        name="fechaLavado"
                        placeholder="Fecha Lavado"
                        value={fechaLavado}
                        onChange={(e) => setFechaLavado(e.target.value)}
                        className="input"
                        required
                    />
                    <input
                        type="text"
                        name="tecnicoWB"
                        placeholder="Técnico WB"
                        value={tecnicoWB}
                        onChange={(e) => setTecnicoWB(e.target.value)}
                        className="input"
                        required
                    />
                    <input
                        type="text"
                        name="resultadoWesternBlot"
                        placeholder="Resultado WB"
                        value={resultadoWesternBlot}
                        onChange={(e) => setResultadoWesternBlot(e.target.value)}
                        className="input"
                        required
                    />
                    <button type="button" onClick={handleSave} className="save-button">
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    );
};

const WesternBlot = () => {
    const [preventixRecords, setPreventixRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedRecords, setSelectedRecords] = useState([]);
    const [showBulkEditModal, setShowBulkEditModal] = useState(false);
    const [folioDevelabRange, setFolioDevelabRange] = useState({ min: "", max: "" });
    const [fechaIngresoRange, setFechaIngresoRange] = useState({ start: "", end: "" });
    const { isAuthenticated } = useContext(Context);

    const fetchPreventixData = useCallback(async () => {
        try {
            const response = await axios.get("https://webapitimser.azurewebsites.net/api/v1/preventix/getall", { withCredentials: true });
            if (response.data.preventix) {
                setPreventixRecords(response.data.preventix.reverse());
            } else {
                throw new Error("No Preventix data received");
            }
        } catch (error) {
            toast.error("Error fetching Preventix records: " + error.message);
            setPreventixRecords([]);
        }
    }, []);

    useEffect(() => {
        fetchPreventixData();
    }, [fetchPreventixData]);

    const handleUpdateField = useCallback(async (preventixId, field, newValue) => {
        try {
            const payload = { [field]: newValue };
            await axios.put(`https://webapitimser.azurewebsites.net/api/v1/preventix/update/${preventixId}`, payload, { withCredentials: true });
            setPreventixRecords((prevRecords) =>
                prevRecords.map((record) =>
                    record._id === preventixId ? { ...record, ...payload } : record
                )
            );
            toast.success(`Campo ${field} actualizado con éxito`);
        } catch (error) {
            toast.error(error.response?.data?.message || `Error al actualizar el campo ${field}`);
        }
    }, []);

    const handleIdCuestionarioClick = useCallback((appointment) => {
        if (!appointment) {
            toast.error("El ID de la cita no está disponible.");
            return;
        }

        setSelectedAppointment(appointment);
    }, []);

    const closeModal = useCallback(() => {
        setSelectedAppointment(null);
    }, []);

    const openBulkEditModal = useCallback(() => {
        setShowBulkEditModal(true);
    }, []);

    const closeBulkEditModal = useCallback(() => {
        setShowBulkEditModal(false);
    }, []);

    const handleBulkSave = useCallback(async (estatusWesternBlot, lavoWestern, fechaPrecipitado, fechaLavado, tecnicoWB, resultadoWesternBlot) => {
        try {
            const updatePromises = selectedRecords.map((record) =>
                handleUpdateField(record._id, "estatusWesternBlot", estatusWesternBlot)
                    .then(() => handleUpdateField(record._id, "lavoWestern", lavoWestern))
                    .then(() => handleUpdateField(record._id, "fechaPrecipitado", fechaPrecipitado))
                    .then(() => handleUpdateField(record._id, "fechaLavado", fechaLavado))
                    .then(() => handleUpdateField(record._id, "tecnicoWB", tecnicoWB))
                    .then(() => handleUpdateField(record._id, "resultadoWesternBlot", resultadoWesternBlot))
            );
            await Promise.all(updatePromises);
            setSelectedRecords([]);
            closeBulkEditModal();
            toast.success("Registros actualizados con éxito");
        } catch (error) {
            toast.error("Error al actualizar los registros seleccionados");
        }
    }, [selectedRecords, handleUpdateField, closeBulkEditModal]);

    const getRowColor = useCallback((record) => {
        if (!record.tiempoFinProceso) {
            const daysDifference = moment().diff(moment(record.tiempoInicioProceso), "days");
            if (daysDifference < 12) {
                return "green";
            } else if (daysDifference === 12) {
                return "yellow";
            } else if (daysDifference > 12) {
                return "red";
            }
        }
        return "";
    }, []);

    const getStatusButtonStyle = useCallback((record) => {
        const color = getRowColor(record);
        return {
            backgroundColor: color,
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
        };
    }, [getRowColor]);

    const handleSelectRecord = useCallback((record) => {
        setSelectedRecords((prevSelected) => {
            if (prevSelected.includes(record)) {
                return prevSelected.filter((r) => r !== record);
            } else {
                return [...prevSelected, record];
            }
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (selectedRecords.length === preventixRecords.length) {
            setSelectedRecords([]);
        } else {
            setSelectedRecords(preventixRecords);
        }
    }, [selectedRecords, preventixRecords]);

    const filterRecords = useCallback(() => {
        return preventixRecords.filter(record => {
            const folioDevelabMatch = (folioDevelabRange.min === "" || record.folioDevelab >= folioDevelabRange.min) &&
                (folioDevelabRange.max === "" || record.folioDevelab <= folioDevelabRange.max);
            const fechaIngresoMatch = (fechaIngresoRange.start === "" || moment(record.tiempoInicioProceso).isSameOrAfter(fechaIngresoRange.start)) &&
                (fechaIngresoRange.end === "" || moment(record.tiempoInicioProceso).isSameOrBefore(fechaIngresoRange.end));
            return folioDevelabMatch && fechaIngresoMatch;
        });
    }, [preventixRecords, folioDevelabRange, fechaIngresoRange]);

    const handleDownloadExcel = useCallback(() => {
        const filteredData = selectedRecords.map(record => ({
            FolioDevelab: record.folioDevelab,
            TiempoInicioProceso: moment(record.tiempoInicioProceso).format("YYYY-MM-DD HH:mm"),
            EstatusMuestra: record.estatusMuestra,
            FechaPrecipitado: record.fechaPrecipitado ? moment(record.fechaPrecipitado).format("YYYY-MM-DD") : 'N/A',
            FechaLavado: record.fechaLavado ? moment(record.fechaLavado).format("YYYY-MM-DD") : 'N/A',
            TecnicoWB: record.tecnicoWB,
            EstatusWesternBlot: record.estatusWesternBlot,
            ResultadoWesternBlot: record.resultadoWesternBlot,
        }));

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "WesternBlot");
        XLSX.writeFile(workbook, "Preventix_Western.xlsx");
    }, [selectedRecords]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const filteredRecords = filterRecords();

    if (!preventixRecords.length) {
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
                    <p>Pacientes</p>
                    <h3>{filteredRecords.length}</h3>
                </div>
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
                <div className="thirdBox">
                    <div className="card-content1">
                        <CiFilter className="card-icon" />
                        <span className="card-title">Folio</span>
                        <input
                            type="number"
                            placeholder="Min"
                            value={folioDevelabRange.min}
                            onChange={(e) => setFolioDevelabRange({ ...folioDevelabRange, min: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={folioDevelabRange.max}
                            onChange={(e) => setFolioDevelabRange({ ...folioDevelabRange, max: e.target.value })}
                        />
                    </div>
                </div>
            </div>
            <div className="banner">
                <div className="card-content1">
                    <CiFilter className="card-icon"/>
                    <span className="card-title">Fecha Ingreso</span>
                    <input
                        type="date"
                        value={fechaIngresoRange.start}
                        onChange={(e) => setFechaIngresoRange({ ...fechaIngresoRange, start: e.target.value })}
                    />
                    <input
                        type="date"
                        value={fechaIngresoRange.end}
                        onChange={(e) => setFechaIngresoRange({ ...fechaIngresoRange, end: e.target.value })}
                    />
                    {selectedRecords.length > 0 && (
                        <PrintButtonMicro selectedAppointments={selectedRecords} />
                    )}

                </div>
                
            </div>
            <div className="banner">
                <div className="card-content1">
                    <button onClick={handleSelectAll} className="buttondashboard">Seleccionar</button>
                    <button onClick={openBulkEditModal} className="buttondashboard">Editar</button>
                    <button onClick={handleDownloadExcel} className="buttondashboard"> Excel</button>
                </div>
            </div>
            <div className="appointments-list" style={{ overflowX: "auto" }}>
                <table>
                    <thead>
                        <tr>
                            <th>Seleccionar</th>
                            <th>Folio Devellab</th>
                            <th>Hora Inicio</th>
                            <th>Estado</th>
                            <th>Fecha Precipitado</th>
                            <th>Fecha Lavado</th>
                            <th>Técnico</th>
                            <th>Status Proceso</th>
                            <th>Resultado WB</th>
                            <th>Elisa</th>
                            <th>Cuestionario</th>
                            <th>Actualizar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record) => (
                                <tr key={record._id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="roundedOne"
                                            checked={selectedRecords.includes(record)}
                                            onChange={() => handleSelectRecord(record)}
                                        />
                                    </td>
                                    <td>{record.folioDevelab}</td>
                                    <td>{moment(record.tiempoInicioProceso).format("YYYY-MM-DD HH:mm")}</td>
                                    <td>{record.estatusMuestra}</td>
                                    <td>{record.fechaPrecipitado ? moment(record.fechaPrecipitado).format("YYYY-MM-DD") : 'N/A'}</td>
                                    <td>{record.fechaLavado ? moment(record.fechaLavado).format("YYYY-MM-DD") : 'N/A'}</td>
                                    <td>
                                        <select
                                            value={record.tecnicoWB || ""}
                                            onChange={(e) => handleUpdateField(record._id, 'tecnicoWB', e.target.value)}
                                            className="input"
                                        >
                                            <option value="">Seleccione una opción</option>
                                            <option value="Técnico 1">Técnico 1</option>
                                            <option value="Técnico 2">Técnico 2</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={record.estatusWesternBlot || ""}
                                            onChange={(e) => handleUpdateField(record._id, 'estatusWesternBlot', e.target.value)}
                                            className="input"
                                        >
                                            <option value="">Seleccione una opción</option>
                                            <option value="Preparación">Preparación</option>
                                            <option value="Electroforesis">Electroforesis</option>
                                            <option value="Transferencia">Transferencia</option>
                                            <option value="Bloqueo">Bloqueo</option>
                                            <option value="Incubación">Incubación</option>
                                            <option value="Análisis">Análisis</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={record.resultadoWesternBlot || ""}
                                            onChange={(e) => handleUpdateField(record._id, 'resultadoWesternBlot', e.target.value)}
                                        />
                                    </td>
                                    <td>{record.resultadoElisa}</td>
                                    <td>
                                        <button className="botontabla" onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering the row click event
                                            handleIdCuestionarioClick(record.appointmentId ? record.appointmentId : null);
                                        }}>Ver</button>
                                    </td>
                                    <td>
                                        <button className="botonactualizar" onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering the row click event
                                            handleUpdateField(record._id, "update");
                                        }}>Actualizar</button>
                                    </td>
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
            <Modal show={!!selectedAppointment} onClose={closeModal} appointment={selectedAppointment} />
            <BulkEditModal show={showBulkEditModal} onClose={closeBulkEditModal} onSave={handleBulkSave} />
        </section>
    );
};

export default WesternBlot;
