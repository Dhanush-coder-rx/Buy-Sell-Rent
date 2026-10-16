import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FaRegAddressCard ,  FaLock, FaSignOutAlt } from 'react-icons/fa';
import { FaUsers } from "react-icons/fa";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard-container">
      <div className="sidebar">
        <h3 className="orange-text">Admin Dashboard</h3>
        <nav className="navbar">
          <ul>
            <li>
              <Link to="ManageUsers" className="nav-link">
                <FaUsers  className="nav-icon" /> Manage User
              </Link>
            </li>
            <li>
              <Link to="VerifyProperty" className="nav-link">
                <FaRegAddressCard className="nav-icon" /> Verify Property
              </Link>
            </li>
            <li>
              <Link to="UpdatedPasswordForAdmin" className="nav-link"> 
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
