// src/components/ModalValidation.jsx

import React from "react";

const ModalValidation = ({ show, onClose, record }) => {
    if (!show || !record) {
        return null;
    }

    // Funciones para formatear datos
    const formatDate = (date) => (date ? new Date(date).toLocaleString() : 'N/A');
    const formatBoolean = (value) => (value ? 'Sí' : 'No');

    // Asegúrate de que los campos como appointmentId sean mostrados correctamente
    const appointmentId = record.appointmentId ? record.appointmentId._id || record.appointmentId : 'N/A';

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Detalles del Registro Preventix</h2>
                <div className="report-section">
                    <p><strong>ID de la Cita:</strong> {appointmentId}</p>
                    <p><strong>Folio Develab:</strong> {record.folioDevelab}</p>
                    <p><strong>Fecha de Inicio del Proceso:</strong> {formatDate(record.tiempoInicioProceso)}</p>
                    <p><strong>Fecha de Fin del Proceso:</strong> {formatDate(record.tiempoFinProceso)}</p>
                    <p><strong>Temperatura:</strong> {record.temperatura || 'N/A'}</p>
                    <p><strong>Interpretación Preventix:</strong> {record.interpretacionPreventix || 'N/A'}</p>
                    <p><strong>Estatus de Muestra:</strong> {record.estatusMuestra || 'N/A'}</p>
                </div>
                <div className="report-section">
                    <h3>Western Blot</h3>
                    <p><strong>Estatus Western Blot:</strong> {record.estatusWesternBlot || 'N/A'}</p>
                    <p><strong>Lavado Western:</strong> {record.lavoWestern || 'N/A'}</p>
                    <p><strong>Fecha de Precipitado:</strong> {formatDate(record.fechaPrecipitado)}</p>
                    <p><strong>Fecha de Lavado:</strong> {formatDate(record.fechaLavado)}</p>
                    <p><strong>Técnico WB:</strong> {record.tecnicoWB || 'N/A'}</p>
                    <p><strong>Resultado Western Blot:</strong> {record.resultadoWesternBlot || 'N/A'}</p>
                </div>
                <div className="report-section">
                    <h3>Elisa</h3>
                    <p><strong>Estatus Elisa:</strong> {record.estatusElisa || 'N/A'}</p>
                    <p><strong>Lavado Elisa:</strong> {record.lavoElisa || 'N/A'}</p>
                    <p><strong>Número de Placa:</strong> {record.numeroPlaca || 'N/A'}</p>
                    <p><strong>Resultado Elisa:</strong> {record.resultadoElisa || 'N/A'}</p>
                </div>
                <div className="report-section">
                    <h3>Otros Detalles</h3>
                    <p><strong>Ubicación del Proceso:</strong> {record.lugarProceso || 'N/A'}</p>
                    <p><strong>Estatus Toma de Muestra:</strong> {formatBoolean(record.estatusTomaMuestra)}</p>
                    <p><strong>Estatus Recepción:</strong> {formatBoolean(record.estatusRecepcion)}</p>
                    <p><strong>Estatus Validación:</strong> {formatBoolean(record.estatusValidacion)}</p>
                    <p><strong>Estatus Liberación:</strong> {formatBoolean(record.estatusLiberacion)}</p>
                    <p><strong>Resultados Enviados:</strong> {formatBoolean(record.resultadosEnviados)}</p>
                </div>
            </div>
        </div>
    );
};

export default ModalValidation;
