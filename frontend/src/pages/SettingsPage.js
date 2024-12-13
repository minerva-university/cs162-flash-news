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
} from "@mui/material";

// TODO: Add tags as dropdown

const SettingsPage = () => {
  const DB_HOST = "http://127.0.0.1:5000/api";
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

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("access_token");
        console.log(accessToken);
        const response = await fetch(`${DB_HOST}/user/${username}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUserData(data.data);
      } catch (error) {
        setAlert({ message: error.message, severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

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

  // Save all changes
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

      const response = await fetch(`${DB_HOST}/user`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === "Username already exists") {
          throw new Error(
            "The username is already taken. Please choose another.",
          );
        } else {
          throw new Error("Failed to save changes.");
        }
      }

      setAlert({ message: "Changes saved successfully", severity: "success" });

      // Redirect to the user's profile page
      navigate(`/${userData.username}/profile`);
    } catch (error) {
      setAlert({ message: error.message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${DB_HOST}/user`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account.");
      }

      setAlert({
        message: "Account deleted successfully!",
        severity: "success",
      });
      localStorage.clear(); // Clear local storage after account deletion
      navigate("/signup"); // Redirect to the signup page
    } catch (error) {
      setAlert({ message: error.message, severity: "error" });
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
              : userData.profile_picture
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
          value={userData.tags.join(", ") || ""}
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
        onClick={() => navigate(`/${username}/profile`)}
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
