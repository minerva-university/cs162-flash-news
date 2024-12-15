import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from "@mui/material";
import { DB_HOST } from "../controllers/config.js";
import UserController from "../controllers/UserController.js";

// TODO: Implement controller functions for updating user details

const SettingsPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    username: "",
    bio_description: "",
    tags: [],
    profile_picture: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [alert, setAlert] = useState({ message: "", severity: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile picture file change
  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await UserController.getCurrentUserDetails(username);

        if (response.status === "success") {
          setUserData({
            username: response.data.username,
            bio_description: response.data.bio_description || "",
            tags: response.data.tags || [],
            profile_picture: response.data.profile_picture,
            id: response.data.user_id,
          });
        } else {
          setSnackbar({
            open: true,
            message: "Failed to fetch user data",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch user data: " + error.message,
          severity: "error",
        });
      }
    };

    fetchUserData();
  }, [username]);

  // Save all changes
  // TODO: Change to use UserController.updateUserDetails (was not working)
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("access_token");

      // Validate username is not empty
      if (!userData.username.trim()) {
        setAlert({ message: "Username is mandatory", severity: "error" });
        setSaving(false);
        return;
      }

      // Prepare the form data for profile picture upload
      const formData = new FormData();
      formData.append("username", userData.username);
      formData.append("bio_description", userData.bio_description || "");
      formData.append("tags", JSON.stringify(userData.tags));
      if (profilePicture) {
        formData.append("profile_picture", profilePicture);
      }

      const response = await fetch(`${DB_HOST}/user/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.message === "Username already exists") {
          throw new Error(
            "The username is already taken. Please choose another.",
          );
        } else {
          throw new Error("Failed to save changes.");
        }
      }

      // Update localStorage with the new username and profile picture
      localStorage.setItem("username", responseData.data.username);
      localStorage.setItem("profile_picture", responseData.data.profile_picture);

      // Update userData state with the returned data
      setUserData((prevState) => ({
        ...prevState,
        username: responseData.data.username,
        bio_description: responseData.data.bio_description,
        tags: responseData.data.tags,
        profile_picture: responseData.data.profile_picture,
      }));

      setAlert({ message: "Changes saved successfully", severity: "success" });

      // Update localstorage with new profile picture and username
      const { data } = await response.json();
      localStorage.setItem("username", data.username);
      localStorage.setItem("profile_picture", data.profile_picture);

      // Redirect to the user's profile page
      navigate(`/profile/${responseData.data.username}`);
    } catch (error) {
      setAlert({ message: error.message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const response = await UserController.deleteUser();

      if (response.status === "success") {
        setSnackbar({
          open: true,
          message: "Account deleted successfully!",
          severity: "success",
        });

        // Clear local storage and redirect to home page
        localStorage.clear();
        navigate("/");
      } else {
        throw new Error("Failed to delete account.");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete account.",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "32px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000} // Lasts 5 seconds
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

      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", marginBottom: "16px" }}
      >
        Settings
      </Typography>

      {alert.message && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ message: "", severity: "" })}
          sx={{ marginBottom: "16px" }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Change Profile Picture */}
      <Box sx={{ textAlign: "center", marginBottom: "24px" }}>
        <Avatar
          src={
            profilePicture
              ? URL.createObjectURL(profilePicture)
              : `${DB_HOST}/${userData.profile_picture}`
          }
          alt={userData.username}
          sx={{
            width: 100,
            height: 100,
            margin: "0 auto",
            marginBottom: "16px",
            border: "2px solid #79A3B1",
          }}
        />
        <Button
          variant="contained"
          component="label"
          sx={{ marginBottom: "8px" }}
        >
          Upload Profile Picture
          <input type="file" hidden onChange={handleProfilePictureChange} />
        </Button>
      </Box>

      <Divider sx={{ marginBottom: "24px" }} />

      {/* Change Username */}
      <Box sx={{ marginBottom: "24px" }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", marginBottom: "8px" }}
        >
          Username
        </Typography>
        <TextField
          label="Username"
          name="username"
          value={userData.username}
          onChange={handleChange}
          fullWidth
          sx={{ marginBottom: "16px" }}
        />
      </Box>
      <Divider sx={{ marginBottom: "24px" }} />

      {/* Change Bio */}
      <Box sx={{ marginBottom: "24px" }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", marginBottom: "8px" }}
        >
          Bio
        </Typography>
        <TextField
          label="Bio"
          name="bio_description"
          value={userData.bio_description || ""}
          onChange={handleChange}
          fullWidth
          sx={{ marginBottom: "16px" }}
        />
      </Box>
      <Divider sx={{ marginBottom: "24px" }} />

      {/* Change Tags */}
      <Box sx={{ marginBottom: "24px" }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", marginBottom: "8px" }}
        >
          Tags (comma-separated)
        </Typography>
        <TextField
          label="Tags"
          name="tags"
          value={(userData.tags || []).join(", ")}
          onChange={(e) =>
            setUserData((prev) => ({
              ...prev,
              tags: e.target.value.split(",").map((tag) => tag.trim()),
            }))
          }
          fullWidth
          sx={{ marginBottom: "16px" }}
        />
      </Box>

      {/* Save Changes */}
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving}
        fullWidth
        sx={{
          backgroundColor: "#79A3B1",
          color: "#fff",
          "&:hover": { backgroundColor: "#456268" },
        }}
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>

      {/* Go Back to Profile */}
      <Button
        variant="outlined"
        onClick={() => navigate(`/profile/${username}`)}
        fullWidth
        sx={{
          marginTop: "16px",
          borderColor: "#79A3B1",
          color: "#79A3B1",
          "&:hover": { borderColor: "#456268", color: "#456268" },
        }}
      >
        Go Back to Profile
      </Button>

      {/* Delete Account Button */}
      <Button
        variant="outlined"
        color="error"
        fullWidth
        sx={{ marginTop: "16px" }}
        onClick={() => setDeleteDialogOpen(true)}
      >
        Delete Account
      </Button>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteAccount}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
