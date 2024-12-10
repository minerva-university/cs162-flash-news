import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Box,
  Button,
  IconButton,
  Modal,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ArticleCard = ({ article, username }) => {
  const DB_HOST = "http://127.0.0.1:5000/api";
  const loggedInUsername = localStorage.getItem("username");
  const accessToken = localStorage.getItem("access_token");
  const isOwner = username === loggedInUsername;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: article.title,
    description: article.description,
    link: article.link,
    category: article.category,
  });

  // Open and close edit modal
  const handleOpenModal = () => setEditModalOpen(true);
  const handleCloseModal = () => setEditModalOpen(false);

  // Set form data on input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  // Handle edit form change in state
  const onEdit = async (article) => {
    try {
      const response = await fetch(`${DB_HOST}/posts/${article.post_id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: article.newDescription, 
          article_link: article.newLink,
          categories: article.newCategories,
        }),
      });
      if (response.ok) {
        alert("Post updated successfully");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update post");
      }
    } catch (err) {
      console.error("Error editing post:", err);
      alert("An error occurred");
    }
  };  

  // Handle edit form submission
  const handleSubmitEdit = () => {
    onEdit(article.post_id, editFormData); 
    handleCloseModal();
  };

  const onDelete = async (article) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(`${DB_HOST}/posts/${article.post_id}/delete`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        alert("Post deleted successfully");
        // Refresh the list of posts or update state here
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete post");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("An error occurred");
    }
  };

  const onRemoveArticle = async (article, collectionId) => {
    try {
      const response = await fetch(
        `${DB_HOST}/collections/${collectionId}/posts/${article.post_id}/remove`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        alert("Article removed from collection successfully");
        // Refresh collection or update state here
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to remove article");
      }
    } catch (err) {
      console.error("Error removing article:", err);
      alert("An error occurred");
    }
  };
  
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#FCF8EC",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        maxWidth: 400,
        height: "100%",
        margin: "5px",
      }}
    >
      {/* Image Section */}
      <Box
        component="img"
        src={article.image || "https://via.placeholder.com/300x150"}
        alt={article.title}
        sx={{
          width: "100%",
          height: "150px",
          objectFit: "cover",
          backgroundColor: "#D0E8F2",
        }}
      />

      {/* Content Section */}
      <CardContent
        sx={{
          flex: "1 1 auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#21242A",
            marginBottom: "8px",
            fontFamily: "Roboto",
          }}
        >
          {article.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#5F848C",
            marginBottom: "8px",
            fontFamily: "Roboto",
          }}
        >
          {article.source}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#456268",
            marginBottom: "12px",
            fontFamily: "Roboto",
          }}
        >
          {article.description}
        </Typography>

        {/* Category and Author */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Chip
            label={article.category}
            size="small"
            sx={{
              backgroundColor: "#79A3B1",
              color: "#FCF8EC",
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "#D0E8F2", width: 30, height: 30 }} />
            <Typography
              variant="body2"
              sx={{
                marginLeft: "10px",
                color: "#21242A",
                fontFamily: "Roboto",
              }}
            >
              {article.author}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Action Buttons */}
      {isOwner && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 16px",
          }}
        >
          <IconButton
            onClick={handleOpenModal}
            sx={{
              color: "#5F848C",
              "&:hover": { color: "#266a7a" },
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => onDelete(article)}
            sx={{
              color: "#5F848C",
              "&:hover": { color: "#A94442" },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}

      {/* Read More Button */}
      <Button
        variant="contained"
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          backgroundColor: "#5F848C",
          color: "#FCF8EC",
          fontWeight: "bold",
          borderRadius: "0 0 8px 8px",
          "&:hover": {
            backgroundColor: "#266a7a",
          },
        }}
      >
        Read More
      </Button>

      {/* Edit Modal */}
      <Modal open={editModalOpen} onClose={handleCloseModal}>
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
            Edit Article
          </Typography>
          <TextField
            label="Title"
            name="title"
            value={editFormData.title}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: "16px" }}
          />
          <TextField
            label="Description"
            name="description"
            value={editFormData.description}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: "16px" }}
          />
          <TextField
            label="Link"
            name="link"
            value={editFormData.link}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: "16px" }}
          />
          <TextField
            label="Category"
            name="category"
            value={editFormData.category}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: "16px" }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <Button variant="contained" onClick={handleSubmitEdit}>
              Save
            </Button>
            <Button variant="outlined" onClick={handleCloseModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Card>
  );
};

export default ArticleCard;