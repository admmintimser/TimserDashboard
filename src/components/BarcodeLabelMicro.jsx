import React, { useRef, useEffect, forwardRef } from "react";
import bwipjs from "bwip-js";
import moment from "moment"; // Para formatear la fecha de nacimiento

const BarcodeLabelMicro = forwardRef(({ appointment }, ref) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current && appointment?.folioDevelab) {
            try {
                bwipjs.toCanvas(canvasRef.current, {
                    bcid: 'qrcode', // Tipo de código QR
                    text: String(appointment.folioDevelab), // El texto escaneable será el FolioDevelab
                    scale: 3, // Factor de escala 3x
                    includetext: false, // No mostrar texto legible por humanos dentro del QR
                });
            } catch (e) {
                console.error('Error generating QR code:', e);
            }
        }
    }, [appointment?.folioDevelab]);

    // Verificación de que appointment y appointmentId existen
    const nombre = appointment?.appointmentId
        ? `${appointment.appointmentId.patientFirstName || ''} ${appointment.appointmentId.patientLastName || ''} ${appointment.appointmentId.patientMotherLastName || ''}`.toUpperCase()
        : 'N/A'; // Si no existe appointmentId, mostrar "N/A"

    // Iniciales del paciente (Primer nombre, primer apellido, segundo apellido)
    const iniciales = appointment?.appointmentId
        ? `${appointment.appointmentId.patientFirstName?.charAt(0) || ''}${appointment.appointmentId.patientLastName?.charAt(0) || ''}${appointment.appointmentId.patientMotherLastName?.charAt(0) || ''}`.toUpperCase()
        : 'NA';

    // Fecha de nacimiento formateada en dd/mm/yyyy
    const fechaNacimiento = appointment?.appointmentId?.birthDate
        ? moment(appointment.appointmentId.birthDate).format("DD/MM/YYYY")
        : 'N/D'; // Si no hay fecha de nacimiento, mostrar "N/D"

    const location = appointment?.appointmentId?.sampleLocation || 'Ubicación no disponible'; // Ubicación de la muestra

    return (
        <div ref={ref} style={{ 
            width: '25mm', 
            height: '13mm', 
            padding: '0mm', 
            boxSizing: 'border-box', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'flex-start', 
            alignItems: 'center', 
            fontFamily: 'Roboto',
            fontWeight:'900' 
        }} className="border bg-white">
            {/* Parte izquierda con QR y folio */}
            <div style={{ width: '10mm', marginRight: '1mm', textAlign: 'center',lineHeight: '32%', }}>
                <div style={{ fontSize: '5.8px', color:'black', paddingTop:'0.5mm' }}>{appointment?.folioDevelab || 'Sin folio'}</div>
                <canvas ref={canvasRef} style={{ width: '7mm', height: '7mm' , paddingTop:'0.5mm'}}></canvas>
                <div style={{ fontSize: '6px',color:'black', paddingTop:'0.5mm' }}>{iniciales}</div> {/* Iniciales */}
            </div>
            {/* Parte derecha con folio, nombre completo, fecha de nacimiento y ubicación */}
            <div style={{ 
                fontSize: '5.5px', 
                lineHeight: '1.1em', 
                color: 'black',
                width: '13mm', // Ajuste de ancho para alinear
            }}>
                <div style={{paddingTop:'0.6mm',fontSize: '6px'}}>{appointment?.folioDevelab || 'Sin folio'}</div>
                <div>{nombre}</div> {/* Nombre completo con apellidos */}
                <div>N.{fechaNacimiento}</div> {/* Fecha de nacimiento */}
                <div>{location}</div> {/* Ubicación de la muestra */}
            </div>
        </div>
    );
});

export default BarcodeLabelMicro;
