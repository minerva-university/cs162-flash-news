import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Typography,
  Box,
  Divider,
  Button,
  TextField,
  Modal,
  FormControlLabel,
  Switch,
} from "@mui/material";
import CollectionCard from "../components/CollectionCard";
import EmojiPicker from "emoji-picker-react";
import { DB_HOST } from "../controllers/config.js";

// TODO: Change to controller

const CollectionsPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [publicCollections, setPublicCollections] = useState([]);
  const [privateCollections, setPrivateCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddOpenModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: "",
    description: "",
    emoji: "😀",
    isPublic: false,
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    emoji: "",
    isPublic: false,
  });

  // Emoji picker handler
  const handleEmojiClick = (emoji) => {
    setAddFormData({ ...addFormData, emoji: emoji.emoji });
    setShowEmojiPicker(false);
  };

  // Open and close modal for adding collection
  const handleOpenModal = () => setAddOpenModal(true);
  const handleCloseModal = () => setAddOpenModal(false);

  // Input change handler for adding collection
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData({ ...addFormData, [name]: value });
  };

  // Toggle public/private
  const handleTogglePublic = () => {
    setAddFormData({ ...addFormData, isPublic: !addFormData.isPublic });
  };

  // Search handler
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const fetchProfileData = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        throw new Error("Access token missing. Please log in.");
      }

      const response = await fetch(`${DB_HOST}/user/${username}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch profile data.");
      }

      const result = await response.json();

      const profile = result.data;
      setProfileData(profile);
      setIsOwner(profile.is_owner);
    } catch (error) {
      console.error("Error in fetchProfileData:", error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  // Fetch user data and collections
  const fetchCollections = async () => {
    try {
      setLoading(true);

      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("Access token missing. Please log in.");

      // Fetch user data
      const userResponse = await fetch(`${DB_HOST}/user/${username}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) throw new Error(userResponse.message);

      const userData = await userResponse.json();
      const profile = userData.data;

      // Set profile data and check ownership
      setProfileData(profile);
      setIsOwner(profile.is_owner);

      // Fetch collections
      const collectionsResponse = await fetch(
        `${DB_HOST}/collections/user/${profile.user_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      const collectionsData = await collectionsResponse.json();
      if (!collectionsResponse.ok) throw new Error(collectionsData.message);

      // Set public and private collections
      setPublicCollections(collectionsData.data.public || []);
      if (isOwner) {
        setPrivateCollections(collectionsData.data.private || []);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch collections on initial load
  useEffect(() => {
    fetchCollections();
  }, [username, isOwner, ]);

  // Handle create collection
  const handleCreateCollection = async () => {
    try {
      if (!addFormData.title || !addFormData.emoji) {
        alert("Please fill out all required fields.");
        return;
      }

      // Fetch access token and send request
      const accessToken = localStorage.getItem("access_token");

      const response = await fetch(`${DB_HOST}/collections/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: profileData.user_id,
          title: addFormData.title,
          description: addFormData.description || "",
          emoji: addFormData.emoji,
          is_public: addFormData.isPublic,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error creating collection.");
      }

      // const newCollection = await response.json();
      setAddFormData({
        title: "",
        description: "",
        emoji: "😀",
        isPublic: false,
      });
      setAddOpenModal(false);

      fetchCollections();
    } catch (error) {
      console.error("Error creating collection:", error);
      alert(error.message || "An error occurred. Please try again.");
    }
  };

  // Open Edit Modal
  const handleEditCollection = (collection) => {
    setEditFormData({
      collection_id: collection.collection_id,
      title: collection.title || "",
      description: collection.description || "",
      emoji: collection.emoji || "",
      isPublic: collection.is_public,
    });

    setEditModalOpen(true);
  };

  // Submit Updated Collection
  const submitEditCollection = async () => {
    try {
      if (!editFormData.title || !editFormData.emoji) {
        alert("Please fill in all required fields.");
        return;
      }

      const accessToken = localStorage.getItem("access_token");

      const response = await fetch(
        `${DB_HOST}/collections/${editFormData.collection_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editFormData.title,
            description: editFormData.description,
            emoji: editFormData.emoji,
            is_public: editFormData.isPublic,
          }),
        },
      );

      if (response.ok) {
        setEditModalOpen(false);
        fetchCollections();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to update collection");
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Handle delete collection
  const handleDeleteCollection = async (collection_id) => {
    if (!window.confirm("Are you sure you want to delete this collection?"))
      return;

    try {
      const accessToken = localStorage.getItem("access_token");

      const response = await fetch(`${DB_HOST}/collections/${collection_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        fetchCollections();
      } else {
        alert(data.error || "Error deleting collection.");
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  // Filter collections by title
  const filteredPublicCollections = publicCollections.filter(
    (collection) =>
      collection.title?.toLowerCase().includes(searchTerm) || false,
  );

  const filteredPrivateCollections = privateCollections.filter(
    (collection) =>
      collection.title?.toLowerCase().includes(searchTerm) || false,
  );

  // Handle collection click
  const handleCollectionClick = (collection) => {
    const formattedTitle = collection.title?.toLowerCase().replace(/\s+/g, "-");
    navigate(`/collections/${collection.collection_id}/${formattedTitle}`, {
      state: { collection, username },
    });
  };

  if (loading) {
    return <Typography>Loading collections...</Typography>;
  }

  return (
    <Box
      sx={{
        padding: "32px",
        minHeight: "100vh",
        backgroundColor: "#f4f3ef",
      }}
    >
      {/* Profile Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "32px",
          gap: "16px",
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: "#79A3B1",
            color: "#fff",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {profileData?.profile_picture ? (
            <img
              src={profileData.profile_picture}
              alt="Profile"
              style={{ width: "100%", height: "100%", borderRadius: "50%" }}
            />
          ) : (
            profileData?.username?.charAt(0).toUpperCase() || "?"
          )}
        </Avatar>

        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              fontFamily: "'Roboto', sans-serif",
              color: "#333",
            }}
          >
            {isOwner ? "📁 My Collections" : `📁 ${username}'s Collections`}
          </Typography>
          <Typography sx={{ color: "gray" }}>
            View saved news articles.
          </Typography>
        </Box>
        {isOwner && (
          <Button
            variant="contained"
            onClick={() => handleOpenModal()}
            sx={{
              marginLeft: "auto",
              backgroundColor: "#79A3B1",
              color: "#fff",
              fontWeight: "bold",
              fontFamily: "'Raleway', sans-serif",
              "&:hover": {
                backgroundColor: "#456268",
              },
            }}
          >
            Add New Collection
          </Button>
        )}
      </Box>

      {/* Search Bar */}
      <Box
        sx={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}
      >
        <TextField
          placeholder="Search Collections"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            width: "50%",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#DDD",
              },
              "&:hover fieldset": {
                borderColor: "#79A3B1",
              },
            },
          }}
        />
      </Box>

      {/* Handle no collections */}
      {publicCollections.length === 0 && privateCollections.length === 0 ? (
        <Box sx={{ textAlign: "center", marginTop: "40px" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontFamily: "'Roboto', serif",
              marginBottom: "16px",
            }}
          >
            No Collections
          </Typography>
          <Typography sx={{ color: "gray" }}>
            {isOwner
              ? "You have not created any collections yet. Start by adding a new one!"
              : `${username} has not created any collections yet.`}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Public Collections */}
          <Box sx={{ marginTop: "40px" }}>
            {publicCollections.length > 0 ? (
              <>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    marginBottom: "16px",
                    textAlign: "center",
                    fontFamily: "'Roboto', serif",
                  }}
                >
                  Public Collections
                </Typography>
                <Divider sx={{ marginBottom: "40px" }} />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {filteredPublicCollections.map((collection) => (
                    <CollectionCard
                      key={collection.collection_id}
                      collection={collection}
                      onClick={() => handleCollectionClick(collection)}
                      isOwner={isOwner}
                      onEdit={() => handleEditCollection(collection)}
                      onDelete={() =>
                        handleDeleteCollection(collection.collection_id)
                      }
                    />
                  ))}
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  padding: "20px",
                  border: "1px dashed #ddd",
                  borderRadius: "8px",
                  marginTop: "16px",
                  backgroundColor: "#f9f9f9",
                  maxWidth: "400px",
                  margin: "0 auto",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1rem",
                    color: "#888",
                    fontStyle: "italic",
                    fontFamily: "'Roboto', sans-serif",
                    textAlign: "center",
                  }}
                >
                  No public collections available.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Private Collections */}
          {isOwner && (
            <Box sx={{ marginTop: "40px" }}>
              {privateCollections.length > 0 ? (
                <>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      marginBottom: "16px",
                      textAlign: "center",
                      fontFamily: "'Roboto', serif",
                    }}
                  >
                    Private Collections
                  </Typography>
                  <Divider sx={{ marginBottom: "40px" }} />
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {filteredPrivateCollections.map((collection) => (
                      <CollectionCard
                        key={collection.collection_id}
                        collection={collection}
                        onClick={() => handleCollectionClick(collection)}
                        isOwner={isOwner}
                        onEdit={() => handleEditCollection(collection)}
                        onDelete={() =>
                          handleDeleteCollection(collection.collection_id)
                        }
                      />
                    ))}
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    padding: "20px",
                    border: "1px dashed #ddd",
                    borderRadius: "8px",
                    marginTop: "16px",
                    backgroundColor: "#f9f9f9",
                    maxWidth: "400px",
                    margin: "0 auto",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1rem",
                      color: "#888",
                      fontStyle: "italic",
                      fontFamily: "'Roboto', sans-serif",
                      textAlign: "center",
                    }}
                  >
                    You have not created any private collections yet.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </>
      )}

      {/* Modal for Creating Collection */}
      <Modal open={addModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: "16px" }}>
            Create New Collection
          </Typography>
          <TextField
            label="Title *"
            name="title"
            value={addFormData.title}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: "16px" }}
          />
          <TextField
            label="Description"
            name="description"
            value={addFormData.description}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: "16px" }}
          />
          <TextField
            label="Icon *"
            name="emoji"
            value={addFormData.emoji}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: "16px" }}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  sx={{
                    padding: 0,
                    minWidth: 0,
                    textTransform: "none",
                    fontSize: "1.5rem",
                  }}
                >
                  {addFormData.emoji || "😀"}
                </Button>
              ),
            }}
          />
          {showEmojiPicker && (
            <Box sx={{ position: "absolute", zIndex: 10 }}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </Box>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={addFormData.isPublic}
                onChange={handleTogglePublic}
              />
            }
            label="Public"
          />
          <Box
            sx={{
              mt: 1,
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <Button variant="contained" onClick={handleCreateCollection}>
              Create
            </Button>
            <Button variant="outlined" onClick={handleCloseModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: "16px" }}>
            Edit Collection
          </Typography>

          {/* Title Field */}
          <TextField
            label="Title *"
            name="title"
            value={editFormData.title || ""}
            onChange={(e) =>
              setEditFormData({ ...editFormData, title: e.target.value })
            }
            fullWidth
            sx={{ marginBottom: "16px" }}
          />

          {/* Description Field */}
          <TextField
            label="Description"
            name="description"
            value={editFormData.description || ""}
            onChange={(e) =>
              setEditFormData({ ...editFormData, description: e.target.value })
            }
            fullWidth
            sx={{ marginBottom: "16px" }}
          />

          {/* Emoji Field */}
          <TextField
            label="Icon *"
            name="emoji"
            value={editFormData.emoji || ""}
            onChange={(e) =>
              setEditFormData({ ...editFormData, emoji: e.target.value })
            }
            fullWidth
            sx={{ marginBottom: "16px" }}
          />

          {/* Public/Private Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(editFormData.isPublic)}
                onChange={() =>
                  setEditFormData((prev) => ({
                    ...prev,
                    isPublic: !prev.isPublic,
                  }))
                }
              />
            }
            label="Public"
          />

          <Box
            sx={{
              mt: 1,
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            {/* Save Changes Button */}
            <Button
              variant="contained"
              onClick={submitEditCollection}
              sx={{ marginTop: "16px" }}
            >
              Save Changes
            </Button>

            {/* Cancel Button */}
            <Button
              variant="outlined"
              onClick={() => setEditModalOpen(false)}
              sx={{ marginTop: "16px", marginLeft: "8px" }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default CollectionsPage;
