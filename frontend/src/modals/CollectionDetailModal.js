import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography, Button, Box } from "@mui/material";
import ArticleCard from "../components/ArticleCard";

// TODO: Add functionality for adding and removing articles from the collection

const CollectionDetailModal = () => {
  const DB_HOST = "http://127.0.0.1:5000/api";
  const location = useLocation();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const collection = useMemo(() => {
    return location.state?.collection || {};
  }, [location.state]);
  const username = location.state?.username;
  const { title, createdAt, description, emoji } = collection;

  // Fetch articles for the collection
  useEffect(() => {
    const fetchArticles = async () => {
      if (!collection) return;

      try {
        setLoading(true);

        const accessToken = localStorage.getItem("access_token");

        const response = await fetch(
          `${DB_HOST}/collections/${collection.collection_id}/posts`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch articles");
        }

        const postsData = await response.json();

        // Transform posts data to articles data
        const articlesData = postsData
          .map((post) => ({
            title: post.article.title,
            source: post.article.source,
            description: post.article.caption || post.description,
            category: post.categories.join(", "),
            author: post.user.username,
            image: post.article.preview,
            link: post.article.link,
            posted_at: new Date(post.posted_at),
          }))
          .sort((a, b) => b.posted_at - a.posted_at);

        setArticles(articlesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [collection]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box
      sx={{
        padding: "32px",
        backgroundColor: "#f4f3ef",
        minHeight: "100vh",
      }}
    >
      {/* Back to Collections Button */}
      <Button
        onClick={() => navigate(`/user/${username}/collections`)}
        variant="contained"
        sx={{
          marginBottom: "32px",
          backgroundColor: "#5F848C",
          color: "#FCF8EC",
          fontFamily: "'Raleway', sans-serif",
          padding: "8px 16px",
          fontWeight: "bold",
          borderRadius: "20px",
          "&:hover": {
            backgroundColor: "#456268",
          },
        }}
      >
        Back to Collections
      </Button>

      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          alignItems: "center",
          marginBottom: "48px",
        }}
      >
        <Box
          sx={{
            padding: "24px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #79A3B1, #5F848C)",
            color: "#FCF8EC",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            width: "100%",
            maxWidth: "800px",
          }}
        >
          <Box
            sx={{
              fontSize: "50px",
            }}
          >
            {emoji}
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              fontFamily: "'Roboto', serif",
              marginBottom: "8px",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: "1rem",
              fontFamily: "'Raleway', sans-serif",
              marginBottom: "16px",
            }}
          >
            {description ||
              "Stay updated with the latest global events and trends."}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.9rem",
              fontFamily: "'Lato', sans-serif",
              color: "#D0E8F2",
            }}
          >
            Created on: {new Date(createdAt || Date.now()).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {/* Featured Article Section */}
      {articles.length > 0 && (
        <Box
          sx={{
            marginBottom: "48px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "16px",
            textAlign: "center",
            maxWidth: "800px",
            margin: "0 auto",
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
          <Box
            component="img"
            src={articles[0]?.image || "https://via.placeholder.com/600x300"}
            alt={`Featured ${articles[0]?.title}`}
            sx={{
              width: "100%",
              height: "auto",
              maxHeight: "200px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontFamily: "'Roboto', serif",
              color: "#333",
              marginTop: "16px",
            }}
          >
            {articles[0]?.title}
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
            {articles[0]?.description}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontStyle: "italic", color: "#999" }}
          >
            by {articles[0]?.author || "Unknown Author"}
          </Typography>
        </Box>
      )}

      {/* Divider */}
      <Box
        sx={{
          borderTop: "1px solid #D0D0D0",
          marginY: "32px",
          width: "100%",
        }}
      ></Box>

      {/* More Articles Section */}
      {articles.length > 1 && (
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
            {articles.slice(1).map((article, index) => (
              <ArticleCard
                key={index}
                article={article}
                username={username}
                onEdit={(article) => console.log("Edit clicked for", article)}
                onDelete={(article) =>
                  console.log("Delete clicked for", article)
                }
              />
            ))}
          </Box>
        </Box>
      )}

      {error && (
        <Typography
          color="error"
          sx={{ textAlign: "center", marginTop: "32px" }}
        >
          {error}
        </Typography>
      )}

      {articles.length === 0 && !loading && !error && (
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
    </Box>
  );
};

export default CollectionDetailModal;
