// src/components/Elisas.jsx

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
import Modal from './Modal'; // Importar el componente Modal correcto

const BulkEditModal = ({ show, onClose, onSave }) => {
    const [estatusElisa, setEstatusElisa] = useState("");
    const [lavoElisa, setLavoElisa] = useState("");
    const [numeroPlaca, setNumeroPlaca] = useState("");
    const [lugarProceso, setLugarProceso] = useState("");

    const handleSave = () => {
        const bulkChanges = {
            estatusElisa,  // String value
            lavoElisa,     // String value
            numeroPlaca,   // String value
            lugarProceso   // String value
        };

        // Ensure an object is passed to onSave
        onSave(bulkChanges); 
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
                    <select value={estatusElisa} onChange={(e) => setEstatusElisa(e.target.value)} className="input">
                        <option value="">Seleccione estatus</option>
                        <option value="Recubrimiento">Recubrimiento</option>
                        <option value="Bloqueo">Bloqueo</option>
                        <option value="Muestra">Muestra</option>
                        <option value="Lavado">Lavado</option>
                        <option value="Anticuerpo de Detección">Anticuerpo de Detección</option>
                        <option value="Sustrato">Sustrato</option>
                        <option value="Detención">Detención</option>
                        <option value="Lectura">Lectura</option>
                    </select>
                    <select value={lavoElisa} onChange={(e) => setLavoElisa(e.target.value)} className="input">
                        <option value="">Seleccione Personal</option>
                        <option value="JCEG">JCEG</option>
                        <option value="PRF">PRF</option>
                    </select>
                    <input
                        type="text"
                        name="numeroPlaca"
                        placeholder="Número de Placa"
                        value={numeroPlaca}
                        onChange={(e) => setNumeroPlaca(e.target.value)}
                        className="input"
                    />
                    <select value={lugarProceso} onChange={(e) => setLugarProceso(e.target.value)} className="input">
                        <option value="">Seleccione ubicación</option>
                        <option value="MX">MX</option>
                        <option value="EUA">EUA</option>
                    </select>
                    <button type="button" onClick={handleSave} className="save-button">
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    );
};


