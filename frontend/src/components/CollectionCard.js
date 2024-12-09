import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const CollectionCard = ({ collection, onClick, isOwner, onEdit, onDelete }) => {  
  return (
    <Box
      sx={{
        padding: "20px",
        border: "1px solid #DDD",
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        },
        position: "relative", 
      }}
      onClick={onClick}
    >
      {/* Emoji Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "16px",
          width: "50px",
          height: "50px",
          backgroundColor: "#F0F4F8",
          borderRadius: "50%",
          fontSize: "24px",
          color: "#5F848C",
        }}
      >
        {collection.emoji}
      </Box>

      {/* Name */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          marginBottom: "8px",
          fontFamily: "'Raleway', sans-serif",
          color: "#333",
        }}
      >
        {collection.title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          color: "gray",
          marginBottom: "16px",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        {collection.description}
      </Typography>

      {/* Articles Count */}
      <Typography
        variant="body2"
        sx={{
          fontStyle: "italic",
          color: "#666",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        {collection.articles_count} articles
      </Typography>

      {/* Edit and Delete Buttons */}
      {isOwner && (
        <Box
          sx={{
            position: "absolute",
            top: "10px",
            right: "10px",
            display: "flex",
            gap: "8px",
          }}
          onClick={(e) => e.stopPropagation()} // Prevent triggering the card's onClick
        >
          <IconButton
            onClick={() => onEdit(collection)}
            sx={{
              color: "#5F848C",
              "&:hover": { color: "#266a7a" },
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => onDelete(collection)}
            sx={{
              color: "#5F848C",
              "&:hover": { color: "#A94442" },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default CollectionCard;
