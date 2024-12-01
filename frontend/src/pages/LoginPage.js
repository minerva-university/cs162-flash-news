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

function LoginPage() {
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
          Sign in
        </Typography>
        <Typography
          variant="body1"
          sx={{ textAlign: "center", marginBottom: "2rem" }}
        >
          Welcome! Please sign in to continue
        </Typography>
        <Box component="form">
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
            label="Remember me"
            sx={{ marginBottom: "1rem" }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginBottom: "1rem" }}
          >
            Log In
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<GoogleIcon />}
            fullWidth
            sx={{ marginBottom: "1rem" }}
          >
            Sign in with Google
          </Button>
          <Typography variant="body2" align="center" color="textSecondary">
            <Button variant="text">Forgot password?</Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
