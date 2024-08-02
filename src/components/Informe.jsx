import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import * as XLSX from 'xlsx';

const Informe = () => {
  const [statusCounts, setStatusCounts] = useState([]);
  const [locationCounts, setLocationCounts] = useState([]);
  const [clientLocationCounts, setClientLocationCounts] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/v1/Informees');
        const { statusCounts, locationCounts, clientLocationCounts, trendData } = response.data;
        setStatusCounts(statusCounts);
        setLocationCounts(locationCounts);
        setClientLocationCounts(clientLocationCounts);
        setTrendData(trendData);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  const handleDownload = (data, filename) => {
    if (!data || !data.length) {
      alert('Data format is incorrect. Cannot export.');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename);
  };

  const handleClientChange = (e) => {
    const selected = e.target.value;
    setSelectedClient(selected);
    if (selected === '') {
      setFilteredData([]);
    } else {
      const filtered = clientLocationCounts.filter(item => item.client === selected);
      setFilteredData(filtered);
    }
  };

  return (
    <div className="dashboard-client">
      <h1>Commercial Dashboard</h1>
      <div className="charts-container">
        <div className="chart">
          <h2>Total Samples by Location</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={locationCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h2>Sample Status Distribution</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={statusCounts}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#82ca9d"
                label
              >
                {
                  statusCounts && statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))
                }
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h2>Sample Trends Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h2>Sample Locations by Client</h2>
          <select value={selectedClient} onChange={handleClientChange}>
            <option value="">All Clients</option>
            {clientLocationCounts && clientLocationCounts.map((item, index) => (
              <option key={index} value={item.client}>{item.client}</option>
            ))}
          </select>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredData.length ? filteredData : clientLocationCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="download-section">
          <button onClick={() => handleDownload(statusCounts, 'StatusCounts.xlsx')}>Download Status Counts</button>
          <button onClick={() => handleDownload(locationCounts, 'LocationCounts.xlsx')}>Download Location Counts</button>
          <button onClick={() => handleDownload(filteredData.length ? filteredData : clientLocationCounts, 'ClientLocationCounts.xlsx')}>Download Client Location Counts</button>
        </div>
      </div>
    </div>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default Informe;
