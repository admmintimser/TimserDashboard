import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import moment from "moment-timezone";
import "./dashboard.css"; // Usar el mismo archivo CSS que el Dashboard

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
                    <p><strong>Nombre:</strong> {${appointment.patientFirstName} ${appointment.patientLastName}}</p>
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

const PreventixDashboard = () => {
    const [preventixRecords, setPreventixRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const { isAuthenticated } = useContext(Context);

    const fetchPreventixData = async () => {
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
        }
    };

    useEffect(() => {
        fetchPreventixData();
        const interval = setInterval(fetchPreventixData, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, []);

    const handleRowClick = async (record) => {
        try {
            const response = await axios.get(
                https://webapitimser.azurewebsites.net/api/v1/appointment/${record.appointmentId._id},
                { withCredentials: true }
            );
            setSelectedAppointment(response.data.appointment);
        } catch (error) {
            toast.error("Error fetching appointment details: " + error.message);
        }
    };

    const closeModal = () => {
        setSelectedAppointment(null);
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
            <div className="appointments-list" style={{ overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Folio Develab</th>
                            <th>Estatus Tiempo</th>
                            <th>Fecha de Ingreso</th>
                            <th>Estatus Resultados</th>
                            <th>Fecha envió resultados</th>
                            <th>Estado de Muestra</th>
                            <th>Temperatura Recepción</th>
                            <th>Interpretación</th>
                            <th>Estado Western Blot</th>
                            <th>Resultado Western Blot</th>
                            <th>Estado Elisa</th>
                            <th>Resultado Elisa</th>
                            <th>Ubicación del Proceso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {preventixRecords.length > 0 ? (
                            preventixRecords
                                .filter(
                                    (record) =>
                                        record._id.toLowerCase().includes(searchTerm) ||
                                        (record.appointmentId && record.appointmentId._id.toLowerCase().includes(searchTerm)) ||
                                        (record.estatusMuestra && record.estatusMuestra.toLowerCase().includes(searchTerm)) ||
                                        (record.tecnicoWB && record.tecnicoWB.toLowerCase().includes(searchTerm))
                                )
                                .map((record) => (
                                    <tr key={record._id} onClick={() => handleRowClick(record)}>
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
                                        <td>{record.temperatura}º</td>
                                        <td>{record.interpretacionPreventix}</td>
                                        <td>{record.estatusWesternBlot}</td>
                                        <td>{record.resultadoWesternBlot}</td>
                                        <td>{record.estatusElisa}</td>
                                        <td>{record.resultadoElisa}</td>
                                        <td>{record.lugarProceso}</td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="13">No se encontraron registros de Preventix.</td>
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

Schema
// preventixSchema.js
import mongoose from "mongoose";

const preventixSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true
    },
    tiempoInicioProceso: {
        type: Date,
        required: true
    },
    estatusMuestra: {
        type: String,
    },
    tiempoFinProceso: {
        type: Date,
    },
    temperatura: {
        type: String,
    },
    folioDevelab: {
        type: String,
    },
    interpretacionPreventix: {
        type: String,
    },
    estatusWesternBlot: {
        type: String,
    },
    lavoWestern: {
        type: String,
    },
    fechaPrecipitado: {
        type: Date,
    },
    fechaLavado: {
        type: Date,
    },
    tecnicoWB: {
        type: String,
    },
    resultadoWesternBlot: {
        type: String,
    },
    estatusElisa: {
        type: String,
    },
    lavoElisa: {
        type: String,
    },
    numeroPlaca: {
        type: String,
    },
    lugarProceso: {
        type: String,
    },
    resultadoElisa: {
        type: String,
    },
    resultadosEnviados: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Preventix = mongoose.model("Preventix", preventixSchema);

Rutas
import express from "express";
import {
    deletePreventix,
    getAllPreventix,
    postPreventix,
    updatePreventixStatus,
    countPreventixProcessed,
    countPreventixNotProcessed,
    getAllPreventixToday
} from "../controller/preventixController.js";
import { isAdminAuthenticated, isReceptionistOrAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isReceptionistOrAdminAuthenticated, postPreventix);
router.get("/getall", isAdminAuthenticated, getAllPreventix);
router.put("/update/:id", isAdminAuthenticated, updatePreventixStatus);
router.delete("/delete/:id", isAdminAuthenticated, deletePreventix);
router.get('/count/processed', countPreventixProcessed);
router.get('/count/not-processed', countPreventixNotProcessed);
router.get('/getall/today', isAdminAuthenticated, getAllPreventixToday);

export default router;

Controllador
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Preventix } from "../models/preventixSchema.js";
import moment from 'moment';

export const getAllPreventix = catchAsyncErrors(async (req, res, next) => {
    const preventix = await Preventix.find().populate("appointmentId");
    res.status(200).json({ success: true, preventix });
});

export const getAllPreventixToday = catchAsyncErrors(async (req, res, next) => {
    const today = moment().startOf('day');
    const preventix = await Preventix.find({
        createdAt: {
            $gte: today.toDate(),
            $lt: moment(today).endOf('day').toDate()
        }
    }).populate("appointmentId");
    res.status(200).json({ success: true, preventix });
});

export const updatePreventixStatus = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    let preventix = await Preventix.findById(id);
    if (!preventix) {
        return next(new ErrorHandler("Preventix record not found!", 404));
    }
    preventix = await Preventix.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({ success: true, message: "Preventix Status Updated!" });
});

export const deletePreventix = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const preventix = await Preventix.findById(id);
    if (!preventix) {
        return next(new ErrorHandler("Preventix record Not Found!", 404));
    }
    await preventix.deleteOne();
    res.status(200).json({ success: true, message: "Preventix record Deleted!" });
});

export const countPreventixProcessed = catchAsyncErrors(async (req, res, next) => {
    const processedCount = await Preventix.countDocuments({ resultadosEnviados: true });
    res.status(200).json({ success: true, count: processedCount });
});

export const countPreventixNotProcessed = catchAsyncErrors(async (req, res, next) => {
    const notProcessedCount = await Preventix.countDocuments({ resultadosEnviados: false });
    res.status(200).json({ success: true, count: notProcessedCount });
});

export const postPreventix = catchAsyncErrors(async (req, res, next) => {
    const {
        appointmentId,
        tiempoInicioProceso,
        estatusMuestra
    } = req.body;

    if (!appointmentId || !tiempoInicioProceso || !estatusMuestra) {
        return next(new ErrorHandler("Por favor, complete todos los campos obligatorios.", 400));
    }

    const preventix = await Preventix.create(req.body);

    res.status(201).json({ success: true, message: "¡Registro de Preventix creado con éxito!", preventix });
});