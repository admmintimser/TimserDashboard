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
    const [preventixRecords, setPreventixRecords] = useState([]);
    const [scannedRecords, setScannedRecords] = useState([]); // Estado para registros escaneados
    const [selectedRecords, setSelectedRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [localChanges, setLocalChanges] = useState({}); // Estado para almacenar cambios locales
    const { isAuthenticated } = useContext(Context);

    // Fetch the preventix data with appointment data populated
    const fetchPreventixData = useCallback(async () => {
        try {
            const response = await axios.get(
                "https://webapitimser.azurewebsites.net/api/v1/preventix/getall",
                {
                    withCredentials: true,
                    params: {
                        populateAppointment: true, // Asegúrate de que tu backend soporte este parámetro para popular los datos de la cita
                    },
                }
            );

            const preventixRecords = response.data.preventix || [];
            setPreventixRecords(preventixRecords.reverse());
        } catch (error) {
            toast.error("Error fetching preventix records: " + error.message);
            setPreventixRecords([]);
        }
    }, []);

    useEffect(() => {
        fetchPreventixData();
    }, [fetchPreventixData]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            const value = searchTerm.trim().toLowerCase();

            if (value) {
                const matchedRecords = preventixRecords.filter(record => {
                    const folioDevelab = record.folioDevelab ? record.folioDevelab.toString().toLowerCase() : '';
                    const firstName = record.appointmentId && record.appointmentId.patientFirstName ? record.appointmentId.patientFirstName.toLowerCase() : '';
                    const lastName = record.appointmentId && record.appointmentId.patientLastName ? record.appointmentId.patientLastName.toLowerCase() : '';
                    const fullName = `${firstName} ${lastName}`.trim();
                    const folioAndName = `${folioDevelab} ${fullName}`.trim();

                    // Intentar coincidencia exacta con folio, nombre completo, o folio + nombre
                    return value === folioDevelab || value === fullName || value === folioAndName;
                });

                // Agregar los registros encontrados a scannedRecords
                matchedRecords.forEach(matchedRecord => {
                    if (!scannedRecords.some(rec => rec._id === matchedRecord._id)) {
                        setScannedRecords(prev => [...prev, matchedRecord]);
                    }
                });
            }

            // Limpiar el término de búsqueda
            setSearchTerm("");
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setScannedRecords([]); // Limpiar los registros escaneados cuando se borra el campo
    };

    const handleSelectRecord = (record) => {
        setSelectedRecords((prev) =>
            prev.includes(record)
                ? prev.filter((rec) => rec !== record)
                : [...prev, record]
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

    // Actualizar tanto preventixRecords como scannedRecords
    const handleUpdateField = useCallback(async (recordId) => {
        const changes = localChanges[recordId];
        if (!changes) return; // Si no hay cambios, no hacer nada

        try {
            await axios.put(`https://webapitimser.azurewebsites.net/api/v1/preventix/update/${recordId}`, changes, { withCredentials: true });

            // Actualizar preventixRecords
            setPreventixRecords((prevRecords) =>
                prevRecords.map((record) =>
                    record._id === recordId ? { ...record, ...changes } : record
                )
            );

            // Actualizar los registros escaneados también
            setScannedRecords((prevRecords) =>
                prevRecords.map((record) =>
                    record._id === recordId ? { ...record, ...changes } : record
                )
            );

            // Limpiar los cambios locales para el registro actualizado
            setLocalChanges((prevChanges) => {
                const { [recordId]: _, ...rest } = prevChanges;
                return rest;
            });

            toast.success(`Registro ${recordId} actualizado con éxito`);
        } catch (error) {
            toast.error(error.response?.data?.message || `Error al actualizar el registro ${recordId}`);
        }
    }, [localChanges]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

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
                    <p>Muestras Tomadas</p>
                    <h3>{preventixRecords.length}</h3>
                </div>
                <div className="thirdBox">
                    <div className="card-content">
                        <div className="barcode-container">
                            <input
                                type="text"
                                id="barcode-input"
                                placeholder="Escanear código de barras o buscar por folio/nombre"
                                className="barcode-input"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchKeyDown} // Detectar la tecla Enter
                                autoFocus
                            />
                            <FaTrash className="clear-icon" onClick={handleClearSearch} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="appointments-list">
                <table>
                    <thead>
                    <tr>
                        <th>Seleccionar</th>
                        <th>Folio Develab</th>
                        <th>Nombre Paciente</th>
                        <th>Fecha de Toma</th>
                        <th>Estado Muestra</th>
                        <th>Temperatura</th>
                        <th>Actualizar</th>
                    </tr>
                    </thead>
                    <tbody>
                    {scannedRecords.length > 0 ? (
                        scannedRecords.map((record) => (
                            <tr key={record._id}>
                                <td>
                                    <input
                                        className="roundedOne"
                                        type="checkbox"
                                        checked={selectedRecords.includes(record)}
                                        onChange={() => handleSelectRecord(record)}
                                    />
                                </td>
                                <td>{record.folioDevelab}</td>
                                <td>
                                    {record.appointmentId
                                        ? `${record.appointmentId.patientFirstName} ${record.appointmentId.patientLastName}`
                                        : "N/A"}
                                </td>
                                <td>{moment(record.tiempoInicioProceso).format("YYYY-MM-DD HH:mm")}</td>

                                <td>
                                    {selectedRecords.includes(record) ? (
                                        <select
                                            value={localChanges[record._id]?.estatusMuestra || record.estatusMuestra || "Buen Estado"}
                                            onChange={(e) => handleLocalChange(record._id, 'estatusMuestra', e.target.value)}
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
                                    ) : (
                                        <span>{record.estatusMuestra || "Buen Estado"}</span>
                                    )}
                                </td>

                                <td>
                                    {selectedRecords.includes(record) ? (
                                        <input
                                            type="number"
                                            value={localChanges[record._id]?.temperatura || record.temperatura || ""}
                                            onChange={(e) => handleLocalChange(record._id, 'temperatura', e.target.value)}
                                            className="input"
                                        />
                                    ) : (
                                        <span>{record.temperatura || "N/A"}</span>
                                    )}
                                </td>

                                <td>
                                    <button
                                        className="botonactualizar"
                                        onClick={() => handleUpdateField(record._id)}
                                        disabled={!localChanges[record._id]} // Deshabilitar si no hay cambios
                                    >
                                        Actualizar
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No se encontraron registros escaneados.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default RecepcionLab;
