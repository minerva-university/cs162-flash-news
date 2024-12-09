import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Snackbar,
  Alert,
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, agreeToTerms } = formData;

    if (!agreeToTerms) {
      setSnackbar({
        open: true,
        message: "You must agree to the Terms and Conditions.",
        severity: "error",
      });
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }

      setSnackbar({
        open: true,
        message: "Signup successful! You are being redirected to your feed.",
        severity: "success",
      });

      // Delay navigation to allow Snackbar to display
      setTimeout(() => {
        navigate("/feed");
      }, 3000); // Redirect after 3 seconds

      setFormData({
        name: "",
        email: "",
        password: "",
        agreeToTerms: false,
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Signup failed: ${error.message}`,
        severity: "error",
      });
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={10000} // Lasts 10 seconds
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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
        <Typography
          variant="body2"
          align="center"
          sx={{ marginTop: "1rem", cursor: "pointer" }}
          onClick={() => navigate("/login")} // Navigate to the login page
        >
          Already have an account? Log in here.
        </Typography>
      </Box>
    </Box>
  );
}

export default SignupPage;
