import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../App";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function ManageUsers() {
  const [users, setUsers] = useState({ buyers: [], sellers: [] });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    axios
      .get(`${baseUrl}/api/admin/manage-users/`)
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const getImageUrl = (imagePath) => {
    return imagePath ? `${baseUrl}${imagePath}` : ""; // Ensures the URL is valid
  };

  const toggleBlockStatus = (userType, userId, isBlocked) => {
    axios
      .patch(`${baseUrl}/api/admin/manage-users/${userType}/${userId}/`, {
        block: !isBlocked,
      })
      .then(() => {
        setUsers((prevUsers) => {
          const updatedUsers = { ...prevUsers };
          updatedUsers[userType] = updatedUsers[userType].map((user) =>
            user.id === userId ? { ...user, block: !isBlocked } : user
          );
          return updatedUsers;
        });

        toast.success(`User ${isBlocked ? "unblocked" : "blocked"} successfully!`);
      })
      .catch((error) => {
        console.error("Error updating user status:", error);
        toast.error("Failed to update user status.");
      });
  };

  const blockedUsersCount = (type) => users[type].filter((user) => user.block).length;
  const unblockedUsersCount = (type) => users[type].filter((user) => !user.block).length;

  const openModal = (imageUrl, title) => {
    setSelectedImage(imageUrl);
    setModalTitle(title);
  };

  return (
    <div className="container p-4">
      {/* Buttons Section */}
      <div className="d-flex justify-content-center gap-5 mb-4">
        <button
          className="btn btn-primary px-5 py-3 fs-5"
          onClick={() => setSelectedCategory("buyers")}
        >
          Buyers ({unblockedUsersCount("buyers")}) | Blocked ({blockedUsersCount("buyers")})
        </button>
        <button
          className="btn btn-danger px-5 py-3 fs-5"
          onClick={() => setSelectedCategory("sellers")}
        >
          Sellers ({unblockedUsersCount("sellers")}) | Blocked ({blockedUsersCount("sellers")})
        </button>
      </div>

      {/* User Cards Section */}
      {selectedCategory && (
        <div className="row g-4">
          {users[selectedCategory].map((user) => (
            <div key={user.id} className="col-md-4">
              <div className="card shadow-lg">
                <div className="card-body bg-white rounded">
                  <h3 className="card-title fw-bold">{user.name}</h3>
                  <p className="card-text">Email: {user.email}</p>
                  <p className="card-text">Mobile: {user.mobile}</p>
                  <p className="card-text">
                    Aadhar:{" "}
                    <button
                      className="btn btn-link text-primary p-0"
                      data-bs-toggle="modal"
                      data-bs-target="#imageModal"
                      onClick={() => openModal(getImageUrl(user.aadharPhoto), "Aadhar Card")}
                    >
                      View
                    </button>
                  </p>
                  <p className="card-text">
                    PAN:{" "}
                    <button
                      className="btn btn-link text-primary p-0"
                      data-bs-toggle="modal"
                      data-bs-target="#imageModal"
                      onClick={() => openModal(getImageUrl(user.panCardPhoto), "PAN Card")}
                    >
                      View
                    </button>
                  </p>
                  {/* Show Block or Unblock button based on user status */}
                  <button
                    className={`mt-3 btn ${user.block ? "btn-success" : "btn-danger"}`}
                    onClick={() => toggleBlockStatus(selectedCategory, user.id, user.block)}
                  >
                    {user.block ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bootstrap Modal for Image View */}
      <div className="modal fade" id="imageModal" tabIndex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="imageModalLabel">{modalTitle}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body text-center">
              {selectedImage ? (
                <img src={selectedImage} alt="Document" className="img-fluid rounded shadow" />
              ) : (
                <p>No Image Available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
