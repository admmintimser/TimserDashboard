import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { isAuthenticated, authToken } = useContext(Context);  // Assuming authToken is part of the context

  useEffect(() => {
    const fetchMessages = async () => {
      if (!authToken) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }
      try {
        const { data } = await axios.get(
          "https://webapitimser.azurewebsites.net/api/v1/message/getall",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
        setMessages(data.messages);
      } catch (error) {
        const errorMsg = error.response ? error.response.data.message : "Failed to fetch messages";
        console.error(errorMsg);
        toast.error(errorMsg);
        setMessages([]);  // Ensure state is cleared on error
      }
    };
    fetchMessages();
  }, [authToken]);  // Include authToken in the dependencies

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="page messages">
      <h1>Messages</h1>
      <div className="banner">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div className="card" key={message._id}>
              <div className="details">
                <p>First Name: <span>{message.firstName}</span></p>
                <p>Last Name: <span>{message.lastName}</span></p>
                <p>Email: <span>{message.email}</span></p>
                <p>Phone: <span>{message.phone}</span></p>
                <p>Message: <span>{message.message}</span></p>
              </div>
            </div>
          ))
        ) : (
          <h2>No Messages Found</h2>  // Changed to H2 for better semantic hierarchy
        )}
      </div>
    </section>
  );
};

export default Messages;
