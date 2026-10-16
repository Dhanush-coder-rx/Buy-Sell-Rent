import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl } from "./App";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './Login.css'; // Import the CSS file

export default function Login() {
  const [usertype, setUsertype] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

 
 // Handle login submission
 async function handleLogin(e) {
    e.preventDefault();
  
    // Validate that usertype is selected
    if (!usertype) {
      toast.error("Please select a usertype.");
      return;
    }
  
    // Create FormData object
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
  
    let apiUrl = "";
  
    if (usertype === "Admin") {
      apiUrl = baseUrl + "/api/admin/login/";
    } else if (usertype === "Seller") {
      apiUrl = baseUrl + "/api/seller/login/";
    } else if (usertype === "Buyer") {
      apiUrl = baseUrl + "/api/buyer/login/";
    }
  
    try {
      // Axios POST request with multipart/form-data
      const res = await axios.post(apiUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // Store email in session storage
      sessionStorage.setItem("email", email);
  
      // Redirect based on user type
      if (usertype === "Admin") {
        toast.success("Login successful as Admin");
        navigate("/adminDashboard");
      } else if (usertype === "Seller") {
        toast.success("Login successful as Seller");
        navigate("/sellerDashboard");
      } else if (usertype === "Buyer") {
        toast.success("Login successful as Buyer");
        navigate("/buyerDashboard");
      }
    } catch (error) {
        if (error.response) {
          console.error("Server error:", error.response.status, error.response.data);
      
          const errorMessage = error.response.data?.error || "Login failed: Unauthorized";
          toast.error(errorMessage);  // This will show "Your account is blocked. Contact support."
        } else if (error.request) {
          console.error("No response received:", error.request);
          toast.error("Login failed: No response from server");
        } else {
          console.error("Error:", error.message);
          toast.error("Login failed: " + error.message);
        }
      }
    }      

  return (
    <div className="bg-image">
      <div className="w-50 card mx-auto p-4">
        <h2 className="text-center">Login</h2>
        <form onSubmit={handleLogin}>
          {/* Usertype dropdown */}
          <select
            className="text-center form-select my-3"
            value={usertype}
            onChange={(e) => setUsertype(e.target.value)}
          >
            <option value="">-----Select Usertype------</option>
            <option value="Buyer">Buyer</option>
            <option value="Seller">Seller</option>
            <option value="Admin">Admin</option>
          </select>

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

          {/* Registration link */}
          <Link to="/reg" className="d-block mb-3">
            Don't have an account? Click here to Register
          </Link>

          {/* Submit button */}
          <div>
            <button type="submit" className="btn btn-primary mt-4">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
