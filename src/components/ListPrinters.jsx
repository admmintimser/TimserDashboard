import React from "react";
import qz from "qz-tray";

const ListPrinters = () => {
    const handleListPrinters = async () => {
        try {
            await qz.websocket.connect();
            const printers = await qz.printers.find();
            console.log("Available printers:", printers);
            alert("Available printers: " + printers.join(", "));
            qz.websocket.disconnect();
        } catch (err) {
            console.error("Error: ", err);
            alert("Error al conectar con QZ Tray. Asegúrate de que QZ Tray esté ejecutándose.");
        }
    };

    return (
        <div>
            <button onClick={handleListPrinters} className="btn btn-primary">
                Listar Impresoras
            </button>
        </div>
    );
};

export default ListPrinters;
