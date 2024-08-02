// src/components/Clientes.js
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import "./dashboard.css"; // Usar el mismo archivo CSS que el Dashboard

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formValues, setFormValues] = useState({
        nombre: "",
        estado: "",
        telefono: "",
        contactoPrincipal: "",
        correo: "",
        idDevellab: "",
        preventixComprados: 0,
        datosFacturacion: "",
        lugaresToma: [""]
    });

    const { isAuthenticated } = useContext(Context);

    const fetchData = async () => {
        try {
            const response = await axios.get(
                "https://webapitimser.azurewebsites.net/api/v1/cliente/getall",
                { withCredentials: true }
            );
            setClientes(response.data.clientes.reverse());
        } catch (error) {
            toast.error("Error fetching clients: " + error.message);
            setClientes([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleModalOpen = () => {
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setFormValues({
            nombre: "",
            estado: "",
            telefono: "",
            contactoPrincipal: "",
            correo: "",
            idDevellab: "",
            preventixComprados: 0,
            datosFacturacion: "",
            lugaresToma: [""]
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleLugaresTomaChange = (e, index) => {
        const newLugaresToma = [...formValues.lugaresToma];
        newLugaresToma[index] = e.target.value;
        setFormValues((prevValues) => ({
            ...prevValues,
            lugaresToma: newLugaresToma
        }));
    };

    const addLugarToma = () => {
        setFormValues((prevValues) => ({
            ...prevValues,
            lugaresToma: [...prevValues.lugaresToma, ""]
        }));
    };

    const removeLugarToma = (index) => {
        const newLugaresToma = [...formValues.lugaresToma];
        newLugaresToma.splice(index, 1);
        setFormValues((prevValues) => ({
            ...prevValues,
            lugaresToma: newLugaresToma
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "https://webapitimser.azurewebsites.net/api/v1/cliente/create",
                formValues,
                { withCredentials: true }
            );
            toast.success("Cliente creado con éxito");
            handleModalClose();
            fetchData();
        } catch (error) {
            toast.error("Error creando cliente: " + error.message);
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <section className="dashboard page">
            <div className="banner">
                <div className="secondBox">
                    <p>Total Clientes</p>
                    <h3>{clientes.length}</h3>
                </div>
                <div className="thirdBox">
                    <div className="card-content">
                        <span className="card-title">Buscar</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, estado o contacto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                            className="search-input"
                        />
                        <FaSearch className="card-icon" />
                    </div>
                </div>
                <button onClick={handleModalOpen} className="appoin-button">
                    Agregar Cliente
                </button>
                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={handleModalClose}>
                                &times;
                            </span>
                            <h2>Agregar Cliente</h2>
                            <form onSubmit={handleFormSubmit}>
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Nombre"
                                    value={formValues.nombre}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                />
                                <input
                                    type="text"
                                    name="estado"
                                    placeholder="Estado"
                                    value={formValues.estado}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                />
                                <input
                                    type="text"
                                    name="telefono"
                                    placeholder="Teléfono"
                                    value={formValues.telefono}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                />
                                <input
                                    type="email"
                                    name="correo"
                                    placeholder="Correo Electrónico"
                                    value={formValues.correo}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                />
                                <input
                                    type="number"
                                    name="idDevellab"
                                    placeholder="ID Devellab"
                                    value={formValues.idDevellab}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                />
                                <input
                                    type="number"
                                    name="preventixComprados"
                                    placeholder="Preventix Comprados"
                                    value={formValues.preventixComprados}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                />
                                
                                <label>Lugares de Toma:</label>
                                {formValues.lugaresToma.map((lugar, index) => (
                                    <div key={index} className="lugar-toma">
                                        <input
                                            type="text"
                                            placeholder={`Lugar de Toma ${index + 1}`}
                                            value={lugar}
                                            onChange={(e) => handleLugaresTomaChange(e, index)}
                                            className="input"
                                            required
                                        />
                                        <button type="button" onClick={() => removeLugarToma(index)} className="remove-button">
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={addLugarToma} className="add-button">
                                    Añadir Lugar de Toma
                                </button>
                                <button type="submit" className="save-button">
                                    Guardar
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <div className="appointments-list" style={{ overflowX: "auto" }}>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Lugares de Toma</th>
                            <th>Estado</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th>Preventix Realizados</th>
                            <th>Preventix Pendientes</th>
                            <th>Preventix Comprados</th>
                            <th>ID Devellab</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.length > 0 ? (
                            clientes
                                .filter((cliente) =>
                                    cliente.nombre.toLowerCase().includes(searchTerm) ||
                                    cliente.estado.toLowerCase().includes(searchTerm) ||
                                    cliente.contactoPrincipal?.toLowerCase().includes(searchTerm) // Asegurar que contactoPrincipal no sea null
                                )
                                .map((cliente) => (
                                    <tr key={cliente._id}>
                                        <td>{cliente.nombre}</td>
                                        <td>{cliente.lugaresToma.join(", ")}</td> {/* Visualizar lugares de toma */}
                                        <td>{cliente.estado}</td>
                                        <td>{cliente.telefono}</td>
                                        <td>{cliente.correo}</td>
                                        <td>{cliente.preventixComprados}</td>
                                        <td>{cliente.preventixComprados}</td>
                                        <td>{cliente.preventixComprados}</td>
                                        <td>{cliente.idDevellab}</td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="8">No se encontraron clientes.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default Clientes;
