import React, { useRef, useEffect, forwardRef } from "react";
import bwipjs from "bwip-js";
import moment from "moment";

// Función para extraer iniciales ignorando palabras comunes
const getInitials = (fullName) => {
  if (!fullName) return "";
  const ignoreWords = ["de", "del", "la", "los", "las"];
  const words = fullName
    .split(" ")
    .filter(word => word && !ignoreWords.includes(word.toLowerCase()));
  return words.map(word => word.charAt(0).toUpperCase()).join("");
};

const BarcodeLabelMicro = forwardRef(({ appointment }, ref) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && appointment?.folioDevelab) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: "qrcode",
          text: String(
            appointment.folioDevelab +
              " " +
              (appointment.appointmentId?.patientFirstName || "") +
              " " +
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

  // Concatenamos todos los campos del nombre
  const fullName = appointment?.appointmentId
    ? `${appointment.appointmentId.patientFirstName || ""} ${appointment.appointmentId.patientLastName || ""} ${appointment.appointmentId.patientMotherLastName || ""}`.trim()
    : "";

  // Extraemos todas las iniciales significativas
  const iniciales = fullName ? getInitials(fullName) : "NA";

  const nombre = appointment?.appointmentId
    ? `${appointment.appointmentId.patientFirstName || ""} ${appointment.appointmentId.patientLastName || ""} ${appointment.appointmentId.patientMotherLastName || ""}`.toUpperCase()
    : "N/A";

  const fechaNacimiento = appointment?.appointmentId?.birthDate
    ? moment(appointment.appointmentId.birthDate).format("DD/MM/YYYY")
    : "N/D";

  const location = appointment?.appointmentId?.sampleLocation || "Ubicación no disponible";

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
        fontWeight: "900",
        margin: "0",
        padding: "0",
      }}
    >
      {/* Columna izquierda: QR, folio y iniciales */}
      <div
        style={{
          width: "10mm",
          marginRight: "1mm",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0",
          margin: "0",
        }}
      >
        <div style={{ fontSize: "5.8px", margin: "0", padding: "0" }}>
          {appointment?.folioDevelab || "Sin folio"}
        </div>
        <canvas
          ref={canvasRef}
          style={{ width: "7mm", height: "7mm", margin: "0", padding: "0" }}
        ></canvas>
        <div style={{ fontSize: "5px", margin: "0", padding: "0.5mm", lineHeight: "1" }}>
          {iniciales}
        </div>
      </div>
      {/* Columna derecha: Detalles del paciente */}
      <div
        style={{
          fontSize: "5.5px",
          lineHeight: "1.1em",
          color: "black",
          width: "calc(100% - 11mm)",
          margin: "0",
          padding: "0",
        }}
      >
        <div style={{ paddingTop: "0.6mm", fontSize: "6px", margin: "0", padding: "0" }}>
          {appointment?.folioDevelab || "Sin folio"}
        </div>
        <div style={{ margin: "0", padding: "0" }}>{nombre}</div>
        <div style={{ margin: "0", padding: "0" }}>N.{fechaNacimiento}</div>
        <div style={{ margin: "0", padding: "0" }}>{location}</div>
      </div>
    </div>
  );
});

export default BarcodeLabelMicro;
