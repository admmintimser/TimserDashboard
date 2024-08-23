import React, { useRef, useEffect, forwardRef } from "react";
import bwipjs from "bwip-js";

const BarcodeLabelMicro = forwardRef(({ appointment }, ref) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current && appointment.folioDevelab) {
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
    }, [appointment.folioDevelab]);

    const nombre = (appointment.appointmentId.patientFirstName + " " + appointment.appointmentId.patientLastName).toUpperCase();

    return (
        <div ref={ref} style={{ 
            width: '25mm', 
            height: '13mm', 
            padding: '1mm', 
            boxSizing: 'border-box', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'flex-start', 
            alignItems: 'center', 
            fontFamily: 'Arial' 
        }} className="border border-gray-300 bg-white">
            <div style={{ width: '10mm', marginRight: '1mm', textAlign: 'center' }}>
                <div style={{ fontSize: '5pt', fontWeight: '700' }}>{appointment.folioDevelab}</div>
                <canvas ref={canvasRef} style={{ width: '10mm', height: '10mm' }}></canvas>
            </div>
            <div style={{ 
                fontSize: '5pt', 
                lineHeight: '1.1em', 
                fontWeight: '700', 
                color: 'black',
                width: '13mm', // Ajuste de ancho para alinear
            }}>
                <div>{appointment.folioDevelab}</div>
                <div>{nombre.split(" ")[0]}</div> {/* Nombre del paciente */}
                <div>{nombre.split(" ")[1]}</div> {/* Apellido del paciente */}
                <div>{appointment.appointmentId.sampleLocation}</div>
            </div>
        </div>
    );
});

export default BarcodeLabelMicro;
