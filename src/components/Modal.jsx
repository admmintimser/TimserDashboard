import React from "react";

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

export default Modal;
