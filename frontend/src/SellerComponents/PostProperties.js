import React, { useState, useEffect, useRef} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "../App"; 

export default function PostProperties() {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [properties, setProperties] = useState([]); // State to store properties
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [isEditMode, setIsEditMode] = useState(false);
const [editingPropertyId, setEditingPropertyId] = useState(null);

  const [formData, setFormData] = useState({
    city: "",
    propertyName: "",
    propertyPhoto: null,
    dimension: "",
    price: "",
    contactDetails: "",
    description: "",
    location:"",
    propertyType: "",
  });

  const email = sessionStorage.getItem("email"); // Get email from sessionStorage
  console.log("Email from sessionStorage:", email);



  useEffect(() => {
    // Fetch property types
    axios
      .get(`${baseUrl}/api/seller/property-types/`)
      .then((response) => setPropertyTypes(response.data))
      .catch((error) => console.error("Error fetching property types:", error));
    
    // Fetch properties of the logged-in seller
    if (email) {
      axios
        .get(`${baseUrl}/api/seller/properties/?email=${email}`)
        .then((response) => {
          console.log("User Properties:", response.data);
          setProperties(response.data.properties);
        })
        .catch((error) => console.error("Error fetching properties:", error));
    }
  }, [email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, propertyPhoto: e.target.files[0] });
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
  
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });
  
    data.append("seller", email);
  
    const endpoint = isEditMode
      ? `${baseUrl}/api/seller/update-property/${editingPropertyId}/`
      : `${baseUrl}/api/seller/post-property/`;
  
    const method = isEditMode ? "patch" : "post";
    console.log("Sending data:", [...data.entries()]);

  
    axios({
      method: method,
      url: endpoint,
      data: data,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => {
        toast.success(
          isEditMode ? "Property updated successfully!" : "Property posted successfully!"
        );
  
        setFormData({
          city: "",
          propertyName: "",
          propertyPhoto: null,
          dimension: "",
          price: "",
          contactDetails: "",
          description: "",
          location: "",
          propertyType: "",
        });
  
        setIsEditMode(false);
        setEditingPropertyId(null);
  
        axios
          .get(`${baseUrl}/api/seller/properties/?email=${email}`)
          .then((response) => setProperties(response.data.properties))
          .catch((error) => console.error("Error fetching updated properties:", error));
      })
      .catch((error) => {
        console.error("Error saving property:", error);
        toast.error("Failed to save property.");
      });
  };
  

  const handleEdit = (property) => {
    setFormData({
      city: property.city,
      propertyName: property.propertyName,
      propertyPhoto: null, // you can’t prefill a file input
      dimension: property.dimension,
      price: property.price,
      contactDetails: property.contactDetails,
      description: property.description,
      location: property.location,
      propertyType: property.propertyType, // or property.propertyType.id depending on your backend
    });
    setEditingPropertyId(property.id);
    setIsEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: scroll to form
  };
  

  const handleFileChangee = (e) => {
    const file = e.target.files[0];
    if (e.target.name === "propertyPhoto") {
      setFormData({ ...formData, propertyPhoto: file });
    } else {
      setSelectedFile(file);
    }
  };
  

  const handleUpload = (propertyId) => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("property", propertyId);

    axios
      .post(`http://127.0.0.1:8000/api/admin/upload-documents/${propertyId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        toast.success("Document uploaded successfully!");

        // ✅ Clear file selection after successful upload
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset input field
        }
      })
      .catch((error) => {
        console.error("Error uploading document:", error.response?.data || error);
        toast.error("Failed to upload document.");
      });
  };
  
  

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <h2 className="mb-4">Post a Property</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">City</label>
            <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Property Type</label>
            <select className="form-select" name="propertyType" value={formData.propertyType} onChange={handleChange} required>
              <option value="">Select Property Type</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.propertyTypeName}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Property Name</label>
            <input type="text" className="form-control" name="propertyName" value={formData.propertyName} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Property Photo</label>
            <input type="file" className="form-control" onChange={handleFileChange}  />
          </div>
          <div className="mb-3">
            <label className="form-label">Dimension</label>
            <input type="text" className="form-control" name="dimension" value={formData.dimension} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Price</label>
            <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Contact Details</label>
            <input type="text" className="form-control" name="contactDetails" value={formData.contactDetails} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Location</label>
            <input className="form-control" name="location" value={formData.location} onChange={handleChange} required />
          </div>
         
          <button type="submit" className="btn btn-primary">
  {isEditMode ? "Update Property" : "Post Property"}
</button>

        </form>
        </div>



        {/* Display list of properties */}
        <div className="container mt-4">
      <h1 className="text-center mb-4 text-white " style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" }}>
        Your Properties
      </h1>
      <div className="row">
        {properties.length > 0 ? (
          properties.map((property) => (
            <div key={property.id} className="col-md-4">
              <div className="card shadow-sm mb-4">
                <img
                  src={`${baseUrl}${property.propertyPhoto}`}
                  className="card-img-top"
                  alt={property.propertyName}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{property.propertyName}</h5>
                  <p className="card-text">City: {property.city}</p>
                  <p className="card-text">Dimension: {property.dimension}</p>
                  <p className="card-text">Price: ₹{property.price}</p>
                  <p className="card-text">
  Location: <a href={property.location} target="_blank" rel="noopener noreferrer">View on Map</a>
</p>


                  <p className="card-text">Type: {property.propertyTypeName}</p>
                  <p className="card-text">
                    Status: {property.approve ? "Approved" : "Pending"}
                  </p>
                  
            
                  
                  <input type="file"  ref={fileInputRef}onChange={handleFileChangee} className="form-control mb-2" />
                 
                  <div className="d-flex justify-content-between">
  <button className="btn btn-warning me-2" onClick={() => handleEdit(property)}>
    Edit
  </button>
  <button className="btn btn-primary" onClick={() => handleUpload(property.id)}>
    Upload Papers
  </button>
</div>

            

                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No properties found.</p>
        )}
      </div>
    </div>
    </div>
    
  );
}
