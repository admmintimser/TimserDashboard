import React, { useRef, useEffect, forwardRef } from "react";
import bwipjs from "bwip-js";
import moment from "moment";

const BarcodeLabelMicro = forwardRef(({ appointment }, ref) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && appointment?.folioDevelab) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: "qrcode",
          text: String(
            appointment.folioDevelab + " " +
            (appointment.appointmentId?.patientFirstName || "") + " " +
            (appointment.appointmentId?.patientLastName || "")
          ),
          scale: 3,
          includetext: false,
        });
      } catch (e) {
        console.error("Error generating QR code:", e);
      }
    }
  }, [appointment?.folioDevelab]);

  const nombre = appointment?.appointmentId
    ? `${appointment.appointmentId.patientFirstName || ''} ${appointment.appointmentId.patientLastName || ''} ${appointment.appointmentId.patientMotherLastName || ''}`.toUpperCase()
    : 'N/A';

  const fechaNacimiento = appointment?.appointmentId?.birthDate
    ? moment(appointment.appointmentId.birthDate).format("DD/MM/YYYY")
    : 'N/D';

  return (
    <div
      ref={ref}
      style={{
        width: "25mm",
        height: "13mm",
        display: "flex",
        flexDirection: "row",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "Roboto",
        fontWeight: 900,
        margin: "0", /* Evita márgenes verticales que generen huecos */
        padding: "0", 
      }}
    >
      {/* Columna Izquierda: QR, Folio */}
      <div style={{ width: "10mm", textAlign: "center" }}>
        <div style={{ fontSize: "6px", marginTop: "2px" }}>
          {appointment?.folioDevelab || "Sin folio"}
        </div>
        <canvas
          ref={canvasRef}
          style={{ width: "7mm", height: "7mm", marginTop: "2px" }}
        />
      </div>

      {/* Columna Derecha: Nombre, Fecha, etc. */}
      <div style={{ fontSize: "5.5px", marginLeft: "1mm" }}>
        <div style={{ fontSize: "6px" }}>
          {appointment?.folioDevelab || "Sin folio"}
        </div>
        <div>{nombre}</div>
        <div>N.{fechaNacimiento}</div>
        <div>{appointment?.appointmentId?.sampleLocation || "CDMX"}</div>
      </div>
    </div>
  );
});

export default BarcodeLabelMicro;
