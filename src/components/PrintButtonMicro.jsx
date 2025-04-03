import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import BarcodeLabelMicro from "./BarcodeLabelMicro";

const PrintButtonMicro = ({ selectedAppointments }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Etiquetas_Pacientes",
  });

  return (
    <div>
      <button onClick={handlePrint}>Imprimir</button>

      {/* Ocultamos la vista previa, solo visible al imprimir */}
      <div style={{ display: "none" }}>
        <div ref={componentRef} style={{ width: "100%" }}>
          {selectedAppointments.map((appointment, index) => (
            // Si deseas 4 copias por cada registro, duplicamos 4 veces
            <React.Fragment key={index}>
              {[...Array(4)].map((_, i) => (
                <div 
                  key={`${index}-${i}`} 
                  style={{ 
                    display: "block", 
                    pageBreakInside: "avoid" /* evita cortes de página dentro de la etiqueta */ 
                  }}
                >
                  <BarcodeLabelMicro appointment={appointment} />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrintButtonMicro;
