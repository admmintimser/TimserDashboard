import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import BarcodeLabelMicro from "./BarcodeLabelMicro";

const PrintButtonMicro = ({ selectedAppointments }) => {
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Etiquetas_Pacientes`,
    });

    return (
        <div>
            <button onClick={handlePrint} >
                Imprimir
            </button>
            <div style={{ display: "none" }}>
                <div ref={componentRef}>
                    {selectedAppointments.map((appointment, index) => (
                        <React.Fragment key={index}>
                            {[...Array(4)].map((_, i) => (
                                <BarcodeLabelMicro key={`${index}-${i}`} appointment={appointment} />
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrintButtonMicro;
