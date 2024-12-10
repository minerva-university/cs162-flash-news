import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import ArticleCard from "../components/ArticleCard";
import { Settings } from "@mui/icons-material";
import PostCard from "../components/PostCard";

// TODO: Add functionality for fetching articles --> Consider data from posts and adapt to article card 
// TODO: Add functionality for fetching most recent collections
// TODO: Add functionality for fetching most recent posts (potentially ask for backend quicker variable send?)

const ProfilePage = () => {
  const DB_HOST = "http://127.0.0.1:5000/api";
  const { username } = useParams(); 
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isOwner, setIsOwner] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [articles, setArticles] = useState([]);

  // Handle collection click event (navigate to collection page)
  const handleCollectionClick = (collection) => {
    const formattedTitle = collection.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/collections/${collection.id}/${formattedTitle}`, {
      state: { collection },
    });
  };

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      console.log("Starting fetchProfileData");
  
      // Retrieve access token
      const accessToken = localStorage.getItem("access_token");
      console.log("Access Token:", accessToken);
  
      if (!accessToken) {
        console.error("Access token missing. Please log in again.");
        throw new Error("Access token missing.");
      }
  
      const response = await fetch(`${DB_HOST}/user/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      console.log("Response Status:", response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData);
        throw new Error(errorData.msg || "Failed to fetch profile data.");
      }
  
      // Parse and set profile data
      const data = await response.json();
      console.log("Fetched Profile Data:", data);
      setProfileData(data.data); // Ensure this updates the state correctly
      if (data.data.username === username) {
        console.log("User is the owner of this profile");
        setIsOwner(true);
      } else {
        console.log("User is not the owner of this profile");
        setIsOwner(false);
      }
    } catch (error) {
      console.error("Error in fetchProfileData:", error);
    } finally {
      console.log("fetchProfileData completed.");
    }
  };  
  
  
  useEffect(() => {
    fetchProfileData();
  }, [username]);


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
          <Avatar sx={{ width: 80, height: 80, bgcolor: "#fff" }} 
            src={profileData.profile_picture || "https://via.placeholder.com/150"}
            alt={profileData.username}
          />
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#D9EAF3",
              }}
            >
              {profileData.username}
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
                      backgroundColor: "#D9EAF3",
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

        {/* Settings Button */}
        {isOwner && (
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
            onClick={() => navigate(`/${profileData.username}/settings`)}
          >
            Settings
          </Button>
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
            gap: "30px",
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
               {/*<PostCard key={index} post={post} /> */}
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

      {/* Most Recent Public Collections Section */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#266a7a",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Most Recent Public Collections
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: "50px",
        }}
      >

        {collections.length ? (
          collections.map((collection, index) => (
            <Box
              key={index}
              sx={{
                padding: "16px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                "&:hover": { boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" },
              }}
              onClick={() => handleCollectionClick(collection)}
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
                {collection.name} Collection
              </Typography>
            </Box>
          ))
        ) : (
          <Typography sx={{ color: "gray", textAlign: "center" }}>
            No collections available.
          </Typography>
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
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {articles.length ? (
              articles.map((article, index) => (
                <ArticleCard 
                  key={index}
                  article={article}
                  isOwner={true} // TODO: check user ownership
                  // TODO: Implement edit and delete functionality (log for now)
                  onEdit={(article) => console.log("Edit clicked for", article)}
                  onDelete={(article) =>
                    console.log("Delete clicked for", article)
                  }
                />
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