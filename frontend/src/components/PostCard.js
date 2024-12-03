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

export default function PostCard({ post }) {
  dayjs.extend(relativeTime);

  return (
    <Card sx={{ width: "50%", maxWidth: "555px", margin: "0 auto 2rem" }}>
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
        title={post.username}
        subheader={dayjs(post.posted_at).fromNow()} // Format this date to X time ago
      />
      <CardMedia sx={{ height: 300 }} image={post.article.preview} title={post.article.title} />

      {/* @TODO: Should truncate very long descriptions, when "More" is clicked it'll expand the post */}
      <CardContent>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", marginBottom: "1rem" }}
        >
          {post.description}
        </Typography>
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
            />
          ))}
        </Box>
      )}

      {/* @TODO: Implement card actions */}
      <CardActions>
        <IconButton
          aria-label="like"
          color={post.liked ? "secondary" : "inherit"}
          onClick={() => {
            console.log("Like this post");
          }}
        >
          <ThumbUp />
        </IconButton>
        <IconButton
          aria-label="like"
          onClick={() => {
            console.log("Comment on post");
          }}
        >
          <ChatBubble />
        </IconButton>
        <Button sx={{ marginLeft: "auto !important" }}>
          <Link
            href={post.article.link}
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
