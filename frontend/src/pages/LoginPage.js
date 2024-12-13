import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { DB_HOST } from "../controllers/config.ts";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // info, success, error, warning
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
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      const response = await fetch(`${DB_HOST}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      // Store the tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("profile_picture", data.profile_picture || "");

      // Display success message
      setSnackbar({
        open: true,
        message: "Login successful! Redirecting...",
        severity: "success",
      });

      // Navigate to a protected page (e.g., dashboard) after a delay
      setTimeout(() => {
        navigate("/feed");
      }, 3000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Login failed: ${error.message}`,
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
          Sign In
        </Typography>
        <Typography
          variant="body1"
          sx={{ marginBottom: "2rem", color: "gray" }}
        >
          Welcome! Please sign in to continue
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
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
                name="remember"
                color="primary"
                checked={formData.remember}
                onChange={handleChange}
              />
            }
            label="Remember me"
            sx={{ marginBottom: "2rem" }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginBottom: "1rem", padding: "0.75rem", fontWeight: 600 }}
          >
            Log In
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
          onClick={() => navigate("/signup")}
        >
          Don't have an account? Sign up here.
        </Typography>
      </Paper>
    </Box>
  );
}

export default LoginPage;
