import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../App";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function VerifyProperty() {
  const [properties, setProperties] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = () => {
    axios
      .get(`${baseUrl}/api/admin/unverified-properties/`)
      .then((response) => {
        setProperties(response.data.properties);
      })
      .catch((error) => {
        console.error("Error fetching properties:", error);
        toast.error("Failed to load properties.");
      });
  };

  const fetchPapers = (propertyId) => {
    axios
      .get(`${baseUrl}/api/admin/get-papers/${propertyId}`)
      .then((response) => {
        setPapers(response.data.papers);
        setSelectedProperty(propertyId);
      })
      .catch((error) => {
        console.error("Error fetching papers:", error);
        toast.error("Failed to load property papers.");
      });
  };

  const approveProperty = (propertyId) => {
    axios
      .patch(`${baseUrl}/api/admin/approve-property/${propertyId}/`)
      .then(() => {
        toast.success("Property approved successfully!");
        fetchProperties(); // Refresh the property list
      })
      .catch((error) => {
        console.error("Error approving property:", error);
        toast.error("Failed to approve property.");
      });
  };

  const getImageUrl = (imagePath) => {
    return imagePath ? `${baseUrl}${imagePath}` : "";
  };

  return (
    <div className="container p-4">
      <h1 className="text-center mb-4 text-white" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" }}>
        Unverified Properties
      </h1>

      {properties.length === 0 ? (
        <p className="text-center text-white" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" }}>
          No unverified properties found.
        </p>
      ) : (
        <div className="row g-4">
          {properties.map((property) => (
            <div key={property.id} className="col-md-4">
              <div className="card shadow-lg">
                <img
                  src={getImageUrl(property.propertyPhoto)}
                  alt={property.propertyName}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body text-start">
                  <h4 className="card-title fw-bold">{property.propertyName}</h4>
                  <p className="mb-1"><strong>Seller:</strong> {property.sellerName}</p>
                  <p className="mb-1"><strong>PropertyType:</strong> {property.propertyTypeName}</p>
                  <p className="mb-1"><strong>City:</strong> {property.city}</p>
                  <p className="mb-1"><strong>Dimension:</strong> {property.dimension}</p>
                  <p className="mb-1"><strong>Price:</strong> ₹{property.price}</p>
                  <p className="mb-1"><strong>Contact:</strong> {property.contactDetails}</p>
                  <p className="mb-3"><strong>Description:</strong> {property.description}</p>

                  <button
                    className="btn btn-success w-100 mb-2"
                    onClick={() => approveProperty(property.id)}
                  >
                    Approve Property
                  </button>
                  <button
                    className="btn btn-primary w-100"
                    data-bs-toggle="modal"
                    data-bs-target="#papersModal"
                    onClick={() => fetchPapers(property.id)}
                  >
                    View Papers
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Viewing Papers */}
      <div className="modal fade" id="papersModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Property Papers</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body text-center">
              {papers.length === 0 ? (
                <p>No papers available for this property.</p>
              ) : (
                <div className="d-flex flex-wrap justify-content-center">
                  {papers.map((paper) => (
                    <img
                      key={paper.id}
                      src={getImageUrl(paper.image)}
                      alt={`Paper ${paper.id}`}
                      className="m-2 border rounded"
                      style={{ width: "500px", height: "auto" }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
