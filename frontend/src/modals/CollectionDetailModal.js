import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Box,
  Modal,
  Snackbar,
  Alert,
  Divider,
  Autocomplete,
  TextField,
} from "@mui/material";
import ArticleCard from "../components/ArticleCard";
import { DB_HOST } from "../controllers/config.js";
import CollectionController from "../controllers/CollectionController.js";
import PostController from "../controllers/PostController.js";

// TODO: Change to controller
const CollectionDetailModal = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [collectionArticles, setCollectionArticles] = useState([]);
  const [userArticles, setUserArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddArticleModalOpen, setIsAddArticleModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // Specific collection details
  const collection = useMemo(() => {
    return location.state?.collection || {};
  }, [location.state]);
  const username = location.state?.username;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("Access token missing. Please log in.");

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
      return profile;
    } catch (error) {
      console.error("Error fetching profile data:", error.message);
      setError(error.message);
    }
  };

  // Fetch collection articles
  const fetchCollectionArticles = async () => {
    if (!collection.collection_id) return;
    try {
      setLoading(true);
      const collectionArticles = await CollectionController.getCollectionPosts(
        parseInt(collection.collection_id),
      );

      setCollectionArticles(collectionArticles);
      return collectionArticles;
    } catch (error) {
      console.error("Error fetching collection articles:", error.message);
      setSnackbar({
        open: true,
        message: "Error fetching collection articles",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user articles (Keep this because we might need to fetch directly later)
  const fetchUserArticles = async (userId) => {
    try {
      // Fetch fresh user articles
      const userArticlesData = await PostController.getUserPosts(userId);

      if (!userArticlesData?.posts) {
        console.error("No posts found for the user");
        setUserArticles([]);
        return;
      }

      // Get current collection articles
      const currentCollectionArticles = await fetchCollectionArticles();

      // Create a Set of post IDs that are in the collection
      const existingPostIds = new Set(
        currentCollectionArticles.map((article) => article.post_id),
      );

      // Filter out articles that are already in the collection
      const filteredArticles = userArticlesData.posts.filter(
        (post) => !existingPostIds.has(post.post_id),
      );

      setUserArticles(filteredArticles);
    } catch (error) {
      console.error("Error fetching user articles:", error.message);
      setSnackbar({
        open: true,
        message: "Error fetching user articles",
        severity: "error",
      });
    }
  };

  // Handle adding article to collection
  const handleAddArticleToCollection = async () => {
    try {
      if (!selectedArticle || !selectedArticle.post_id) {
        console.error("No article selected or invalid article data");
        return;
      }

      setLoading(true);

      // Add the article
      await CollectionController.addPostToCollection(
        collection.collection_id,
        selectedArticle.post_id,
      );

      // Update local state immediately
      setCollectionArticles((prev) => [...prev, selectedArticle]);

      // Remove the added article from userArticles
      setUserArticles((prev) =>
        prev.filter((article) => article.post_id !== selectedArticle.post_id),
      );

      setSnackbar({
        open: true,
        message: "Article added to collection!",
        severity: "success",
      });
      setSelectedArticle(null);
      setIsAddArticleModalOpen(false);
    } catch (error) {
      console.error("Error adding article:", error.message);
      // On error, refresh both states to ensure consistency
      const [updatedCollectionArticles, userArticlesData] = await Promise.all([
        fetchCollectionArticles(),
        PostController.getUserPosts(profileData.user_id),
      ]);

      setCollectionArticles(updatedCollectionArticles);
      setUserArticles(
        userArticlesData.posts.filter(
          (post) =>
            !updatedCollectionArticles.some(
              (collectionPost) => collectionPost.post_id === post.post_id,
            ),
        ),
      );

      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove article from collection
  const handleRemoveArticleFromCollection = async (articleID) => {
    try {
      setLoading(true);

      // Find the article being removed
      const removedArticle = collectionArticles.find(
        (article) => article.post_id === articleID,
      );

      // Update collection articles
      setCollectionArticles((prev) =>
        prev.filter((article) => article.post_id !== articleID),
      );

      // Add the removed article back to userArticles if it belongs to the current user
      if (
        removedArticle &&
        removedArticle.user.user_id === profileData.user_id
      ) {
        setUserArticles((prev) => [...prev, removedArticle]);
      }

      // Remove the article from the collection in the database
      await CollectionController.removePostFromCollection(
        collection.collection_id,
        articleID,
      );

      setSnackbar({
        open: true,
        message: "Article removed from collection!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error removing article:", error.message);

      // On error, refresh both states to ensure consistency
      const [updatedCollectionArticles, userArticlesData] = await Promise.all([
        fetchCollectionArticles(),
        PostController.getUserPosts(profileData.user_id),
      ]);

      setCollectionArticles(updatedCollectionArticles);
      setUserArticles(
        userArticlesData.posts.filter(
          (post) =>
            !updatedCollectionArticles.some(
              (collectionPost) => collectionPost.post_id === post.post_id,
            ),
        ),
      );

      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const profile = await fetchProfileData();

        if (profile) {
          const [collectionArticles, userArticlesData] = await Promise.all([
            fetchCollectionArticles(),
            PostController.getUserPosts(profile.user_id),
          ]);

          setCollectionArticles(collectionArticles);

          // Filter user articles in one go
          const filteredUserArticles = userArticlesData.posts.filter(
            (post) =>
              !collectionArticles.some(
                (collectionPost) => collectionPost.post_id === post.post_id,
              ),
          );

          setUserArticles(filteredUserArticles);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        setError("Failed to load data");
      }
    };

    loadInitialData();
  }, [collection.collection_id, username]);

  // Edit post
  const handleEditPost = async (postId, updatedData) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("Access token missing. Please log in.");
      }

      setLoading(true);

      // Find the post to edit
      const postToEdit = collectionArticles.find(
        (article) => article.post_id === postId,
      );
      if (!postToEdit) {
        throw new Error("Post not found");
      }

      // Create updated post
      const updatedPost = {
        ...postToEdit,
        ...updatedData,
      };

      // Update the frontend state
      setCollectionArticles((prev) =>
        prev.map((article) =>
          article.post_id === postId ? updatedPost : article,
        ),
      );

      // Update the post in the database
      const response = await fetch(`${DB_HOST}/posts/${postId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update the post.");
      }

      setSnackbar({
        open: true,
        message: "Post updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error editing post:", error.message);

      // On error, refresh the collection articles to ensure consistency
      const updatedCollectionArticles = await fetchCollectionArticles();
      setCollectionArticles(updatedCollectionArticles);

      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // In the parent component delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("Access token missing. Please log in.");
      }

      const response = await fetch(`${DB_HOST}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        // After successful deletion, fetch updated collection articles
        const updatedCollectionArticles = await fetchCollectionArticles();
        setCollectionArticles(updatedCollectionArticles);

        // Update userArticles
        const updatedUserArticles = userArticles.filter(
          (article) => article.post_id !== postId,
        );
        setUserArticles(updatedUserArticles);

        // Show success message
        setSnackbar({
          open: true,
          message: "Post deleted successfully!",
          severity: "success",
        });
      } else {
        const errorData = await response.json();

        // Show error message
        setSnackbar({
          open: true,
          message: errorData.error || "Failed to delete the post.",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete post",
        severity: "error",
      });
    }
  };

  // Loading state
  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box
      sx={{
        padding: "32px",
        backgroundColor: "#f4f3ef",
        minHeight: "100vh",
        marginBottom: "32px",
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

      {/* Back to Collections Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <Button
          onClick={() => navigate(`/user/${username}/collections`)}
          variant="contained"
          sx={{
            backgroundColor: "#5F848C",
            color: "#FCF8EC",
            padding: "8px 16px",
            borderRadius: "20px",
            "&:hover": {
              backgroundColor: "#456268",
            },
          }}
        >
          Back to Collections
        </Button>
        {isOwner && (
          <Button
            onClick={() => setIsAddArticleModalOpen(true)}
            variant="contained"
            sx={{
              backgroundColor: "#5F848C",
              color: "#FCF8EC",
              padding: "8px 16px",
              borderRadius: "20px",
              "&:hover": {
                backgroundColor: "#456268",
              },
            }}
          >
            Add Post to Collection
          </Button>
        )}
      </Box>

      {/* Header and Featured Article Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: collectionArticles.length > 0 ? "row" : "column", // Row for articles, column otherwise
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: "48px",
          marginBottom: "48px",
          marginTop: "40px",
          maxHeight: "500px",
          width: "80%",
          margin: "0 auto",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            padding: "24px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #79A3B1, #5F848C)",
            color: "#FCF8EC",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            marginTop: "30px",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              fontSize: "50px",
            }}
          >
            {collection?.emoji || "🌕"}
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              fontFamily: "'Roboto', serif",
              marginBottom: "8px",
            }}
          >
            {collection?.title || "Untitled Collection"}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: "1rem",
              fontFamily: "'Raleway', sans-serif",
              marginBottom: "16px",
            }}
          >
            {collection?.description || "No description available."}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.9rem",
              fontFamily: "'Lato', sans-serif",
              color: "#D0E8F2",
            }}
          >
            Created on:{" "}
            {collection?.created_at
              ? new Date(collection.created_at).toLocaleDateString()
              : "N/A"}
          </Typography>
        </Box>

        {/* Divider */}
        <Divider sx={{ marginY: "12px", marginBottom: "40px" }} />

        {/* Featured Article Section */}
        {collectionArticles.length > 0 && (
          <Box
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              padding: "24px",
              textAlign: "center",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginTop: "30px",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                fontFamily: "'Roboto', serif",
                marginBottom: "16px",
                color: "#333",
              }}
            >
              Featured Article
            </Typography>

            {/* Check if preview exists */}
            {collectionArticles[0]?.article.preview ? (
              <Box
                component="img"
                src={collectionArticles[0].article.preview}
                alt={`Featured ${collectionArticles[0].article.title}`}
                sx={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <Typography variant="h6" sx={{ marginBottom: "16px" }}>
                No preview image available
              </Typography>
            )}

            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                fontFamily: "'Roboto', serif",
                color: "#333",
                marginTop: "16px",
              }}
            >
              {collectionArticles[0]?.article.title || "Untitled Article"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: "1rem",
                fontFamily: "'Lato', sans-serif",
                color: "#666",
                margin: "16px 0",
              }}
            >
              {collectionArticles[0]?.description || "No description available"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", color: "#999" }}
            >
              by {collectionArticles[0]?.user.username || "Unknown Author"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Divider */}
      {collectionArticles.length > 0 && (
        <Box
          sx={{
            borderTop: "1px solid #D0D0D0",
            marginY: "32px",
            width: "100%",
          }}
        ></Box>
      )}

      {/* More Articles Section */}
      {collectionArticles.length > 1 ? (
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontFamily: "'Roboto', serif",
              marginBottom: "16px",
              color: "#333",
              textAlign: "center",
            }}
          >
            More Articles
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* Articles List */}
            {collectionArticles.slice(1).map((post, index) => (
              <Box
                key={post.post_id || index}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "24px",
                  alignItems: "stretch",
                }}
              >
                <ArticleCard
                  key={post.post_id}
                  post={post}
                  username={username}
                  onEdit={(postId, updatedData) =>
                    handleEditPost(postId, updatedData)
                  }
                  onDelete={() => handleDeletePost(post.post_id)}
                />
                <Button
                  onClick={() =>
                    handleRemoveArticleFromCollection(post.post_id)
                  }
                  variant="outlined"
                  color="error"
                  sx={{
                    marginTop: "20px",
                    width: "100%",
                  }}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        // If there is only one article in the collection
        collectionArticles.length === 1 && (
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
              No additional articles available in this collection.
            </Typography>
          </Box>
        )
      )}

      {error && (
        <Typography
          color="error"
          sx={{ textAlign: "center", marginTop: "32px" }}
        >
          {error}
        </Typography>
      )}

      {collectionArticles.length === 0 && !loading && !error && (
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
            No articles available.
          </Typography>
        </Box>
      )}

      {/* Modal for Adding Article */}
      <Modal
        open={isAddArticleModalOpen}
        onClose={() => setIsAddArticleModalOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            padding: "24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            width: "400px",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontFamily: "'Roboto', serif",
              color: "#333",
              marginBottom: "16px",
            }}
          >
            Add an Article
          </Typography>

          <Autocomplete
            options={userArticles || []}
            getOptionLabel={(option) =>
              option.article?.title || "Untitled Article"
            }
            isOptionEqualToValue={(option, value) =>
              option.post_id === value.post_id
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select an Article"
                variant="outlined"
              />
            )}
            onChange={(event, newValue) => {
              setSelectedArticle(newValue);
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.post_id}>
                {option.article?.title || "Untitled Article"}
              </li>
            )}
          />

          <Button
            onClick={handleAddArticleToCollection}
            variant="contained"
            sx={{
              backgroundColor: "#5F848C",
              color: "#FCF8EC",
              fontWeight: "bold",
              width: "100%",
              marginTop: "16px",
              "&:hover": {
                backgroundColor: "#456268",
              },
            }}
          >
            Add Article
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default CollectionDetailModal;
