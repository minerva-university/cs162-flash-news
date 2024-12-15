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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DB_HOST } from "../controllers/config.js";
import PostController from "../controllers/PostController";

// ALWAYS EXPECTS A POST OBJECT

const ArticleCard = ({ post, username, onEdit, onDelete }) => {
  const loggedInUsername = localStorage.getItem("username");
  const isOwner = username === loggedInUsername;
  const [categories, setCategories] = useState([]);

  // Initialize edit form state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    description: post?.description || "",
    categories: post?.categories || [],
  });

  // Open and close edit modal
  const handleOpenModal = () => {
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
  };

  // Handle Save Changes by calling onEdit function in parent component
  const handleSave = () => {
    onEdit(post.post_id, editFormData);
    handleCloseModal();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle category selection
  const handleCategoryChange = (event) => {
    const selectedCategories = event.target.value;
    setEditFormData((prev) => ({
      ...prev,
      categories: selectedCategories,
    }));
  };

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await PostController.getCategories();

        const categoryValues = response.categories.map(
          (cat) => cat.category_id,
        );
        setCategories(categoryValues);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Handle deleting for parent component
  const handleDelete = () => {
    onDelete(post.post_id);
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
        height: "400px",
        margin: "5px 8px",
      }}
    >
      {/* Handle Missing Preview */}

      <Box
        sx={{
          width: "100%",
          height: "200px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: post.article.preview ? "transparent" : "#f0f0f0",
          color: "#888",
          fontSize: "16px",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {post.article.preview ? (
          <img
            src={post.article.preview}
            alt={post.article.title || "Untitled Article"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        ) : (
          <Typography
            variant="h6"
            sx={{
              fontSize: "14px",
              color: "#888",
            }}
          >
            No Image Available
          </Typography>
        )}
      </Box>

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
          {post.article.title || "Untitled Article"}
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
          {(post?.categories || []).map((category, index) => (
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
              src={
                post.user.profile_picture
                  ? `${DB_HOST}/${post.user.profile_picture}`
                  : ""
              }
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
            onClick={handleDelete}
            sx={{
              color: "#5F848C",
              "&:hover": { color: "#A94442" },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}

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
            label="Description"
            name="description"
            value={editFormData.description || ""}
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
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <Button variant="contained" onClick={handleSave}>
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
