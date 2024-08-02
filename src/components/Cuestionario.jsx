// src/components/Cuestionario.jsx
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa"; // Importar el icono FaSearch
import "./dashboard.css"; // Usar el mismo archivo CSS que el Dashboard

const Cuestionario = () => {
    const [cuestionarios, setCuestionarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false); // Estado para modo de edición
    const [formValues, setFormValues] = useState({
        id: "",
        question: "",
        answers: "",
        field: "",
        type: "",
        nextq: ""
    });

    const { isAuthenticated } = useContext(Context);

    const fetchData = async () => {
        try {
            const response = await axios.get(
                "https://webapitimser.azurewebsites.net/api/v1/cuestionario/getall",
                { withCredentials: true }
            );
            setCuestionarios(response.data.cuestionarios.reverse());
        } catch (error) {
            toast.error("Error fetching questions: " + error.message);
            setCuestionarios([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleModalOpen = () => {
        setShowModal(true);
        setEditMode(false); // Asegurarse de que no esté en modo de edición
    };

    const handleModalClose = () => {
        setShowModal(false);
        setFormValues({
            id: "",
            question: "",
            answers: "",
            field: "",
            type: "",
            nextq: ""
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(
                    `https://webapitimser.azurewebsites.net/api/v1/cuestionario/update/${formValues.id}`,
                    formValues,
                    { withCredentials: true }
                );
                toast.success("Pregunta actualizada con éxito");
            } else {
                await axios.post(
                    "https://webapitimser.azurewebsites.net/api/v1/cuestionario/create",
                    formValues,
                    { withCredentials: true }
                );
                toast.success("Pregunta creada con éxito");
            }
            handleModalClose();
            fetchData();
        } catch (error) {
            toast.error("Error guardando pregunta: " + error.message);
        }
    };

    const handleEdit = (cuestionario) => {
        setFormValues({
            id: cuestionario.id,
            question: cuestionario.question,
            answers: cuestionario.answers.join(", "),
            field: cuestionario.field,
            type: cuestionario.type,
            nextq: typeof cuestionario.nextq === "string" ? cuestionario.nextq : JSON.stringify(cuestionario.nextq)
        });
        setEditMode(true);
        setShowModal(true);
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <section className="dashboard page">
            <div className="banner">
                <div className="secondBox">
                    <p>Total Preguntas</p>
                    <h3>{cuestionarios.length}</h3>
                </div>
                <div className="thirdBox">
                    <div className="card-content">
                        <span className="card-title">Buscar</span>
                        <input
                            type="text"
                            placeholder="Buscar por pregunta..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                            className="search-input"
                        />
                        <FaSearch className="card-icon" />
                    </div>
                </div>
                <button onClick={handleModalOpen} className="appoin-button">
                    Agregar Pregunta
                </button>
                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={handleModalClose}>
                                &times;
                            </span>
                            <h2>{editMode ? "Editar Pregunta" : "Agregar Pregunta"}</h2>
                            <form onSubmit={handleFormSubmit}>
                                <input
                                    type="text"
                                    name="id"
                                    placeholder="ID"
                                    value={formValues.id}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                    disabled={editMode} // Deshabilitar el campo ID en modo de edición
                                />
                                <input
                                    type="text"
                                    name="question"
                                    placeholder="Pregunta"
                                    value={formValues.question}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                />
                                <input
                                    type="text"
                                    name="answers"
                                    placeholder="Respuestas (separadas por coma)"
                                    value={formValues.answers}
                                    onChange={handleFormChange}
                                    className="input"
                                />
                                <input
                                    type="text"
                                    name="field"
                                    placeholder="Campo"
                                    value={formValues.field}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                />
                                <input
                                    type="text"
                                    name="type"
                                    placeholder="Tipo"
                                    value={formValues.type}
                                    onChange={handleFormChange}
                                    className="input"
                                    required
                                />
                                <input
                                    type="text"
                                    name="nextq"
                                    placeholder="Siguiente pregunta"
                                    value={formValues.nextq}
                                    onChange={handleFormChange}
                                    className="input"
                                />
                                <button type="submit" className="save-button">
                                    {editMode ? "Actualizar" : "Guardar"}
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
                            <th>Pregunta</th>
                            <th>Respuestas</th>
                            <th>Campo</th>
                            <th>Tipo</th>
                            <th>Siguiente Pregunta</th>
                            <th>Acciones</th> {/* Nueva columna para acciones */}
                        </tr>
                    </thead>
                    <tbody>
                        {cuestionarios.length > 0 ? (
                            cuestionarios
                                .filter((cuestionario) =>
                                    cuestionario.question.toLowerCase().includes(searchTerm)
                                )
                                .map((cuestionario) => (
                                    <tr key={cuestionario._id}>
                                        <td>{cuestionario.question}</td>
                                        <td>{cuestionario.answers.join(", ")}</td>
                                        <td>{cuestionario.field}</td>
                                        <td>{cuestionario.type}</td>
                                        <td>{typeof cuestionario.nextq === "string" ? cuestionario.nextq : JSON.stringify(cuestionario.nextq)}</td>
                                        <td>
                                            <button onClick={() => handleEdit(cuestionario)} className="save-button">
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="7">No se encontraron preguntas.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default Cuestionario;
