import * as React from "react";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
  Box,
  Button,
  IconButton,
  Link,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material";
import { ChatBubble, ThumbUp } from "@mui/icons-material";
import PostController from "../controllers/PostController";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { DB_HOST } from "../controllers/config.js";

dayjs.extend(relativeTime);

export default function PostCard({ post }) {
  const [expanded, setExpanded] = React.useState(false);
  const [liked, setLiked] = React.useState(post.is_liked);
  const navigate = useNavigate();

  const handleLike = () => {
    const newLikeStatus = !liked;
    PostController.likeOrUnlikePost(post.post_id, newLikeStatus)
      .then(() => {
        setLiked(newLikeStatus);
        post.likes_count += newLikeStatus ? 1 : -1;
      })
      .catch((error) => console.error(error));
  };

  return (
    <Card
      sx={{
        width: "90%",
        maxWidth: "555px",
        margin: "0 auto 2rem",
        height: "530px",
      }}
    >
      <Link
        href={`/profile/${post.user.username}`}
        title="View Profile"
        underline="none"
      >
        <CardHeader
          avatar={
            post.user.profile_picture ? (
              <Avatar
                src={`${DB_HOST}${post.user.profile_picture}`}
                sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
                aria-label="Profile Picture"
              />
            ) : (
              <Avatar
                sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
                aria-label="Profile Picture"
              >
                {post.user.username[0].toUpperCase()}
              </Avatar>
            )
          }
          title={post.user.username}
          subheader={dayjs(post.posted_at).fromNow()} // Format this date to X time ago
        />
      </Link>
      <Link
        href={`/post/${post.post_id}`}
        title="View post details"
        underline="none"
      >
        <Box
          sx={{
            backgroundColor: "#fcf8ec",
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!post.article.preview ? (
            <Typography variant="h6">No preview image available</Typography>
          ) : (
            <CardMedia
              sx={{
                height: 300,
                width: "100%",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              image={post.article.preview}
            />
          )}
        </Box>
      </Link>

      {/* Post Description */}
      <CardContent>
        {post.description &&
          post.description.split("\n").map((line, index, arr) => {
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  color: "text.secondary",
                  marginBottom: "1rem",
                  display: expanded || index < 3 ? "block" : "none",
                }}
              >
                {line}
                {index === 2 && arr.length > 3 && !expanded && (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setExpanded(true)}
                  >
                    ...more
                  </span>
                )}
              </Typography>
            );
          })}
      </CardContent>
      {/* Category Chips */}
      {post.categories && (
        <Box sx={{ padding: "0 16px" }}>
          {post.categories.map((category) => (
            <Chip
              key={category}
              label={category}
              variant="outlined"
              size="small"
              sx={{ marginRight: "0.5rem" }}
            />
          ))}
        </Box>
      )}

      {/* Card Actions - Like and Comment */}
      <CardActions>
        <IconButton
          aria-label="like"
          color={liked ? "primary" : "inherit"}
          onClick={handleLike}
        >
          <ThumbUp sx={{ marginRight: "0.5rem" }} />
          <Typography variant="body2">
            {post.likes_count !== 0 && post.likes_count}
          </Typography>
        </IconButton>
        <IconButton
          aria-label="like"
          sx={{ color: "inherit" }}
          onClick={() => navigate(`/post/${post.post_id}`)}
        >
          <ChatBubble sx={{ marginRight: "0.5rem" }} />
          <Typography variant="body2">
            {post.comments_count !== 0 && post.comments_count}
          </Typography>
        </IconButton>
        <Button
          sx={{
            marginLeft: "auto !important",
            "&:hover": {
              color: "#F6F5EE", // Beige from palette on hover
            },
          }}
        >
          <Link
            href={post.article.link}
            sx={{
              color: "inherit",
            }}
            underline="none"
            target="_blank"
            rel="noopener"
          >
            View Article
          </Link>
        </Button>
      </CardActions>
    </Card>
  );
}
