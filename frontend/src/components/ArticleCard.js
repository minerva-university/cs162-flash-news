import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ArticleCard = ({ article, isOwner, onEdit, onDelete }) => {
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
            onClick={() => onEdit(article)}
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
    </Card>
  );
};

export default ArticleCard;
