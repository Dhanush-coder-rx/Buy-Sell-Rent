import React, { useState } from "react";
import { Card, Col, Row, Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { baseUrl } from "../App"; // Import baseUrl

const UpdatedPasswordForAdmin = () => {
  const storedEmail = sessionStorage.getItem("email"); // Fetch email from sessionStorage
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.warning("All fields are required!");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }
  
    const requestBody = {
      email: storedEmail,
      oldPassword,
      newPassword,
      confirmPassword,
    };
  
    console.log("Request Body:", requestBody); // Log request body before sending
  
    fetch(`${baseUrl}/api/admin/updatePasswordForAdmin/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })
      .then(async (res) => {
        console.log("Response Status:", res.status); // Log HTTP status
  
        // Try parsing response as JSON
        try {
          const data = await res.json();
          console.log("Response Data:", data); // Log response body
          return data;
        } catch (error) {
          console.error("Failed to parse JSON response:", error);
          return { error: "Invalid response format" };
        }
      })
      .then((data) => {
        if (data.message && data.message.includes("successfully")) {
          toast.success(data.message);
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          toast.error(data.error || "Failed to update password.");
        }
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
        toast.error("Failed to update password!");
      });
  };
  

  return (
    <Row className="justify-content-center">
      <ToastContainer position="top-right" autoClose={3000} />
      <Col md={6}>
        <Card>
          <Card.Body>
            <h5>Update Password</h5>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={storedEmail} disabled />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Old Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" onClick={handleUpdatePassword}>
              Update Password
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default UpdatedPasswordForAdmin;
