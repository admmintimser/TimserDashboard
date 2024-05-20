import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const Informe = () => {
  const { isAuthenticated, authToken } = useContext(Context);
  const [data, setData] = useState({
    processingStats: {},
    ageDistribution: [],
    areaTypeDistribution: [],
    educationLevelDistribution: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }
      try {
        const result = await axios.get("https://webapitimser.azurewebsites.net/api/v1/data-for-dashboard", {
          withCredentials: true,
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        });
        if (result.data.success) {
          setData({
            processingStats: result.data.data.processingStats,
            ageDistribution: result.data.data.ageDistribution.map(item => ({ name: `${item._id} años`, count: item.count })),
            areaTypeDistribution: result.data.data.areaTypeDistribution.map(item => ({ name: item._id, count: item.count })),
            educationLevelDistribution: result.data.data.educationLevelDistribution.map(item => ({ name: item._id, count: item.count }))
          });
        } else {
          throw new Error("Data structure from API is incorrect or missing data");
        }
      } catch (error) {
        console.error("Error fetching data", error);
        toast.error(`Error: ${error.response?.data?.message || "Failed to fetch data"}`);
      }
    };
    fetchData();
  }, [authToken]); // Include authToken in the dependencies

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="page analytics-page">
      <h1>Análisis</h1>
      <div className="dashboard-cards">
        {Object.entries(data.processingStats)
          .filter(([key, _]) => key !== '_id') // Exclude '_id' from processing stats
          .map(([key, value]) => (
            <div key={key} className="dashboard-card">
              <h2>{key.replace(/([A-Z])/g, ' $1').trim().replace("Count", " Count")}</h2>
              <p>{value}</p>
            </div>
        ))}
      </div>

      <div className="charts-grid">
        {data.ageDistribution.length > 0 && (
          <ResponsiveContainer width="33%" height={300}>
            <BarChart data={data.ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Age Distribution" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {data.areaTypeDistribution.length > 0 && (
          <ResponsiveContainer width="33%" height={300}>
            <PieChart>
              <Pie dataKey="count" data={data.areaTypeDistribution} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {data.areaTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}

        {data.educationLevelDistribution.length > 0 && (
          <ResponsiveContainer width="33%" height={300}>
            <PieChart>
              <Pie dataKey="count" data={data.educationLevelDistribution} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {data.educationLevelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Informe;
