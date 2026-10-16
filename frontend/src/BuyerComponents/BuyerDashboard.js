import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FaHome, FaCity, FaMapMarkedAlt, FaLock, FaSignOutAlt } from 'react-icons/fa';

export default function BuyerDashboard() {
  return (
    <div className="admin-dashboard-container">
      <div className="sidebar">
        <h3 className="orange-text">Buyer Dashboard</h3>
        <nav className="navbar">
          <ul>
            <li>
              <Link to="SearchProperty" className="nav-link">
                <FaMapMarkedAlt className="nav-icon" />Search Property
              </Link>
            </li>
            <li>
              <Link to="ChatwithSeller" className="nav-link">
                <FaCity className="nav-icon" /> Chat with Seller
              </Link>
            </li>
          
           
            <li>
              <Link to="UpdatedPasswordForBuyer" className="nav-link">
                <FaLock className="nav-icon" /> Update Password
              </Link>
            </li>
            <li>
              <Link to="/" className="nav-link logout">
                <FaSignOutAlt className="nav-icon" /> Logout
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
