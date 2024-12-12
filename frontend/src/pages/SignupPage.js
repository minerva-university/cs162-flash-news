import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const DB_HOST = "http://127.0.0.1:5000/api";
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
      const response = await fetch(`${DB_HOST}/register`, {
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

      // Store the tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("profile_picture", data.profile_picture || "");

      setSnackbar({
        open: true,
        message: "Signup successful! You are being redirected to your settings page.",
        severity: "success",
      });

      // Delay navigation to allow Snackbar to display
      setTimeout(() => {
        navigate("/settings/" + data.username);
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
        backgroundColor: "#FCF8EC",
        padding: "2rem",
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

      <Paper
        elevation={6}
        sx={{
          maxWidth: "500px",
          width: "100%",
          padding: "2.5rem",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
          backgroundColor: "white",
        }}
      >
        <Typography
          variant="h4"
          sx={{ marginBottom: "1.5rem", fontWeight: 700, color: "#5F848C" }}
        >
          Sign Up
        </Typography>
        <Typography
          variant="body1"
          sx={{ marginBottom: "2rem", color: "gray" }}
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
            sx={{ marginBottom: "1.5rem" }}
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
            sx={{ marginBottom: "1.5rem" }}
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
            sx={{ marginBottom: "1.5rem" }}
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
            sx={{ marginBottom: "2rem" }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginBottom: "1rem", padding: "0.75rem", fontWeight: 600 }}
          >
            Sign Up
          </Button>
        </Box>
        <Typography
          variant="body2"
          align="center"
          sx={{
            marginTop: "1rem",
            cursor: "pointer",
            textDecoration: "underline",
            color: "#5F848C",
          }}
          onClick={() => navigate("/login")} // Navigate to the login page
        >
          Already have an account? Log in here.
        </Typography>
      </Paper>
    </Box>
  );
}

export default SignupPage;
