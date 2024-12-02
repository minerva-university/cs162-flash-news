import React from "react";
import {
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import "../App.css";

function SignupPage() {
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
        <Box component="form">
          <TextField
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <FormControlLabel
            control={<Checkbox name="remember" color="primary" />}
            label="I agree to the Terms and Conditions"
            sx={{ marginBottom: "1rem" }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginBottom: "1rem" }}
          >
            Sign Up
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<GoogleIcon />}
            fullWidth
            sx={{ marginBottom: "1rem" }}
          >
            Sign up with Google
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default SignupPage;
