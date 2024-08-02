// src/components/DashboardClient.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DNA } from 'react-loader-spinner';

const fetchData = async (setData) => {
  try {
    const response = await axios.get('https://webapitimser.azurewebsites.net/api/v1/dashboardclientes');
    setData(response.data);
  } catch (error) {
    toast.error("Error fetching dashboard data: " + error.message);
  }
};

const DashboardClient = () => {
  const [data, setData] = useState(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    fetchData(setData);
  }, []);

  const handleFilter = useCallback(() => {
    if (selectedClient || selectedLocation) {
      const filtered = data.sampleLocationByClientCounts.filter(item => (
        (selectedClient ? item.client === selectedClient : true) &&
        (selectedLocation ? item.location === selectedLocation : true)
      ));
      setFilteredData(filtered);
      setIsFiltered(true);
    } else {
      setFilteredData([]);
      setIsFiltered(false);
    }
  }, [selectedClient, selectedLocation, data]);

  const handleDownload = useCallback(() => {
    const exportData = isFiltered ? filteredData : data.sampleLocationByClientCounts;
    if (!Array.isArray(exportData)) {
      toast.error("Data format is incorrect. Cannot export.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Locations");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "SampleLocationsReport.xlsx");
  }, [filteredData, isFiltered, data]);

  if (!data) {
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

  const { sampleLocationCounts, statusCounts, sampleLocationByClientCounts, sampleLocationByClient } = data;

  const clientSampleCounts = {};
  Object.entries(sampleLocationByClient).forEach(([location, clients]) => {
    clients.forEach(client => {
      if (!clientSampleCounts[client]) {
        clientSampleCounts[client] = 0;
      }
      clientSampleCounts[client] += sampleLocationByClientCounts[location] || 0;
    });
  });

  const uniqueClients = [...new Set(Object.values(sampleLocationByClient).flat())];
  const uniqueLocations = Object.keys(sampleLocationByClient);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Clientes</h1>
      </div>
      <div className="dashboard-cards">
        <div className="card">
          <h2>Sample Locations</h2>
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(sampleLocationCounts).map(([location, count]) => (
                <tr key={location}>
                  <td>{location}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>Status Counts</h2>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>True</th>
                <th>False</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(statusCounts).filter(key => key.endsWith('True')).map(key => (
                <tr key={key}>
                  <td>{key.replace('True', '')}</td>
                  <td>{statusCounts[key]}</td>
                  <td>{statusCounts[key.replace('True', 'False')]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>Sample Locations by Client</h2>
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Total Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(clientSampleCounts).map(([client, count]) => (
                <tr key={client}>
                  <td>{client}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>Interactive Queries</h2>
          <div>
            <label>Client: </label>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
              <option value="">All Clients</option>
              {uniqueClients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Location: </label>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              <option value="">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <button onClick={handleFilter} className="filter-button">Filter</button>
          <button onClick={handleDownload} className="download-button">Download as Excel</button>
        </div>
        {isFiltered && (
          <div className="card">
            <h2>Filtered Results</h2>
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Location</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(({ client, location, count }) => (
                  <tr key={`${client}-${location}`}>
                    <td>{client}</td>
                    <td>{location}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardClient;
