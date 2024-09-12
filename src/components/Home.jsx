import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import './home.css';

// Registrando los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Home = () => {
  const [riesgoWB, setRiesgoWB] = useState({ conRiesgo: 0, sinRiesgo: 0 });
  const [riesgoElisa, setRiesgoElisa] = useState({ conRiesgo: 0, sinRiesgo: 0 });
  const [tecnicosWB, setTecnicosWB] = useState({});
  const [tecnicosElisa, setTecnicosElisa] = useState({});
  const [ubicaciones, setUbicaciones] = useState({});
  const [procesamientoPromedio, setProcesamientoPromedio] = useState(0);
  const [muestrasEstado, setMuestrasEstado] = useState({ pendientes: 0, validadas: 0, liberadas: 0 });
  const [muestrasRechazadas, setMuestrasRechazadas] = useState(0);
  const [muestrasObjetivo, setMuestrasObjetivo] = useState(0); // Procesadas en tiempo objetivo
  const [estadoMuestras, setEstadoMuestras] = useState({}); // Estado de las muestras

  // Función para contar los días hábiles entre dos fechas
  const getBusinessDays = (startDate, endDate) => {
    let count = 0;
    let currentDate = moment(startDate);

    while (currentDate.isBefore(endDate)) {
      const dayOfWeek = currentDate.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Domingo, 6 = Sábado
        count++;
      }
      currentDate.add(1, 'days');
    }
    return count;
  };

  // Función para mapear y contar los estados de las muestras
  const mapearEstadoMuestras = (preventix) => {
    const estadoCount = {};
    
    preventix.forEach(p => {
      const estado = p.estatusMuestra || "Desconocido";
      estadoCount[estado] = (estadoCount[estado] || 0) + 1;
    });

    return estadoCount;
  };

  useEffect(() => {
    const fetchPreventixData = async () => {
      try {
        const { data: preventixData } = await axios.get('https://webapitimser.azurewebsites.net/api/v1/preventix/getall', { withCredentials: true });
        const preventix = preventixData.preventix;

        // Calcular el tiempo promedio de procesamiento en días hábiles
        const tiemposProcesamiento = preventix
          .filter(p => p.tiempoFinProceso && p.tiempoInicioProceso)
          .map(p => getBusinessDays(p.tiempoInicioProceso, p.tiempoFinProceso));

        const promedioProcesamiento = tiemposProcesamiento.reduce((a, b) => a + b, 0) / tiemposProcesamiento.length || 0;
        setProcesamientoPromedio(promedioProcesamiento.toFixed(2));

        // Estado de las muestras (pendientes, validadas, liberadas)
        const pendientes = preventix.filter(p => p.estatusValidacion === false && p.estatusLiberacion === false).length;
        const validadas = preventix.filter(p => p.estatusValidacion === true).length;
        const liberadas = preventix.filter(p => p.estatusLiberacion === true).length;
        setMuestrasEstado({ pendientes, validadas, liberadas });
        
        const wbConRiesgo = preventix.filter(p => parseFloat(p.resultadoWesternBlot) >= 1.34).length;
        const wbSinRiesgo = preventix.filter(p => parseFloat(p.resultadoWesternBlot) < 1.34).length;
        setRiesgoWB({ conRiesgo: wbConRiesgo, sinRiesgo: wbSinRiesgo });

        const elisaConRiesgo = preventix.filter(p => parseFloat(p.resultadoElisa) >= 37.5).length;
        const elisaSinRiesgo = preventix.filter(p => parseFloat(p.resultadoElisa) < 37.5).length;
        setRiesgoElisa({ conRiesgo: elisaConRiesgo, sinRiesgo: elisaSinRiesgo });

        // Muestras rechazadas
        const rechazadas = preventix.filter(p => ["Lipémica +++", "Hemolizada +++", "Ictericia +++"].includes(p.estatusMuestra)).length;
        setMuestrasRechazadas(rechazadas);

        // Muestras procesadas en tiempo objetivo (<= 72 horas de procesamiento)
        const muestrasObjetivo = tiemposProcesamiento.filter(t => t <= 15).length; // 15 días hábiles
        setMuestrasObjetivo(muestrasObjetivo);

        // Mapear la productividad de los técnicos
        const tecnicoWBCount = {};
        const tecnicoElisaCount = {};

        preventix.forEach(p => {
          const tecnicoWB = p.tecnicoWB || "Desconocido";
          tecnicoWBCount[tecnicoWB] = (tecnicoWBCount[tecnicoWB] || 0) + 1;

          const tecnicoElisa = p.lavoElisa || "Desconocido";
          tecnicoElisaCount[tecnicoElisa] = (tecnicoElisaCount[tecnicoElisa] || 0) + 1;
        });

        setTecnicosWB(tecnicoWBCount);
        setTecnicosElisa(tecnicoElisaCount);

        // Mapeo de estados de muestra
        const estadoCount = mapearEstadoMuestras(preventix);
        setEstadoMuestras(estadoCount);

        // Ubicaciones de toma de muestra
        const locationsCount = {};
        preventix.forEach(p => {
          const location = p.appointmentId?.sampleLocation || "Desconocido";
          locationsCount[location] = (locationsCount[location] || 0) + 1;
        });
        setUbicaciones(locationsCount);

      } catch (error) {
        console.error("Error al obtener datos de Preventix:", error);
      }
    };

    fetchPreventixData();
  }, []);

  // Datos para gráficos
  const riesgoBarData = {
    labels: ['Western Blot', 'Elisa'],
    datasets: [
      {
        label: 'Con Riesgo',
        data: [riesgoWB.conRiesgo, riesgoElisa.conRiesgo],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Sin Riesgo',
        data: [riesgoWB.sinRiesgo, riesgoElisa.sinRiesgo],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const tecnicosWBData = {
    labels: Object.keys(tecnicosWB),
    datasets: [
      {
        label: 'Técnicos WB',
        data: Object.values(tecnicosWB),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const tecnicosElisaData = {
    labels: Object.keys(tecnicosElisa),
    datasets: [
      {
        label: 'Técnicos Elisa',
        data: Object.values(tecnicosElisa),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: Object.keys(ubicaciones),
    datasets: [
      {
        label: 'Ubicaciones',
        data: Object.values(ubicaciones),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-header">Dashboard Preventix</h1>

      <div className="dashboard-cards">
  
        {/* Tarjeta: Tiempo Promedio de Procesamiento */}
        <div className="dashboard-card-home">
          <h2>Tiempo Promedio de Procesamiento</h2>
          <p>{procesamientoPromedio} días hábiles</p>
        </div>

        {/* Tarjeta: Estado de Muestras */}
        <div className="dashboard-card-home">
          <h2>Estado de las Muestras</h2>
          <p>Pendientes: {muestrasEstado.pendientes}</p>
          <p>Validadas: {muestrasEstado.validadas}</p>
          <p>Liberadas: {muestrasEstado.liberadas}</p>
          <p>Muestras Rechazadas: {muestrasRechazadas}</p>
        </div>

        {/* Tarjeta: Muestras en Tiempo Objetivo */}
        <div className="dashboard-card-home">
          <h2>Muestras Procesadas en Tiempo Objetivo (15 días hábiles)</h2>
          <p>{muestrasObjetivo}</p>
        </div>

        {/* Gráfica: Estatus de Riesgo */}
        <div className="dashboard-card-home">
          <h2>Estatus de Riesgo (Western Blot y Elisa)</h2>
          <Bar
            data={riesgoBarData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Riesgo por Resultado (Con/Sin Riesgo)' }
              }
            }}
          />
        </div>

        {/* Gráfica: Productividad Técnicos WB */}
        <div className="dashboard-card-home">
          <h2>Productividad Técnicos Western Blot</h2>
          <Bar
            data={tecnicosWBData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Técnicos Western Blot' }
              }
            }}
          />
        </div>

        {/* Gráfica: Productividad Técnicos Elisa */}
        <div className="dashboard-card-home">
          <h2>Productividad Técnicos Elisa</h2>
          <Bar
            data={tecnicosElisaData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Técnicos Elisa' }
              }
            }}
          />
        </div>

        {/* Gráfica: Ubicaciones de Toma de Muestra */}
        <div className="dashboard-card-home">
          <h2>Ubicaciones de Toma de Muestra</h2>
          <Doughnut data={doughnutData} />
        </div>

        {/* Tabla: Conteo por Estado de Muestras */}
        <div className="dashboard-card-home">
          <h2>Conteo por Estado de Muestras</h2>
          <table>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(estadoMuestras).map(([estado, count]) => (
                <tr key={estado}>
                  <td>{estado}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
