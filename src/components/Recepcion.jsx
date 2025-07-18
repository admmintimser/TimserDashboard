// src/components/Recepcion.jsx
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import moment from "moment-timezone";
import { DNA } from "react-loader-spinner";
import "./dashboard.css";

// Hook de debounce para optimizar la búsqueda
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Recepcion = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [formValues, setFormValues] = useState({
    tiempoInicioProceso: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAuthenticated } = useContext(Context);

  // Se utiliza la ruta optimizada en el backend para obtener las citas (ya optimizadas con .lean())
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://webapitimser.azurewebsites.net/api/v1/appointment/dashboard",
        { withCredentials: true }
      );
      const appointmentsData = response.data.appointments || [];
      // Solo se consideran las citas con tomaProcesada === true
      const processedAppointments = appointmentsData.filter(
        (appointment) => appointment.tomaProcesada === true
      );
      // Se invierte el arreglo para mostrar los últimos primero
      setAppointments(processedAppointments.reverse());
    } catch (error) {
      toast.error("Error fetching appointments: " + error.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBarcodeInput = useCallback((e) => {
    setSearchTerm(e.target.value.trim());
  }, []);

  const handleClearBarcodeInput = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleSelectAppointment = useCallback((appointment) => {
    setSelectedAppointments((prev) =>
      prev.some((appt) => appt._id === appointment._id)
        ? prev.filter((appt) => appt._id !== appointment._id)
        : [...prev, appointment]
    );
  }, []);

  const handleModalOpen = useCallback(() => {
    if (selectedAppointments.length === 0) {
      toast.info(
        "Por favor, seleccione al menos una cita antes de ingresar al laboratorio."
      );
      return;
    }
    setShowModal(true);
  }, [selectedAppointments]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setFormValues({ tiempoInicioProceso: "" });
    setIsSubmitting(false);
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedAppointments.map(async (appointment) => {
          try {
            return await axios.post(
              "https://webapitimser.azurewebsites.net/api/v1/preventix/post",
              {
                appointmentId: appointment._id,
                tiempoInicioProceso: formValues.tiempoInicioProceso,
                folioDevelab: appointment.FolioDevelab,
                estatusTomaMuestra: true,
                estatusRecepcion: true,
              },
              { withCredentials: true }
            );
          } catch (error) {
            if (error.response?.data?.message) {
              toast.error(
                `Error con el folio ${appointment.FolioDevelab}: ${error.response.data.message}`
              );
            } else {
              toast.error(
                `Error con el folio ${appointment.FolioDevelab}: ${error.message}`
              );
            }
            throw error;
          }
        })
      );
      toast.success("Entradas de Preventix creadas exitosamente");
      handleModalClose();
      fetchData();
    } catch (error) {
      console.error("Error creating Preventix entries:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Filtrado optimizado usando useMemo y debounce
  const filteredAppointments = useMemo(() => {
    if (!debouncedSearchTerm) return appointments;
    const term = debouncedSearchTerm.toLowerCase();
    return appointments.filter((appointment) =>
      (appointment.FolioDevelab &&
        appointment.FolioDevelab.toString().includes(term)) ||
      (appointment.patientFirstName &&
        appointment.patientFirstName.toLowerCase().includes(term)) ||
      (appointment.patientLastName &&
        appointment.patientLastName.toLowerCase().includes(term)) ||
      (appointment.email &&
        appointment.email.toLowerCase().includes(term)) ||
      (appointment.sampleLocation &&
        appointment.sampleLocation.toLowerCase().includes(term))
    );
  }, [appointments, debouncedSearchTerm]);

  // Mostrar loader mientras carga
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

  // Si no hay citas ingresadas hoy, mostrar mensaje
  if (appointments.length === 0) {
    return (
      <div className="no-data">
        <p>No hay citas ingresadas hoy</p>
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
            <button
              onClick={handleModalOpen}
              className="appoin-button1"
              disabled={selectedAppointments.length === 0 || isSubmitting}
            >
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
                    <button
                      type="submit"
                      className="save-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Guardando..." : "Guardar"}
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
              <FaTrash
                className="clear-icon"
                onClick={handleClearBarcodeInput}
              />
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
                      checked={selectedAppointments.some(
                        (appt) => appt._id === appointment._id
                      )}
                      onChange={() =>
                        handleSelectAppointment(appointment)
                      }
                    />
                  </td>
                  <td>{`${appointment.patientFirstName} ${appointment.patientLastName}`}</td>
                  <td>{appointment.email}</td>
                  <td>{appointment.sampleLocation}</td>
                  <td>{appointment.FolioDevelab}</td>
                  <td>
                    {moment(appointment.fechaToma).format(
                      "YYYY-MM-DD HH:mm"
                    )}
                  </td>
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
