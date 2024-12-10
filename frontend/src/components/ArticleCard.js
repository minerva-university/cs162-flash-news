import React, { useState } from "react";
//import { useNavigate } from "react-router-dom";
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// TODO: Fix the styling of the card

const ArticleCard = ({ post, username, onPostUpdate }) => {
  const DB_HOST = "http://127.0.0.1:5000/api";
  //const navigate = useNavigate();
  const loggedInUsername = localStorage.getItem("username");
  const accessToken = localStorage.getItem("access_token");
  const isOwner = username === loggedInUsername;

  console.log("Initializing ArticleCard with post:", post);

  // Initialize edit form state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: post.article.title || "",
    description: post.description || "",
    link: post.article.link || "",
    categories: post.categories || [],
  });

  // Open and close edit modal
  const handleOpenModal = () => {
    console.log("Opening modal for editing");
    setEditModalOpen(true);
  };
  const handleCloseModal = () => {
    console.log("Closing modal");
    setEditModalOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Handling input change for ${name}:`, value);
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle category selection change
  const handleCategoryChange = (event) => {
    console.log("Selected new categories:", event.target.value);
    setEditFormData((prev) => ({
      ...prev,
      categories: event.target.value,
    }));
  };

  // Handle post edit
  const handleEditPost = async () => {
    console.log("Submitting edit with data:", editFormData);
    console.log("Post ID:", post.post_id);
    console.log("Post title:", editFormData.title);
    console.log("Post description:", editFormData.description);
    console.log("Post link:", editFormData.link);
    console.log("Post categories:", editFormData.categories);
    try {
      const response = await fetch(`${DB_HOST}/posts/${post.post_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article_link: editFormData.link.trim(),
          title: editFormData.title.trim(),
          description: editFormData.description.trim(),
          categories: editFormData.categories,
        }),
      });

      console.log(
        "body",
        JSON.stringify({
          article_link: editFormData.link.trim(),
          title: editFormData.title.trim(),
          description: editFormData.description.trim(),
          categories: editFormData.categories,
        }),
      );

      if (response.ok) {
        console.log("Edit successful");
        handleCloseModal();
        //navigate(0); // Refresh the page
        //if (onPostUpdate) onPostUpdate(); // Refresh parent data
      } else {
        const errorData = await response.json();
        console.error("Failed to update post:", errorData);
        alert(errorData.error || "Failed to update the post.");
      }
    } catch (error) {
      console.error("Error editing post:", error);
      alert("An error occurred while editing the post.");
    }
  };

  // Handle post deletion
  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    console.log("Attempting to delete post:", post.post_id);

    try {
      const response = await fetch(`${DB_HOST}/posts/${post.post_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        console.log("Deletion successful");
        alert("Post deleted successfully!");
        if (onPostUpdate) onPostUpdate(); // Refresh parent data
      } else {
        const errorData = await response.json();
        console.error("Failed to delete post:", errorData);
        alert(errorData.error || "Failed to delete the post.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("An error occurred while deleting the post.");
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
        maxWidth: 300,
        height: "100%",
        margin: "5px 8px",
      }}
    >
      {/* Article Image */}
      <Box
        component="img"
        src={post.article.preview || "https://via.placeholder.com/300x150"}
        alt={post.article.title}
        sx={{
          width: "100%",
          height: "150px",
          objectFit: "cover",
          backgroundColor: "#D0E8F2",
        }}
      />

      {/* Article Content */}
      <CardContent
        sx={{
          flex: "1 1 auto",
          padding: "10px",
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
          {post.article.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#5F848C",
            marginBottom: "8px",
            fontFamily: "Roboto",
          }}
        >
          {post.article.source}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#456268",
            marginBottom: "12px",
            fontFamily: "Roboto",
          }}
        >
          {post.description}
        </Typography>

        {/* Categories and Author */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {post.categories.map((category, index) => (
            <Chip
              key={index}
              label={category}
              size="small"
              sx={{
                backgroundColor: "#79A3B1",
                color: "#FCF8EC",
                marginRight: "4px",
              }}
            />
          ))}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              src={post.user.profile_picture || ""}
              alt={post.user.username}
              sx={{ bgcolor: "#D0E8F2", width: 30, height: 30 }}
            />
            <Typography
              variant="body2"
              sx={{
                marginLeft: "10px",
                color: "#21242A",
                fontFamily: "Roboto",
              }}
            >
              {post.user.username}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Actions */}
      {isOwner && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px",
            marginTop: "-20px",
            marginBottom: "4px",
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
            onClick={handleDeletePost}
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
        href={post.article.link}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          backgroundColor: "#5F848C",
          color: "#FCF8EC",
          fontWeight: "bold",
          borderRadius: "0 0 8px 8px",
          margin: "0",
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
            Edit Post
          </Typography>
          <TextField
            label="Title"
            name="title"
            value={editFormData.title || ""}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: "16px" }}
          />
          <TextField
            label="Description"
            name="description"
            value={editFormData.description || ""}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: "16px" }}
          />
          <TextField
            label="Link"
            name="link"
            value={editFormData.link || ""}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: "16px" }}
          />
          <FormControl fullWidth sx={{ marginBottom: "16px" }}>
            <InputLabel id="category-label">Categories</InputLabel>
            <Select
              labelId="category-label"
              id="categories"
              multiple
              value={editFormData.categories}
              onChange={handleCategoryChange}
              renderValue={(selected) => selected.join(", ")}
            >
              {["Science", "Technology", "Health", "Politics", "Education"].map(
                (category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <Button variant="contained" onClick={handleEditPost}>
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