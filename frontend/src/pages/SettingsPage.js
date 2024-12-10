import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  TextField,
  Button,
  Modal,
} from "@mui/material";

const SettingsPage = () => {
    const DB_HOST = "http://127.0.0.1:5000/api";
    const { username } = useParams();

    useEffect(() => {
        if (!username) {
          console.error("Username not provided in URL");
          return;
        }
    
        // Fetch user-specific data using the username
        fetchData(username);
      }, [username]);
    
      const fetchData = async (username) => {
        try {
          const response = await fetch(`${DB_HOST}/user/${username}`);
          if (!response.ok) throw new Error("Failed to fetch user data");
    
          const data = await response.json();
          console.log("User data fetched successfully:", data);
          
        // Set data to state here
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        username: "",
        bio_description: "",
        tags: [],
    });
    const [newUsername, setNewUsername] = useState("");
    const [newBio, setNewBio] = useState("");
    const [newTags, setNewTags] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await fetch(
            `${DB_HOST}/user/${username}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
            );
            const data = await response.json();
            if (response.ok) {
            setUserData(data);
            setNewUsername(data.username);
            setNewBio(data.bio_description || "");
            setNewTags(data.tags ? data.tags.join(", ") : ""); // Default to empty string
            } else {
            console.error("Error fetching user data:", data.error);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
        };

        fetchUserData();
    }, [username]);

    // Update user data
    const handleUpdate = async (field, value) => {
        try {
        const response = await fetch(
            `${DB_HOST}/user/update/${username}`,
            {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: value }),
            credentials: "include",
            }
        );
        if (response.ok) {
            alert(`${field} updated successfully!`);
            navigate(`/${newUsername}/settings`);
        } else {
            alert(`Failed to update ${field}.`);
        }
        } catch (error) {
        console.error(`Error updating ${field}:`, error);
        }
    };

    const handleDeleteProfile = async () => {
        try {
        const response = await fetch(
            `${DB_HOST}/user/delete/${username}`,
            {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            }
        );
        if (response.ok) {
            alert("Profile deleted successfully!");
            navigate("/");
        } else {
            alert("Failed to delete profile.");
        }
        } catch (error) {
        console.error("Error deleting profile:", error);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Box
        sx={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "32px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        >
        <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "16px" }}>
            Settings for {username}
        </Typography>

        {/* Change Username */}
        <Box sx={{ marginBottom: "24px" }}>
            <Typography
            variant="h6"
            sx={{ fontWeight: "bold", marginBottom: "8px" }}
            >
            Change Username
            </Typography>
            <TextField
            label="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            fullWidth
            sx={{ marginBottom: "16px" }}
            />
            <Button
            variant="contained"
            onClick={() => handleUpdate("username", newUsername)}
            sx={{
                backgroundColor: "#79A3B1",
                color: "#fff",
                "&:hover": { backgroundColor: "#456268" },
            }}
            >
            Save Username
            </Button>
        </Box>
        <Divider sx={{ marginBottom: "24px" }} />

        {/* Change Bio */}
        <Box sx={{ marginBottom: "24px" }}>
            <Typography
            variant="h6"
            sx={{ fontWeight: "bold", marginBottom: "8px" }}
            >
            Change Bio
            </Typography>
            <TextField
            label="New Bio"
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            fullWidth
            sx={{ marginBottom: "16px" }}
            />
            <Button
            variant="contained"
            onClick={() => handleUpdate("bio_description", newBio)}
            sx={{
                backgroundColor: "#79A3B1",
                color: "#fff",
                "&:hover": { backgroundColor: "#456268" },
            }}
            >
            Save Bio
            </Button>
        </Box>
        <Divider sx={{ marginBottom: "24px" }} />

        {/* Change Tags */}
        <Box sx={{ marginBottom: "24px" }}>
            <Typography
            variant="h6"
            sx={{ fontWeight: "bold", marginBottom: "8px" }}
            >
            Change Tags
            </Typography>
            <TextField
            label="New Tags (comma-separated)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            fullWidth
            sx={{ marginBottom: "16px" }}
            />
            <Button
            variant="contained"
            onClick={() =>
                handleUpdate(
                "tags",
                newTags.split(",").map((tag) => tag.trim())
                )
            }
            sx={{
                backgroundColor: "#79A3B1",
                color: "#fff",
                "&:hover": { backgroundColor: "#456268" },
            }}
            >
            Save Tags
            </Button>
        </Box>
        <Divider sx={{ marginBottom: "24px" }} />

        {/* Delete Profile */}
        <Box>
            <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "red", marginBottom: "8px" }}
            >
            Delete Profile
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: "16px", color: "gray" }}>
            Warning: This action is irreversible. Deleting your profile will
            remove all your data permanently.
            </Typography>
            <Button
            variant="contained"
            color="error"
            onClick={handleDeleteProfile}
            >
            DELETE PROFILE
            </Button>
        </Box>
        </Box>
    );
    };

    export default SettingsPage;