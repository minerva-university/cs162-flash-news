import React, { useEffect, useRef, useState } from "react";
import {Card, CardHeader} from "@mui/material";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";

import Avatar from "@mui/material/Avatar";
import {
  Box,
  Button,
  InputLabel,
  FormControl,
  Modal,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import TagsController from "../controllers/TagsController";
import MultipleSelectChip from "../components/MultipleSelectChip";
import PostController from "../controllers/PostController";

// Style for the modal
const style = {
  position: "absolute",
  left: "50%",
  transform: "translate(-50%, 0)",
  width: "50%",
  maxWidth: "555px",
  bgcolor: "background.paper",
  boxShadow: 24,
  outline: "none",
  p: 4,
  margin: "1rem",
};

export default function AddPostForm({ onPostAdded }) {
  // @TODO: MISSING OPTION TO ADD TO THE USER'S COLLECTION(S)
  const profile_picture = ""; // @TODO current user's profile picture
  const mainTextareaRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [postVisibility, setPostVisibility] = useState("public");
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");

  const [ogMetadata, setOgMetadata] = useState(null);

  const resetAddPostForm = () => {
    // Reset data
    setOgMetadata(null);
    setLink("");
    setLinkError("");
    setCategories([]);
    mainTextareaRef.current.value = "";
  };

  const handleOpen = async () => {
    // Reset inputs
    setOpen(true);
    setSelectedCategories([]);

    // Get all tags in the database
    const categories = await TagsController.getAll();
    setCategories(categories);

    if (mainTextareaRef && mainTextareaRef.current)
      mainTextareaRef.current.focus();
  };

  const handleClose = () => {
    const confirmation = window.confirm(
      "Are you sure you want to exit? All changes will be lost.",
    );
    if (confirmation) {
      resetAddPostForm();

      // Close the modal
      setOpen(false);
    }
  };

  const handleSave = () => {
    if (!mainTextareaRef.current.value) {
      alert("Please type a few meaningful words!");
      return;
    }

    if (!link) {
      alert("Please provide a link!");
      return;
    }

    // Save the post
    const post = {
      ...ogMetadata,
      article_link: link,
      post_description: mainTextareaRef.current.value,
      categories: selectedCategories,
      visibility: postVisibility,
    };

    PostController.createPost(post)
      .then((response) => {
        resetAddPostForm();

        // Refresh the feed using the callback function
        if (onPostAdded) onPostAdded();

        setOpen(false);
      })
      .catch((error) => console.error(error));
  };

  const handleVisibilityChange = (event) => {
    setPostVisibility(event.target.value);
  };

  function isValid(url) {
    const pattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w]*)*.*$/g;
    return pattern.test(url);
  }

  const parseLink = (event) => {
    const url = event.target.value;
    if (!url || !isValid(url)) {
      setLinkError("Please enter a valid link");
      setOgMetadata(null);
      return;
    }

    setLinkError("");
    setLink(url);
    getOGMetadata(url);
  };

  const getOGMetadata = async (url) => {
    PostController.getOGMetadata(url)
      .then((metadata) => {
        setOgMetadata(metadata);
      })
      .catch((error) => setLinkError("Could not get link details. You can still create a post though!"));
  };

  return (
    <Card sx={{ width: "50%", maxWidth: "555px", margin: "0 auto 3rem" }}>
      <CardHeader
        avatar={
          <Avatar
            src={profile_picture ?? ""}
            sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
            aria-label="Profile Picture"
          >
            R
          </Avatar>
        }
        title="What's new and interesting?"
        sx={{ cursor: "pointer", userSelect: "none" }}
        onClick={handleOpen}
      />

      {/* New Post Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ overflowY: "scroll", marginBottom: "2rem" }}
      >
        <Box sx={style}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px",
              marginBottom: "1rem",
            }}
          >
            <Avatar
              src={profile_picture ?? ""}
              sx={(theme) => ({
                bgcolor: theme.palette.primary.main,
                marginRight: "1rem",
              })}
              aria-label="User Profile"
            >
              R
            </Avatar>
            <TextField
              fullWidth
              id="link"
              label="Share a Link"
              variant="outlined"
              onChange={parseLink}
              onKeyDown={(e) =>
                e.key === "Enter" && getOGMetadata(e.target.value)
              }
              error={linkError != ""}
              helperText={linkError}
              required
            />
          </Box>
          {link != "" && (
            <>
              {/* OG Image (if any) */}
              {ogMetadata?.image && (
                <img
                  src={ogMetadata.image}
                  alt={ogMetadata.title}
                  style={{ height: "300px", width: "100%", objectFit: "cover" }}
                />
              )}

              <h2>{ogMetadata?.title}</h2>

              {/* Main Textarea */}
              <TextareaAutosize
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  marginTop: "1rem",
                  marginBottom: "1rem",
                }}
                ref={mainTextareaRef}
                aria-label="minimum height"
                minRows={7}
                placeholder="What's on your mind?"
              />
              {/* Categories */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <MultipleSelectChip
                  id="categories-list"
                  label="Select Categories"
                  options={categories}
                  max={5}
                  sx={{ marginRight: "1rem" }}
                  onChange={(selected) => setSelectedCategories(selected)}
                />
                <FormControl sx={{ width: "50%" }}>
                  <InputLabel id="post-visibility-label">
                    Post Visibility
                  </InputLabel>
                  <Select
                    labelId="post-visibility-label"
                    id="post-visibility"
                    value={postVisibility}
                    label="Post Visibility"
                    onChange={handleVisibilityChange}
                  >
                    <MenuItem value={"public"}>Public</MenuItem>
                    <MenuItem value={"private"}>Private</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {/* Save Post */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button sx={{ marginLeft: "auto" }} onClick={handleSave}>
                  Save
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Card>
  );
}
