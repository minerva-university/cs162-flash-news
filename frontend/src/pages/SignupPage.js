import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
} from "@mui/material";
import "../App.css";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, agreeToTerms } = formData;

    // Check if the user has agreed to the terms
    if (!agreeToTerms) {
      alert("You must agree to the Terms and Conditions.");
      return;
    }

    try {
      // Make the API call to register
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name, // Matches the backend field 'username'
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle backend errors
        throw new Error(data.message || "Failed to register");
      }

      // Handle success
      alert("Signup successful! You can now log in.");
      console.log("Signup response:", data);

      // Redirect to login page
      navigate("/login"); // Update this with your login route

      // Optionally reset the form
      setFormData({
        name: "",
        email: "",
        password: "",
        agreeToTerms: false,
      });
    } catch (error) {
      // Display error to the user
      alert(`Signup failed: ${error.message}`);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h4"
          sx={{ textAlign: "center", marginBottom: "1rem" }}
        >
          Sign up
        </Typography>
        <Typography
          variant="body1"
          sx={{ textAlign: "center", marginBottom: "2rem" }}
        >
          Welcome! Please sign up to create your account
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            type="text"
            fullWidth
            variant="outlined"
            margin="normal"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            variant="outlined"
            margin="normal"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            variant="outlined"
            margin="normal"
            value={formData.password}
            onChange={handleChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="agreeToTerms"
                color="primary"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
            }
            label="I agree to the Terms and Conditions"
            sx={{ marginBottom: "1rem" }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginBottom: "1rem" }}
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default SignupPage;
