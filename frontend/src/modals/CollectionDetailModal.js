// src/modals/CollectionDetailModal.js
import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import "./CollectionDetailModal.css";

const CollectionDetailModal = ({ type, user }) => {
  // const [loading, setLoading] = useState(true);
  // const [articles, setArticles] = useState([]);

  // Example data --> Will be replaced with actual data from the backend
  // TODO: test horizontal scroll with more data
  const articles = [
    {
      title: "Article Title 1",
      source: "Source Name",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      category: "Category",
      author: "Author Name",
    },
    {
      title: "Article Title 2",
      source: "Source Name",
      description:
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      category: "Category",
      author: "Author Name",
    },
    {
      title: "Article Title 3",
      source: "Source Name",
      description:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      category: "Category",
      author: "Author Name",
    },
  ];

  // TODO: Uncomment
  // TODO: Add error handling

  // const fetchArticles = async (user) => {
  //  // Add user token to headers if necessary + loading functionality + error handling
  //   try {
  //     const response = await fetch(`${<backend_host>}/articles`, {
  //       method: "GET",
  //       headers: {
  //        HEADERS_WITH_JWT(user),
  //        "Content-Type": "application/json",
  //       },
  //     });

  //     const data = await response.json();

  //     // Check if the response was successful
  //     if (response.ok) {
  //       // Return the data if the response is successful
  //       return data;
  //     } else {
  //       // Throw an error with a message from the backend if the response was not successful
  //       throw new Error(data.message || "Failed to fetch articles");
  //     }
  //   } catch (error) {
  //     // Log any errors that could happen during the fetch process
  //     console.error("Error fetching articles:", error);
  //   }
  // };

  // Use useEffect to call fetchArticles when the component renders
  // useEffect(() => {
  // fetchArticles();
  // }, []);

  return (
    <div className="collection-section">
      <Typography
        className="collection-title"
        sx={{ fontSize: "1.8em", fontWeight: "bold", margin: "40px 0" }}
      >
        {type} Collections
      </Typography>
      <div className="articles-grid">
        {/* TODO: Add loader when fetching articles */}
        {articles.map((article, index) => (
          <Card key={index} className="article-card">
            <div className="article-card-content">
              <div className="article-image"></div>
              <CardContent className="article-details">
                <Typography variant="h6" className="article-title">
                  {article.title}
                </Typography>
                <Typography variant="body2" className="source">
                  {article.source}
                </Typography>
                <Typography variant="body2" className="description">
                  {article.description}
                </Typography>
                <Chip label={article.category} className="category-chip" />
                <div className="author-section">
                  {/* Change according to the type of file for avatar image */}
                  <Avatar sx={{ width: 24, height: 24, bgcolor: "#ddd" }} />
                  <Typography
                    className="author-name"
                    sx={{
                      marginLeft: "10px",
                      fontSize: "0.9em",
                      fontWeight: "thin",
                    }}
                  >
                    {article.author}
                  </Typography>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CollectionDetailModal;
