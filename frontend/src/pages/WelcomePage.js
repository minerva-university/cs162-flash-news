import React from "react";
import { Button, Typography, Box, Paper, keyframes } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Flash animation using keyframes
const flashAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#FCF8EC",
        padding: "2rem",
      }}
    >
      {/* Centered Container Box */}
      <Paper
        elevation={6}
        sx={{
          padding: "3rem",
          borderRadius: "16px",
          backgroundColor: "white",
          maxWidth: "600px",
          minHeight: "400px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            marginBottom: "1.5rem",
            fontWeight: 700,
            color: "#5F848C",
            animation: `${flashAnimation} 2s ease-in-out infinite`, // Apply flash animation
          }}
        >
          Welcome to Flash News
        </Typography>
        <Typography
          variant="h6"
          sx={{
            marginBottom: "2rem",
            color: "gray",
            fontSize: "1rem",
          }}
        >
          Your one-stop destination for sharing and exploring the latest news!
        </Typography>
        <Box sx={{ display: "flex", gap: "1.5rem", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              padding: "0.75rem 3rem",
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
            }}
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              padding: "0.75rem 3rem",
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              borderWidth: "2px",
            }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default WelcomePage;
