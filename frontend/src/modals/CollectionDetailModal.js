import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Box,
} from "@mui/material";
import ArticleCard from "../components/ArticleCard";

// TODO: Add functionality for fetching articles --> Consider data from posts and adapt to article card 
const CollectionDetailModal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const collection = location.state?.collection;
  const username = location.state?.username;


  if (!collection) {
    return <Typography>No collection found. Please navigate back.</Typography>;
  }

  // const [loading, setLoading] = useState(true);
  const { title, articles =[], createdAt, description, emoji } = collection;

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
          gap: "48px",
          padding: "24px",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "48px",
        }}
      >
        {/* Title Section */}
        <Box
          sx={{
            flex: "1",
            padding: "24px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #79A3B1, #5F848C)",
            color: "#FCF8EC",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            height: "300px",
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

        {/* Article  Preview*/}
        {/* TODO: change the fetching logic to be the most recent */}
        {articles.length > 0 && (
          <Box
            sx={{
              flex: "2",
              padding: "16px",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              height: "100%",
            }}
          >
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
      </Box>

      {/* Divider */}
      <Box
        sx={{
          borderTop: "1px solid #D0D0D0",
          marginY: "32px",
          width: "100%",
        }}
      ></Box>

      {/* Articles Section */}
      {articles.length > 0 ? (
        <>
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
                isOwner={true} // TODO: check user ownership
                // TODO: Implement edit and delete functionality (log for now)
                onEdit={(article) => console.log("Edit clicked for", article)}
                onDelete={(article) => console.log("Delete clicked for", article)}
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
            No articles available.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CollectionDetailModal;
