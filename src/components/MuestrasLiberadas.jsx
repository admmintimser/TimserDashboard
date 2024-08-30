// src/components/MuestrasLiberadas.jsx

import React, { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import { DNA } from 'react-loader-spinner';
import * as XLSX from 'xlsx';
import "./EstatusPreventix.css"; // Usar el mismo archivo CSS que los otros dashboards

const MuestrasLiberadas = () => {
    const [preventixRecords, setPreventixRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [folioMin, setFolioMin] = useState("");
    const [folioMax, setFolioMax] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedRecords, setSelectedRecords] = useState([]);
    const { isAuthenticated } = useContext(Context);

    const fetchPreventixData = useCallback(async () => {
        try {
            const response = await axios.get(
                "https://webapitimser.azurewebsites.net/api/v1/preventix/getall",
                { withCredentials: true }
            );
            if (response.data.preventix) {
                // Filtrar registros que ya tienen estatusLiberacion = true
                const liberatedRecords = response.data.preventix.filter(record => record.estatusLiberacion === true);
                setPreventixRecords(liberatedRecords.reverse());
                setFilteredRecords(liberatedRecords.reverse());
            } else {
                throw new Error("No Preventix data received");
            }
        } catch (error) {
            toast.error("Error fetching Preventix records: " + error.message);
            setPreventixRecords([]);
            setFilteredRecords([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPreventixData();
        const interval = setInterval(fetchPreventixData, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, [fetchPreventixData]);

    // Manejar el filtro por folio mínimo y máximo
    const handleFilterByFolio = () => {
        const filtered = preventixRecords.filter(record => {
            const folio = parseInt(record.folioDevelab, 10);
            const min = folioMin ? parseInt(folioMin, 10) : -Infinity;
            const max = folioMax ? parseInt(folioMax, 10) : Infinity;
            return folio >= min && folio <= max;
        });
        setFilteredRecords(filtered);
    };

    const handleSelectRecord = (record) => {
        setSelectedRecords(prevSelected => {
            if (prevSelected.includes(record)) {
                return prevSelected.filter(r => r._id !== record._id);
            } else {
                return [...prevSelected, record];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedRecords.length === filteredRecords.length) {
            setSelectedRecords([]);
        } else {
            setSelectedRecords(filteredRecords);
        }
    };

    const handleCargaMasiva = () => {
        if (selectedRecords.length === 0) {
            toast.warn("No hay registros seleccionados para la carga");
            return;
        }

        const data = [];
        selectedRecords.forEach(record => {
            data.push({
                Folio: record.folioDevelab,
                Abreviatura: 'PX1',
                Resultado: record.resultadoWesternBlot
            });
            data.push({
                Folio: record.folioDevelab,
                Abreviatura: 'PX7',
                Resultado: record.resultadoElisa
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MuestrasLiberadas");
        XLSX.writeFile(workbook, "MuestrasLiberadas.xlsx");

        toast.success("Archivo Excel generado con éxito");
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (loading) {
        return (
            <div className="loading-container">
                <DNA
                    visible={true}
                    height="180"
                    width="180"
                    color="pink"
                    ariaLabel="dna-loading"
                    wrapperClass="dna-wrapper"
                />
            </div>
        );
    }

    return (
        <section className="dashboard page">
            <div className="banner">
                <div className="secondBox">
                    <p>Total Registros</p>
                    <h3>{filteredRecords.length}</h3>
                </div>
                <div className="thirdBox">
                    <div className="card-content">
                        <span className="card-title">Buscar</span>
                        <input
                            type="text"
                            placeholder="Buscar por ID, nombre o estado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                            className="search-input"
                        />
                        <FaSearch className="card-icon" />
                    </div>
                </div>
            </div>
            <div className="banner">
                <div className="card-content">
                    <input
                        type="number"
                        placeholder="Folio Min"
                        value={folioMin}
                        onChange={(e) => setFolioMin(e.target.value)}
                        className="input"
                    />
                    <input
                        type="number"
                        placeholder="Folio Max"
                        value={folioMax}
                        onChange={(e) => setFolioMax(e.target.value)}
                        className="input"
                    />
                    <button onClick={handleFilterByFolio} className="buttondashboard">Filtrar</button>
                </div>
            </div>
            <div className="banner">
                <button onClick={handleSelectAll} className="buttondashboard">Seleccionar Todo</button>
                <button onClick={handleCargaMasiva} className="buttondashboard">Carga Masiva</button>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Seleccionar</th>
                            <th>Folio Develab</th>
                            <th>Fecha de Ingreso</th>
                            <th>Temperatura</th>
                            <th>Resultado Western Blot</th>
                            <th>Resultado Elisa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length > 0 ? (
                            filteredRecords
                                .filter(
                                    (record) =>
                                        record._id.toLowerCase().includes(searchTerm) ||
                                        (record.folioDevelab && record.folioDevelab.toLowerCase().includes(searchTerm))
                                )
                                .map((record) => (
                                    <tr key={record._id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedRecords.includes(record)}
                                                onChange={() => handleSelectRecord(record)}
                                            />
                                        </td>
                                        <td>{record.folioDevelab}</td>
                                        <td>{record.tiempoInicioProceso ? new Date(record.tiempoInicioProceso).toLocaleString() : 'N/A'}</td>
                                        <td>{record.temperatura ? `${record.temperatura}º` : 'N/A'}</td>
                                        <td>{record.resultadoWesternBlot || 'N/A'}</td>
                                        <td>{record.resultadoElisa || 'N/A'}</td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="6">No se encontraron registros de Preventix.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default MuestrasLiberadas;
