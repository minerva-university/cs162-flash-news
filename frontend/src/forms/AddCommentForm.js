import React, { useRef } from "react";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";

import { Avatar, Box, Card, CardHeader, CardContent } from "@mui/material";
import ThemedButton from "../components/ThemedButton";
import CommentController from "../controllers/CommentController";
import { DB_HOST } from "../controllers/config.js";

export default function AddCommentForm({ post, onCommentAdded }) {
  const CURRENT_USERNAME = localStorage.getItem("username");
  const profile_picture = localStorage.getItem("profile_picture");
  const mainTextareaRef = useRef(null);

  const addComment = async () => {
    const comment = mainTextareaRef.current.value;
    if (!comment || !post) return;

    CommentController.createComment(post.post_id, comment).then((result) => {
      if (onCommentAdded) onCommentAdded(comment, result.comment_id);

      // Reset the textarea
      mainTextareaRef.current.value = "";
    });
  };

  return (
    <Card>
      {/* @TODO: Put the currently logged in user's profile picture */}
      <CardHeader
        avatar={
          profile_picture ? (
            <Avatar
              src={`${DB_HOST}${profile_picture}`}
              sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
              aria-label="Profile Picture"
            />
          ) : (
            <Avatar
              sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
              aria-label="Profile Picture"
            >
              {CURRENT_USERNAME[0].toUpperCase()}
            </Avatar>
          )
        }
        title={CURRENT_USERNAME}
      />
      <CardContent>
        {/* Main Textarea */}
        <TextareaAutosize
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            marginBottom: "1rem",
          }}
          ref={mainTextareaRef}
          aria-label="minimum height"
          minRows={3}
          placeholder={`Leave a comment`}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <ThemedButton sx={{ marginLeft: "auto" }} onClick={addComment}>
            Comment
          </ThemedButton>
        </Box>
      </CardContent>
    </Card>
  );
}
