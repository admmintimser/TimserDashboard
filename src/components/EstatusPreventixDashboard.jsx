// src/components/EstatusPreventixDashboard.jsx
import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import moment from "moment-timezone";
import { DNA } from "react-loader-spinner";
import "./EstatusPreventix.css";

const EstatusPreventixDashboard = () => {
  const [preventixRecords, setPreventixRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(Context);

  const fetchPreventixData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://webapitimser.azurewebsites.net/api/v1/preventix/getall",
        { withCredentials: true }
      );
      if (response.data.preventix) {
        setPreventixRecords(response.data.preventix.reverse());
      } else {
        throw new Error("No Preventix data received");
      }
    } catch (error) {
      toast.error("Error fetching Preventix records: " + error.message);
      setPreventixRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreventixData();
    const interval = setInterval(fetchPreventixData, 30000);
    return () => clearInterval(interval);
  }, [fetchPreventixData]);

  const calculateInterpretation = (wb, elisa) => {
    const riskWB = wb > 1.34 ? "CON RIESGO" : "SIN RIESGO";
    const riskElisa = elisa > 37.5 ? "CON RIESGO" : "SIN RIESGO";
    // Si alguno es "CON RIESGO", interpretación es "CON RIESGO"
    return (riskWB === "CON RIESGO" || riskElisa === "CON RIESGO")
      ? "CON RIESGO"
      : "SIN RIESGO";
  };

  const handleCalcInterpretation = useCallback(
    async (record) => {
      const interpretation = calculateInterpretation(
        parseFloat(record.resultadoWesternBlot),
        parseFloat(record.resultadoElisa)
      );
      try {
        await axios.put(
          `https://webapitimser.azurewebsites.net/api/v1/preventix/${record._id}`,
          { interpretacionPreventix: interpretation },
          { withCredentials: true }
        );
        toast.success(`Interpretación para ${record.folioDevelab}: ${interpretation}`);
        setPreventixRecords((prev) =>
          prev.map((r) =>
            r._id === record._id ? { ...r, interpretacionPreventix: interpretation } : r
          )
        );
      } catch (error) {
        toast.error("Error actualizando interpretación: " + error.message);
      }
    },
    [setPreventixRecords]
  );

  const calculateProgress = (record) => {
    const totalSteps = 6;
    let completed = 0;
    if (record.estatusTomaMuestra) completed++;
    if (record.estatusRecepcion) completed++;
    if (record.estatusELisa) completed++;
    if (record.estatusWB) completed++;
    if (record.estatusValidacion) completed++;
    if (record.estatusLiberacion) completed++;
    return (completed / totalSteps) * 100;
  };

  const renderStatus = (status) => (
    <div className={`status-circle ${status ? "status-completed" : "status-pending"}`} />
  );

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return preventixRecords.filter(
      (r) =>
        r._id.toLowerCase().includes(term) ||
        (r.folioDevelab && r.folioDevelab.toLowerCase().includes(term))
    );
  }, [preventixRecords, searchTerm]);

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (loading) {
    return (
      <div className="loading-container">
        <DNA visible height="180" width="180" color="pink" ariaLabel="dna-loading" />
      </div>
    );
  }

  return (
    <section className="dashboard page">
      <div className="banner">
        <div className="secondBox">
          <p>Total Registros</p>
          <h3>{preventixRecords.length}</h3>
        </div>
        <div className="thirdBox">
          <div className="card-content">
            <span className="card-title">Buscar</span>
            <input
              type="text"
              placeholder="Buscar por ID o folio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <FaSearch className="card-icon" />
          </div>
        </div>
      </div>

      {preventixRecords.length === 0 ? (
        <div className="no-data">
          <p>No hay citas ingresadas hoy</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Folio Develab</th>
                <th>Progreso</th>
                <th>Toma Muestra</th>
                <th>Recepción</th>
                <th>Elisa</th>
                <th>WB</th>
                <th>Validación</th>
                <th>Liberación</th>
                <th>Western Blot</th>
                <th>Elisa</th>
                <th>Interpretación</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => {
                const progress = calculateProgress(record);
                const interpret = record.interpretacionPreventix || calculateInterpretation(
                  parseFloat(record.resultadoWesternBlot),
                  parseFloat(record.resultadoElisa)
                );
                return (
                  <tr key={record._id}>
                    <td>{record.folioDevelab}</td>
                    <td>
                      <div className="progress-wrapper">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                        <span className="progress-text">{`${progress}%`}</span>
                      </div>
                    </td>
                    <td>{renderStatus(record.estatusTomaMuestra)}</td>
                    <td>{renderStatus(record.estatusRecepcion)}</td>
                    <td>{renderStatus(record.estatusELisa)}</td>
                    <td>{renderStatus(record.estatusWB)}</td>
                    <td>{renderStatus(record.estatusValidacion)}</td>
                    <td>{renderStatus(record.estatusLiberacion)}</td>
                    <td>{record.resultadoWesternBlot}</td>
                    <td>{record.resultadoElisa}</td>
                    <td>{interpret}</td>
                    <td>
                      <button
                        className="calc-button"
                        onClick={() => handleCalcInterpretation(record)}
                      >
                        Calcular
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default EstatusPreventixDashboard;
