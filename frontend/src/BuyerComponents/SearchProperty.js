import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { baseUrl } from "../App";

const SearchProperty = () => {
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [city, setCity] = useState("");
    const [properties, setProperties] = useState([]);
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatMessage, setChatMessage] = useState("");
    const [selectedProperty, setSelectedProperty] = useState(null);

    useEffect(() => {
        fetchPropertyTypes();
    }, []);

    const fetchPropertyTypes = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/seller/property-types/`);
            setPropertyTypes(response.data);
        } catch (error) {
            console.error("Error fetching property types:", error);
            toast.error("Failed to load property types.");
        }
    };

    useEffect(() => {
        if (city.length > 2 && selectedType) {
            fetchProperties();
        }
    }, [city, selectedType]);

    const fetchProperties = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/buyer/search-property/${city}/${selectedType}/`);
            setProperties(response.data.properties || []);
        } catch (error) {
            console.error("Error fetching properties:", error);
            toast.error("Failed to fetch properties.");
        }
    };

    const openChatModal = (property) => {
        setSelectedProperty(property);
        setShowChatModal(true);
    };

    const closeChatModal = () => {
        setShowChatModal(false);
        setChatMessage("");
        setSelectedProperty(null);
    };

    const sendChatMessage = async () => {
      if (!chatMessage.trim()) {
          toast.error("Message cannot be empty.");
          return;
      }
  
      // Retrieve email from sessionStorage
      const buyerEmail = sessionStorage.getItem("email"); 
  
      if (!buyerEmail) {
          toast.error("User not authenticated.");
          return;
      }
  
      try {
          const response = await axios.post(`${baseUrl}/api/buyer/chats/`, {
              b_chat: chatMessage,
              buyer_email: buyerEmail,  // Sending email instead of ID
              property: selectedProperty.id,
          });
  
          toast.success("Message sent successfully!");
          closeChatModal();
      } catch (error) {
          console.error("Error sending message:", error);
          toast.error("Failed to send message.");
      }
  };
  

    return (
        <div className="container mt-4">
            <div className="card shadow-lg border-light">
    <div className="card-body" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
        <h2 className="mb-4 text-center text-dark p-3 border border-light rounded shadow-lg" 
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
            Search Property
        </h2>

        <ToastContainer />

        {/* Search Filters */}
        <div className="row mb-3">
            <div className="col-md-6">
                <label className="form-label px-3 py-2 border  rounded shadow-sm" 
                    style={{ backgroundColor: "white", color: "black", textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)", display: "inline-block" }}>
                    <h3 className="m-0">City</h3>
                </label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter city name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
            </div>

            <div className="col-md-6">
                <label className="form-label px-3 py-2 border rounded shadow-sm" 
                    style={{ backgroundColor: "white", color: "black", textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)", display: "inline-block" }}>
                    <h3 className="m-0">Property Type</h3>
                </label>
                <select className="form-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    <option value="">Select Property Type</option>
                    {propertyTypes.map((type) => (
                        <option key={type.id} value={type.propertyTypeName}>
                            {type.propertyTypeName}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    </div>
</div>


            {/* Display Properties */}
            <div className="row mt-3">
                {properties.length === 0 ? (
                    <p className="text-center" style={{ color: "white" }}>No properties found.</p>
                ) : (
                    properties.map((property) => (
                        <div key={property.id} className="col-md-4 mb-3">
                            <div className="card shadow-sm">
                                <img
                                    src={`${baseUrl}${property.propertyPhoto}`}
                                    className="card-img-top"
                                    alt="Property"
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{property.propertyName}</h5>
                                    <p className="text-muted">{property.city}</p>
                                    <p><strong>Seller:</strong> {property.sellerName}</p>
                                    <p><strong>Price:</strong> ₹{property.price}</p>
                                    <p className="card-text">
  Location: <a href={property.location} target="_blank" rel="noopener noreferrer">View on Map</a>
</p>
                                    <p><strong>Dimension:</strong> {property.dimension}</p>
                                    <button className="btn btn-primary w-100" onClick={() => openChatModal(property)}>
                                        Chat with Seller
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat Modal */}
            {showChatModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chat with Seller</h5>
                                
                            </div>
                            <div className="modal-body">
                                <p><strong>Property:</strong> {selectedProperty.propertyName}</p>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Type your message here..."
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeChatModal}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={sendChatMessage}>Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchProperty;
