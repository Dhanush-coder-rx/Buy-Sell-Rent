import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "./App";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState(""); // Added state for name
  const [usertype, setUsertype] = useState(""); // State to store usertype (User or Lender)
  const [aadharPhoto, setAadharPhoto] = useState(null);
  const [panCardPhoto, setPanCardPhoto] = useState(null);
  const navigate = useNavigate();

  // Handle registration
  async function handleRegister(e) {
    e.preventDefault();
  
    // Basic validation
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Mobile number must be exactly 10 digits.");
      return;
    }
  
    if (!usertype) {
      toast.error("Please select a usertype.");
      return;
    }
  
    // Build form data
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("mobile", mobile);
    formData.append("name", name);
    if (aadharPhoto) formData.append("aadharPhoto", aadharPhoto);
    if (panCardPhoto) formData.append("panCardPhoto", panCardPhoto);
  
    // Determine API URL
    let registerUrl = "";
    if (usertype === "Buyer") {
      registerUrl = `${baseUrl}/api/buyer/register/`;
    } else if (usertype === "Seller") {
      registerUrl = `${baseUrl}/api/seller/register/`;
    }
  
    // Submit data
    try {
      await axios.post(registerUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      toast.success("Registration successful! You can now login.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      console.error("Registration error:", error);
  
      // Display error messages from backend
      if (error.response && error.response.data) {
        const errors = error.response.data;
        for (const key in errors) {
          const message = Array.isArray(errors[key])
            ? errors[key].join(", ")
            : errors[key];
          toast.error(`${key}: ${message}`);
        }
      } else {
        toast.error("Failed to register. Please try again.");
      }
    }
  }
  
  

  return (
    <div className="bg-image">
      <div className="w-50 card mx-auto p-4">
        <h2 className="text-center">Register</h2>
        <form onSubmit={handleRegister}>
          {/* Usertype dropdown */}
          <select
            className="form-select mb-3"
            value={usertype}
            onChange={(e) => setUsertype(e.target.value)}
            required
          >
            <option value="">-----Select Usertype------</option>
            <option value="Buyer">Buyer</option>
            <option value="Seller">Seller</option>
          </select>

          {/* Name input */}
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Email input */}
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password input */}
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Mobile number input */}
          <input
            type="tel"
            className="form-control mb-3"
            placeholder="Enter your mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />

<div className="mb-3 d-flex flex-column align-items-start">
  <label className="form-label">Aadhar Photo</label>
  <input
    type="file"
    className="form-control"
    onChange={(e) => setAadharPhoto(e.target.files[0])}
    required
  />
</div>

<div className="mb-3 d-flex flex-column align-items-start">
  <label className="form-label">PAN Card Photo</label>
  <input
    type="file"
    className="form-control"
    onChange={(e) => setPanCardPhoto(e.target.files[0])}
    required
  />
</div>



          {/* Submit button */}
          <div>
            <button type="submit" className="btn btn-primary mt-4">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