const Elisas = () => {
    const [preventixRecords, setPreventixRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedRecords, setSelectedRecords] = useState([]);
    const [showBulkEditModal, setShowBulkEditModal] = useState(false);
    const [folioDevelabRange, setFolioDevelabRange] = useState({ min: "", max: "" });
    const [fechaIngresoRange, setFechaIngresoRange] = useState({ start: "", end: "" });
    const [localChanges, setLocalChanges] = useState({}); // Estado para almacenar cambios locales
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

    const handleLocalChange = (id, field, value) => {
        setLocalChanges((prevChanges) => ({
            ...prevChanges,
            [id]: {
                ...prevChanges[id],
                [field]: value,
            },
        }));
    };

    const handleUpdateField = useCallback(async (preventixId) => {
        const changes = localChanges[preventixId];
        if (!changes) return; // Si no hay cambios, no hacer nada

        try {
            await axios.put(`https://webapitimser.azurewebsites.net/api/v1/preventix/update/${preventixId}`, changes, { withCredentials: true });
            setPreventixRecords((prevRecords) =>
                prevRecords.map((record) =>
                    record._id === preventixId ? { ...record, ...changes } : record
                )
            );
            setLocalChanges((prevChanges) => {
                const { [preventixId]: _, ...rest } = prevChanges;
                return rest;
            });
            toast.success(`Registro ${preventixId} actualizado con éxito`);
        } catch (error) {
            toast.error(error.response?.data?.message || `Error al actualizar el registro ${preventixId}`);
        }
    }, [localChanges]);

    const handleUpdateFields = useCallback(async (preventixId, changes) => {
        if (!changes || typeof changes !== 'object' || Object.keys(changes).length === 0) {
            console.error("Cambios inválidos:", changes);
            return;
        }

        try {
            console.log("Enviando cambios:", changes);

            await axios.put(`https://webapitimser.azurewebsites.net/api/v1/preventix/update/${preventixId}`, changes, { withCredentials: true });

            setPreventixRecords((prevRecords) =>
                prevRecords.map((record) =>
                    record._id === preventixId ? { ...record, ...changes } : record
                )
            );
            setLocalChanges((prevChanges) => {
                const { [preventixId]: _, ...rest } = prevChanges;
                return rest;
            });
            toast.success(`Actualizado con éxito`);
        } catch (error) {
            toast.error(error.response?.data?.message || `Error al actualizar el registro ${preventixId}`);
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
    const handleBulkSave = useCallback(async (bulkChanges) => {
        try {
            const promises = selectedRecords.map((record) => {
                const changes = {};
                Object.entries(bulkChanges).forEach(([key, value]) => {
                    // Only add valid string values to changes
                    if (value && typeof value === 'string') {
                        changes[key] = value;
                    }
                });
    
                // Only update if there are valid changes
                if (Object.keys(changes).length > 0) {
                    return handleUpdateFields(record._id, changes);
                } else {
                    return Promise.resolve();  // No changes, resolve immediately
                }
            });
    
            await Promise.all(promises);
            toast.success(`Pacientes actualizados correctamente (${selectedRecords.length})`);
            setSelectedRecords([]);
            setShowBulkEditModal(false);
        } catch (error) {
            toast.error("Error al actualizar los registros seleccionados");
        }
    }, [selectedRecords, handleUpdateFields]);
    
    
    const handleSave = () => {
        const bulkChanges = {
            estatusElisa,
            lavoElisa,
            numeroPlaca,
            lugarProceso
        };

        console.log('Datos a enviar en la edición masiva:', bulkChanges);
        onSave(bulkChanges); // Enviar el objeto completo de cambios
    };

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
            const searchTermMatch = searchTerm === "" || (
                record._id.toLowerCase().includes(searchTerm) ||
                (record.appointmentId && record.appointmentId._id.toLowerCase().includes(searchTerm)) ||
                (record.estatusMuestra && record.estatusMuestra.toLowerCase().includes(searchTerm)) ||
                (record.tecnicoElisa && record.tecnicoElisa.toLowerCase().includes(searchTerm)) ||
                (record.folioDevelab && record.folioDevelab.toString().includes(searchTerm))
            );
            return folioDevelabMatch && fechaIngresoMatch && searchTermMatch;
        });
    }, [preventixRecords, folioDevelabRange, fechaIngresoRange, searchTerm]);

    const handleDownloadExcel = useCallback(() => {
        const filteredData = selectedRecords.map(record => ({
            FolioDevelab: record.folioDevelab,
            TiempoInicioProceso: moment(record.tiempoInicioProceso).format("YYYY-MM-DD HH:mm"),
            EstatusMuestra: record.estatusMuestra,
            EstatusElisa: record.estatusElisa,
            TecnicoElisa: record.tecnicoElisa,
            FechaPrecipitado: record.fechaPrecipitado ? moment(record.fechaPrecipitado).format("YYYY-MM-DD") : 'N/A',
            FechaLavado: record.fechaLavado ? moment(record.fechaLavado).format("YYYY-MM-DD") : 'N/A',
            ResultadoElisa: record.resultadoElisa,
            EstatusWesternBlot: record.estatusWesternBlot,
            ResultadoWesternBlot: record.resultadoWesternBlot,
        }));

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Elisa");
        XLSX.writeFile(workbook, "Preventix_Elisa.xlsx");
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
            <div className="unified-banner">
  <h2 className="banner-title">Elisa - Inmunoquica</h2> {/* Título principal */}

  <div className="banner-grid">
    {/* Tarjeta de Pacientes */}
    <div className="banner-card">
      <p>Pacientes</p>
      <h3>{filteredRecords.length}</h3>
    </div>

    {/* Tarjeta de búsqueda */}
    <div className="banner-card">
    <FaSearch className="icon" />
      <input
        type="text"
        placeholder="Buscar por ID, nombre, apellido o lugar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        className="search-input"
      />
      
    </div>

    {/* Tarjeta de Fecha Ingreso */}
    <div className="banner-card">
      <div className="filter-item">
        <CiFilter className="icon" />
        <span>Fecha Ingreso: </span>
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
      </div>
    </div>

    {/* Tarjeta de Folio */}
    <div className="banner-card">
      <div className="filter-item">
        <CiFilter className="icon" />
        <span>Folio:  </span>
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

    {/* Tarjeta de Botones de acción */}
    <div className="banner-card full-width-card">
      <div className="section-actions">
        <button onClick={handleSelectAll}>Seleccionar</button>
        <button onClick={openBulkEditModal}>Editar</button>
        <button onClick={handleDownloadExcel}>Excel</button>
      </div>
    </div>
  </div>
</div>

            
            <div className="appointments-list" style={{ overflowX: "auto" }}>
                <table>
                    <thead>
                        <tr>
                            <th>Seleccionar</th>
                            <th>Folio Develab</th>
                            <th>Hora Inicio</th>
                            <th>Estado Muestra</th>
                            <th>Temperatura</th>
                            <th>Estado Elisa</th>
                            <th>Personal</th>
                            <th>Placa Proceso</th>
                            <th>Ubicación Proceso</th>
                            <th>Resultado Elisa</th>
                            <th>Resultado WB</th>
                            <th>Cuestionario</th>
                            <th>Actualizar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record) => (
                                <tr key={record._id}>
                                    <td>
                                        <input type="checkbox" className="roundedOne" checked={selectedRecords.includes(record)} onChange={() => handleSelectRecord(record)} />
                                    </td>
                                    <td>{record.folioDevelab}</td>
                                    <td>{moment(record.tiempoInicioProceso).format("YYYY-MM-DD HH:mm")}</td>
                                    <td>{record.estatusMuestra}</td>
                                    <td>{record.temperatura}</td>
                                    <td>
                                        <select
                                            value={localChanges[record._id]?.estatusElisa || record.estatusElisa || ""}
                                            onChange={(e) => handleLocalChange(record._id, 'estatusElisa', e.target.value)}
                                            className="input"
                                        >
                                            <option value="">Seleccione una opción</option>
                                            <option value="Recubrimiento">Recubrimiento</option>
                                            <option value="Bloqueo">Bloqueo</option>
                                            <option value="Muestra">Muestra</option>
                                            <option value="Lavado">Lavado</option>
                                            <option value="Anticuerpo de Detección">Anticuerpo de Detección</option>
                                            <option value="Sustrato">Sustrato</option>
                                            <option value="Detención">Detención</option>
                                            <option value="Lectura">Lectura</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={localChanges[record._id]?.lavoElisa || record.lavoElisa || ""}
                                            onChange={(e) => handleLocalChange(record._id, 'lavoElisa', e.target.value)}
                                            className="input"
                                        >
                                            <option value="">Seleccione Personal</option>
                                            <option value="JCEG">JCEG</option>
                                            <option value="PRF">PRF</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={localChanges[record._id]?.numeroPlaca || record.numeroPlaca || ""}
                                            onChange={(e) => handleLocalChange(record._id, 'numeroPlaca', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={localChanges[record._id]?.lugarProceso || record.lugarProceso || ""}
                                            onChange={(e) => handleLocalChange(record._id, 'lugarProceso', e.target.value)}
                                            className="input"
                                        >
                                            <option value="">Seleccione una opción</option>
                                            <option value="MX">MX</option>
                                            <option value="EUA">EUA</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={localChanges[record._id]?.resultadoElisa || record.resultadoElisa || ""}
                                            onChange={(e) => handleLocalChange(record._id, 'resultadoElisa', e.target.value)}
                                        />
                                    </td>
                                    <td>{record.resultadoWesternBlot}</td>
                                    <td>
                                        <button className="botontabla" onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering the row click event
                                            handleIdCuestionarioClick(record.appointmentId ? record.appointmentId : null);
                                        }}>Ver</button>
                                    </td>
                                    <td>
                                        <button
                                            className="botonactualizar"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering the row click event
                                                handleUpdateField(record._id);
                                            }}
                                            disabled={!localChanges[record._id]} // Deshabilitar si no hay cambios
                                        >
                                            Actualizar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="12">No se encontraron registros de Preventix.</td>
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

export default Elisas;
