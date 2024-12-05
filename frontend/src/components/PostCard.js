import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import Avatar from "@mui/material/Avatar";
import { Box, Button, IconButton, Link } from "@mui/material";
import { ChatBubble, ThumbUp } from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PostController from "../controllers/PostController";

export default function PostCard({ post }) {
  dayjs.extend(relativeTime);

  const [expanded, setExpanded] = React.useState(false);
  const [liked, setLiked] = React.useState(post.is_liked);

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
    <Card sx={{ width: "90%", maxWidth: "555px", margin: "0 auto 2rem" }}>
      <CardHeader
        avatar={
          post.profile_picture ? (
            <Avatar
              src={post.profile_picture}
              sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
              aria-label="recipe"
            />
          ) : (
            <Avatar
              sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
              aria-label="recipe"
            >
              R
            </Avatar>
          )
        }
        title={post.user.username}
        subheader={dayjs(post.posted_at).fromNow()} // Format this date to X time ago
      />
      <CardMedia
        sx={{ height: 300 }}
        image={post.article.preview}
        title={post.article.title}
      />

      {/* @TODO: Should truncate very long descriptions, when "More" is clicked it'll expand the post */}
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
                {index == 2 && arr.length > 3 && !expanded && (
                  <Typography
                    variant="body2"
                    sx={{ cursor: "pointer" }}
                    onClick={() => setExpanded(true)}
                  >
                    ...more
                  </Typography>
                )}
              </Typography>
            );
          })}
      </CardContent>

      {/* Category Chips */}
      {/* @TODO: Make it clickable */}
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

      {/* @TODO: Implement card actions */}
      <CardActions>
        <IconButton
          aria-label="like"
          color={liked ? "primary" : "inherit"}
          onClick={handleLike}
        >
          <ThumbUp sx={{ marginRight: "0.5rem" }} />
          <Typography variant="body2">
            {post.likes_count != 0 && post.likes_count}
          </Typography>
        </IconButton>
        <IconButton
          aria-label="like"
          sx={{ color: "inherit" }}
          onClick={() => {
            console.log("Comment on post");
          }}
        >
          <ChatBubble sx={{ marginRight: "0.5rem" }} />
          <Typography variant="body2">
            {post.comments_count != 0 && post.comments_count}
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
