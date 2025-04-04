import React, { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import moment from "moment-timezone";
import * as XLSX from "xlsx";
import { DNA } from "react-loader-spinner";
import "./dashboard.css";
import PrintButtonMicro from "./PrintButtonMicro";
import Modal from "./Modal"; // Asegúrate de que este sea el componente correcto

// Modal para edición masiva
const BulkEditModal = ({ show, onClose, onSave }) => {
  const [estatusWesternBlot, setEstatusWesternBlot] = useState("");
  const [lavoWestern, setLavoWestern] = useState("");
  const [tecnicoWB, setTecnicoWB] = useState("");
  const [fechaPrecipitado, setFechaPrecipitado] = useState("");
  const [fechaLavado, setFechaLavado] = useState("");

  const handleSave = () => {
    const bulkChanges = {
      estatusWesternBlot,
      lavoWestern,
      tecnicoWB,
      fechaPrecipitado,
      fechaLavado,
    };
    onSave(bulkChanges);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>
          &times;
        </span>
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

          <select
            value={lavoWestern || ""}
            onChange={(e) => setLavoWestern(e.target.value)}
            className="input"
            required
          >
            <option value="">Analista</option>
            <option value="JEHR">JEHR</option>
            <option value="ENTT">ENTT</option>
            <option value="DKVG">DKVG</option>
            <option value="JPRO">JPRO</option>
          </select>

          <select
            value={tecnicoWB || ""}
            onChange={(e) => setTecnicoWB(e.target.value)}
            className="input"
            required
          >
            <option value="">Tecnico</option>
            <option value="LGD">LGD</option>
            <option value="FDZG">FDZG</option>
          </select>

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
  const [localChanges, setLocalChanges] = useState({});
  const { isAuthenticated } = useContext(Context);

  // Fetch de datos
  const fetchPreventixData = useCallback(async () => {
    try {
      const response = await axios.get("https://webapitimser.azurewebsites.net/api/v1/preventix/getall", {
        withCredentials: true,
      });
      if (response.data.preventix) {
        // Ordenar los registros del más reciente al más antiguo
        const sortedRecords = response.data.preventix.sort(
          (a, b) => new Date(b.tiempoInicioProceso) - new Date(a.tiempoInicioProceso)
        );
        setPreventixRecords(sortedRecords);
      } else {
        throw new Error("No se recibieron datos de Preventix");
      }
    } catch (error) {
      toast.error("Error al obtener registros de Preventix: " + error.message);
      setPreventixRecords([]);
    }
  }, []);

  useEffect(() => {
    fetchPreventixData();
  }, [fetchPreventixData]);

  // Manejo de cambios locales
  const handleLocalChange = (id, field, value) => {
    setLocalChanges((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Update en BD
  const handleUpdateFields = useCallback(async (preventixId, changes) => {
    if (!changes || typeof changes !== "object" || Object.keys(changes).length === 0) {
      console.error("Cambios inválidos:", changes);
      return;
    }
    try {
      await axios.put(`https://webapitimser.azurewebsites.net/api/v1/preventix/update/${preventixId}`, changes, {
        withCredentials: true,
      });
      setPreventixRecords((prevRecords) =>
        prevRecords.map((record) =>
          record._id === preventixId ? { ...record, ...changes } : record
        )
      );
      setLocalChanges((prev) => {
        const { [preventixId]: _, ...rest } = prev;
        return rest;
      });
      toast.success("Actualizado con éxito");
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Error al actualizar el registro ${preventixId}`
      );
    }
  }, []);

  // Manejo de modal de cuestionario
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

  // Manejo de modal de edición masiva
  const openBulkEditModal = useCallback(() => setShowBulkEditModal(true), []);
  const closeBulkEditModal = useCallback(() => setShowBulkEditModal(false), []);

  // Guardar cambios masivos
  const handleBulkSave = useCallback(
    async (bulkChanges) => {
      try {
        const promises = selectedRecords.map((record) => {
          const changes = {};
          Object.entries(bulkChanges).forEach(([key, value]) => {
            if (value && typeof value === "string") {
              changes[key] = value;
            }
          });
          if (Object.keys(changes).length > 0) {
            return handleUpdateFields(record._id, changes);
          } else {
            return Promise.resolve();
          }
        });
        await Promise.all(promises);
        toast.success(`Pacientes actualizados correctamente (${selectedRecords.length})`);
        setSelectedRecords([]);
        setShowBulkEditModal(false);
      } catch (error) {
        toast.error("Error al actualizar los registros seleccionados");
      }
    },
    [selectedRecords, handleUpdateFields]
  );

  // Manejo de selección de filas
  const handleSelectRecord = useCallback((record) => {
    setSelectedRecords((prev) =>
      prev.includes(record) ? prev.filter((r) => r !== record) : [...prev, record]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedRecords.length === preventixRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(preventixRecords);
    }
  }, [selectedRecords, preventixRecords]);

  // Filtros
  const filterRecords = useCallback(() => {
    return preventixRecords.filter((record) => {
      const folioDevelabMatch =
        (folioDevelabRange.min === "" || record.folioDevelab >= folioDevelabRange.min) &&
        (folioDevelabRange.max === "" || record.folioDevelab <= folioDevelabRange.max);
      const fechaIngresoMatch =
        (fechaIngresoRange.start === "" ||
          moment(record.tiempoInicioProceso).isSameOrAfter(fechaIngresoRange.start)) &&
        (fechaIngresoRange.end === "" ||
          moment(record.tiempoInicioProceso).isSameOrBefore(fechaIngresoRange.end));

      const searchTermMatch =
        searchTerm === "" ||
        record.folioDevelab?.toString().includes(searchTerm) ||
        record.estatusMuestra?.toLowerCase().includes(searchTerm) ||
        record.resultadoElisa?.toLowerCase().includes(searchTerm);

      return folioDevelabMatch && fechaIngresoMatch && searchTermMatch;
    });
  }, [preventixRecords, folioDevelabRange, fechaIngresoRange, searchTerm]);

  // Descargar Excel
  const handleDownloadExcel = useCallback(() => {
    const filteredData = selectedRecords.map((record) => ({
      FolioDevelab: record.folioDevelab,
      TiempoInicioProceso: moment(record.tiempoInicioProceso).format("YYYY-MM-DD HH:mm"),
      EstatusMuestra: record.estatusMuestra,
      FechaPrecipitado: record.fechaPrecipitado
        ? moment(record.fechaPrecipitado).format("YYYY-MM-DD")
        : "N/A",
      FechaLavado: record.fechaLavado ? moment(record.fechaLavado).format("YYYY-MM-DD") : "N/A",
      Analista: record.lavoWestern,
      Tecnico: record.tecnicoWB,
      EstatusWesternBlot: record.estatusWesternBlot,
      ResultadoWesternBlot: record.resultadoWesternBlot,
    }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WesternBlot");
    XLSX.writeFile(workbook, "Preventix_Western.xlsx");
  }, [selectedRecords]);

  // Verificación de autenticación
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const filteredRecords = filterRecords();

  // Estado inicial de carga
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
        <h2 className="banner-title">WesternBlot</h2>

        <div className="banner-grid">
          <div className="banner-card">
            <p>Pacientes</p>
            <h3>{filteredRecords.length}</h3>
          </div>

          <div className="banner-card">
            <FaSearch className="icon" />
            <input
              type="text"
              placeholder="Buscar por Folio, estado, resultado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              className="search-input"
            />
          </div>

          <div className="banner-card">
            <div className="filter-item">
              <CiFilter className="icon" />
              <span>Fecha Ingreso: </span>
              <input
                type="date"
                value={fechaIngresoRange.start}
                onChange={(e) =>
                  setFechaIngresoRange({ ...fechaIngresoRange, start: e.target.value })
                }
              />
              <input
                type="date"
                value={fechaIngresoRange.end}
                onChange={(e) =>
                  setFechaIngresoRange({ ...fechaIngresoRange, end: e.target.value })
                }
              />
            </div>
          </div>

          <div className="banner-card">
            <div className="filter-item">
              <CiFilter className="icon" />
              <span>Folio: </span>
              <input
                type="number"
                placeholder="Min"
                value={folioDevelabRange.min}
                onChange={(e) =>
                  setFolioDevelabRange({ ...folioDevelabRange, min: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Max"
                value={folioDevelabRange.max}
                onChange={(e) =>
                  setFolioDevelabRange({ ...folioDevelabRange, max: e.target.value })
                }
              />
            </div>
          </div>

          <div className="banner-card full-width-card">
            <div className="section-actions">
              {selectedRecords.length > 0 && (
                <PrintButtonMicro selectedAppointments={selectedRecords} />
              )}
              <button onClick={handleSelectAll}>Seleccionar</button>
              <button onClick={openBulkEditModal}>Editar</button>
              <button onClick={handleDownloadExcel}>Excel</button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor scroll horizontal para la tabla */}
      <div className="table-responsive-wb">
        <table>
          <thead>
            <tr>
              <th>Seleccionar</th>
              <th>Folio Devellab</th>
              <th>Hora Inicio</th>
              <th>Estado</th>
              <th>Fecha Precipitado</th>
              <th>Fecha Lavado</th>
              <th>Analista</th>
              <th>Tecnico</th>
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
                  <td>
                    {record.fechaPrecipitado
                      ? moment(record.fechaPrecipitado).format("YYYY-MM-DD")
                      : ""}
                  </td>
                  <td>
                    {record.fechaLavado
                      ? moment(record.fechaLavado).format("YYYY-MM-DD")
                      : ""}
                  </td>
                  <td>
                    <select
                      value={localChanges[record._id]?.lavoWestern || record.lavoWestern || ""}
                      onChange={(e) =>
                        handleLocalChange(record._id, "lavoWestern", e.target.value)
                      }
                      className="input"
                    >
                      <option value="">Selecciona</option>
                      <option value="JEHR">JEHR</option>
                      <option value="ENTT">ENTT</option>
                      <option value="DKVG">DKVG</option>
                      <option value="JPRO">JPRO</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={localChanges[record._id]?.tecnicoWB || record.tecnicoWB || ""}
                      onChange={(e) =>
                        handleLocalChange(record._id, "tecnicoWB", e.target.value)
                      }
                      className="input"
                    >
                      <option value="">Selecciona</option>
                      <option value="LGD">LGD</option>
                      <option value="FDZG">FDZG</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={
                        localChanges[record._id]?.estatusWesternBlot ||
                        record.estatusWesternBlot ||
                        ""
                      }
                      onChange={(e) =>
                        handleLocalChange(record._id, "estatusWesternBlot", e.target.value)
                      }
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
                      value={
                        localChanges[record._id]?.resultadoWesternBlot ||
                        record.resultadoWesternBlot ||
                        ""
                      }
                      onChange={(e) =>
                        handleLocalChange(record._id, "resultadoWesternBlot", e.target.value)
                      }
                    />
                  </td>
                  <td>{record.resultadoElisa}</td>
                  <td>
                    <button
                      className="botontabla"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIdCuestionarioClick(
                          record.appointmentId ? record.appointmentId : null
                        );
                      }}
                    >
                      Ver
                    </button>
                  </td>
                  <td>
                    <button
                      className="botonactualizar"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateFields(record._id, localChanges[record._id]);
                      }}
                      disabled={!localChanges[record._id]}
                    >
                      Actualizar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13">
                  No se encontraron registros de Preventix que cumplan con los criterios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para cuestionario */}
      <Modal show={!!selectedAppointment} onClose={closeModal} appointment={selectedAppointment} />

      {/* Modal para edición masiva */}
      <BulkEditModal
        show={showBulkEditModal}
        onClose={closeBulkEditModal}
        onSave={handleBulkSave}
      />
    </section>
  );
};

export default WesternBlot;
