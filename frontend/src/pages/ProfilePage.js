import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import ArticleCard from "../components/ArticleCard";
import { Settings } from "@mui/icons-material";
import PostCard from "../components/PostCard";
import { DB_HOST } from "../controllers/config.js";
import FollowButton from "../components/FollowButton";
import PostController from "../controllers/PostController";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [collections, setCollections] = useState([]);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // Handle collection click event (navigate to collection page)
  const handleCollectionClick = (collection) => {
    const formattedTitle = collection.title?.toLowerCase().replace(/\s+/g, "-");
    navigate(`/collections/${collection.collection_id}/${formattedTitle}`, {
      state: { collection, username },
    });
  };

  // Fetch profile data
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
      console.log("Fetched Profile Data:", result);

      const profile = result.data;
      setProfileData(profile);
      setIsOwner(profile.is_owner);
      console.log(isOwner);
    } catch (error) {
      console.error("Error in fetchProfileData:", error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  // Fetch shared posts
  const fetchSharedPosts = async () => {
    try {
      if (!profileData || !profileData.user_id) {
        console.error("Profile data or user ID is missing.");
        return;
      }

      const accessToken = localStorage.getItem("access_token");

      const response = await fetch(
        `${DB_HOST}/posts/user/${profileData.user_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch shared posts.");
      }

      const data = await response.json();
      console.log("Fetched Shared Posts Raw Data:", data);

      // Ensure the response is an array
      const postsArray = data.posts || [];
      console.log("Posts Array:", postsArray);

      // Sort posts by `posted_at` in descending order
      const sortedPosts = postsArray.sort(
        (a, b) => new Date(b.posted_at) - new Date(a.posted_at),
      );

      console.log("Processed Shared Posts:", sortedPosts);

      setSharedPosts(sortedPosts);
    } catch (error) {
      console.error("Error fetching shared posts:", error);
    }
  };

  useEffect(() => {
    if (profileData && profileData.user_id) {
      fetchSharedPosts();
    }
  }, [profileData]);

  // Fetch user collections
  const fetchCollections = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("Access token missing. Please log in again.");
      }

      const collectionsResponse = await fetch(
        `${DB_HOST}/collections/user/${profileData.user_id}`,
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
      console.log("Fetched collections:", collectionsData);
      console.log("Public Collections:", collectionsData.public);

      // Sort collections based on a date
      const sortedCollections = (collectionsData?.public || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      // Set sorted collections
      setCollections(sortedCollections);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileData && profileData.user_id) {
      fetchCollections();
    }
  }, [profileData]);

  // Handle edit post
  const handleEditPost = async (postId, updatedData) => {
    try {
      setLoading(true);
      
      // Ensure we're sending the right data to the backend
      const dataToUpdate = {
        post_description: updatedData.description,
        categories: updatedData.categories || []
      };
  
      const response = await PostController.updatePost(postId, dataToUpdate);
  
      // Update state while preserving ALL post data
      setSharedPosts(prevPosts => 
        prevPosts.map(post => 
          post.post_id === postId 
            ? {
                ...post,                    // Keep all existing post data
                description: updatedData.description,  // Update description
                categories: updatedData.categories || [], // Update categories
                article: post.article,      // Explicitly preserve article data
                user: post.user,           // Explicitly preserve user data
                posted_at: post.posted_at, // Preserve timestamp
                comments_count: post.comments_count,
                likes_count: post.likes_count,
                is_liked: post.is_liked
              }
            : post
        )
      );
  
      setSnackbar({
        open: true,
        message: "Post updated successfully!",
        severity: "success"
      });
  
    } catch (error) {
      console.error("Error updating post:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update post",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete post
  const handleDelete = async (postId) => {
    try {
      setLoading(true);
      
      // Optimistically update UI
      setSharedPosts(prev => 
        prev.filter(post => post.post_id !== postId)
      );
  
      await PostController.deletePost(postId);
  
      setSnackbar({
        open: true,
        message: "Post deleted successfully!",
        severity: "success"
      });
  
    } catch (error) {
      console.error("Error deleting post:", error);
      
      // Revert changes on error by refetching posts
      await fetchSharedPosts();
      
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete post",
        severity: "error"
      });
    } finally {
      setLoading(false);
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

  if (!profileData) {
    return (
      <Box sx={{ textAlign: "center", marginTop: "40px" }}>
        <Typography variant="h5" sx={{ color: "gray" }}>
          User not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: "32px",
        backgroundColor: "#f4f3ef",
        minHeight: "100vh",
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

      {/* Profile Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#5F848C",
          padding: "24px",
          borderRadius: "8px",
          marginBottom: "32px",
        }}
      >
        {/* Avatar Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Avatar
            sx={{ width: 80, height: 80, bgcolor: "#79A3B1", color: "#fff", fontSize: 20, fontWeight: "bold" }}
          >
            {profileData.profile_picture ? (
              <img
                src={profileData.profile_picture}
                alt="Profile"
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
              />
            ) : (
              profileData.username ? profileData.username.charAt(0).toUpperCase() : "?"
            )}
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#e2f2fb",
              }}
            >
              {username}
            </Typography>
            {profileData.bio_description ? (
              <Typography
                sx={{
                  fontSize: "1rem",
                  color: "#a6b2bb",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {profileData.bio_description}
              </Typography>
            ) : (
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  color: "#a6b2bb",
                  fontStyle: "italic",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                No bio available.
              </Typography>
            )}
            {profileData.tags && (
              <Box sx={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                {profileData.tags.map((tag, index) => (
                  <Typography
                    key={index}
                    sx={{
                      backgroundColor: "#e2f2fb",
                      color: "#5F848C",
                      borderRadius: "12px",
                      padding: "4px 8px",
                      fontSize: "0.875rem",
                    }}
                  >
                    {tag}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </Box>
        {/* Settings Button and Follow Button*/}
        {isOwner ? (
          <Button
            variant="contained"
            startIcon={<Settings />}
            sx={{
              backgroundColor: "#D9EAF3",
              color: "#5F848C",
              fontWeight: "bold",
              fontFamily: "'Raleway', sans-serif",
              "&:hover": {
                backgroundColor: "#6b949c",
              },
            }}
            onClick={() => navigate(`/settings/${profileData.username}`)}
          >
            Settings
          </Button>
        ) : (
          profileData &&
          profileData.user_id && <FollowButton userId={profileData.user_id} />
        )}
      </Box>

      {/* Most Recent Posts Section */}
      <Box
        sx={{
          marginBottom: "40px",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#266a7a",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Recently Shared Posts
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            padding: "20px 0",
          }}
        >
          {sharedPosts.length ? (
            sharedPosts.slice(0, 3).map((post, index) => (
              <Box
                key={index}
                sx={{
                  width: "500px",
                  margin: "0 10px",
                }}
              >
                <PostCard key={index} post={post} username={username} />
              </Box>
            ))
          ) : (
            <Typography sx={{ color: "gray", textAlign: "center" }}>
              No posts available.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Divider */}
      <Divider
        sx={{
          margin: "40px 0",
          backgroundColor: "#266a7a",
          opacity: 0.5,
        }}
      />

      {/* Public Collections Section */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#266a7a",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        {username[0].toLocaleUpperCase()}
        {username.slice(1).toLowerCase()}'s Most Recent Public Collections
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: "50px",
        }}
      >
        {collections.length ? (
          collections.slice(0, 4).map((collection, index) => (
            <Box
              key={index}
              onClick={() => handleCollectionClick(collection)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px",
              }}
            >
              <Box
                sx={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#D9EAF3",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  color: "#5F848C",
                  cursor: "pointer",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                {collection.emoji}
              </Box>
              <Typography
                variant="h6"
                sx={{
                  marginTop: "8px",
                  color: "#5F848C",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {collection.title}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography sx={{ color: "gray", textAlign: "center" }}>
            No collections available.
          </Typography>
        )}

        {/* See More Collections Button */}
        {collections.length > 4 && ( // Show the button only if more than 4 collections exist
          <Box sx={{ textAlign: "center", marginTop: "40px" }}>
            <Button
              variant="outlined"
              onClick={() =>
                navigate(`/user/${profileData.username}/collections`)
              }
              sx={{
                borderColor: "#5F848C",
                color: "#5F848C",
                alignItems: "center",
                justifyContent: "center",
                height: "50%",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#D9EAF3",
                },
              }}
            >
              See More Collections
            </Button>
          </Box>
        )}
      </Box>

      {isOwner && (
        <>
          {/* Divider */}
          <Divider
            sx={{
              margin: "40px 0",
              backgroundColor: "#266a7a",
              opacity: 0.5,
            }}
          />
          {/* All Articles Section */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#266a7a",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            All Articles
          </Typography>

          <Box
            sx={{
              maxWidth: "1200px",
              display: "flex",  // Changed from grid to flex
              flexWrap: "wrap", // Allow wrapping
              justifyContent: "center", // Center items horizontally
              gap: "20px",      // Reduced gap
              padding: "20px 0",
              marginTop: "40px",
              margin: "0 auto",  // Center the container
            }}
          >
            {sharedPosts.length ? (
              sharedPosts.map((post, index) => (
                <Box
                  key={index}
                  sx={{
                    width: "300px",  // Fixed width for each article
                    margin: "0 10px 20px",  // Add some margin
                  }}
                >
                  <ArticleCard
                    key={index}
                    post={post}
                    username={username}
                    onEdit={(postId, updatedData) => handleEditPost(postId, updatedData)}
                    onDelete={(postId) => handleDelete(postId)}
                  />
                </Box>
              ))
            ) : (
              <Typography sx={{ color: "gray", textAlign: "center" }}>
                No articles available.
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProfilePage;