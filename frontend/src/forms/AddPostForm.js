import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, Typography } from "@mui/material";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";

import Avatar from "@mui/material/Avatar";
import { Box, Button, Modal, TextField } from "@mui/material";
import MultipleSelectChip from "../components/MultipleSelectChip";
import PostController from "../controllers/PostController";
import UserController from "../controllers/UserController";
import CollectionController from "../controllers/CollectionController";
import { DB_HOST } from "../controllers/config.js";

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
  const username = localStorage.getItem("username");
  const [userID, setUserID] = useState(0);
  const [profile_picture, setProfilePicture] = useState("");
  const mainTextareaRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionsByTitle, setCollectionsByTitle] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");

  const [ogMetadata, setOgMetadata] = useState(null);

  const resetAddPostForm = () => {
    // Reset data
    setOgMetadata(null);
    setLink("");
    setLinkError("");
    setCategories([]);
    if (mainTextareaRef && mainTextareaRef.current)
      mainTextareaRef.current.value = "";
  };

  const handleOpen = async () => {
    // Reset inputs
    setOpen(true);
    setSelectedCategories([]);

    // Get all tags in the database
    const availableCategories = await PostController.getCategories();
    if (
      availableCategories &&
      availableCategories.categories &&
      availableCategories.categories.length > 0
    )
      setCategories(availableCategories?.categories?.map((c) => c.category_id));

    // Get all collections for the user
    const collectionResponse =
      await CollectionController.getAllCollectionsForUser(userID);

    // display this in multiple select chip
    if (
      collectionResponse &&
      (collectionResponse.private.length > 0 ||
        collectionResponse.public.length > 0)
    ) {
      const collectionsKeyedByTitle = {};

      const finalCollections = [
        ...collectionResponse.private.map((c) => {
          const title = `(Private) ${c.title}`;
          collectionsKeyedByTitle[title] = c.collection_id;
          return title;
        }),
        ...collectionResponse.public.map((c) => {
          const title = `(Public) ${c.title}`;
          collectionsKeyedByTitle[title] = c.collection_id;
          return title;
        }),
      ];

      setCollections(finalCollections);
      setCollectionsByTitle(collectionsKeyedByTitle);
    }

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

  const handleSave = async () => {
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
    };

    const response = await PostController.createPost(post);
    if (response.post_id) {
      // Add the post to the selected collections
      await Promise.all(
        selectedCollections.map((title) =>
          CollectionController.addPostToCollection(
            collectionsByTitle[title],
            response.post_id,
          ),
        ),
      );

      resetAddPostForm();

      // Refresh the feed using the callback function
      if (onPostAdded) onPostAdded();

      setOpen(false);
    }
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
      .catch((error) =>
        setLinkError(
          "Could not get link details. You can still create a post though!",
        ),
      );
  };

  useEffect(() => {
    UserController.getCurrentUserDetails(username).then((data) => {
      setUserID(data.data.user_id);
      setProfilePicture(`${DB_HOST}${data.data.profile_picture}`);
    });
  }, []);

  return (
    <Card sx={{ width: "50%", maxWidth: "555px", margin: "0 auto 3rem" }}>
      <CardHeader
        avatar={
          <Avatar
            src={profile_picture ?? ""}
            sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
            aria-label="Profile Picture"
          >
            {username[0].toUpperCase()}
          </Avatar>
        }
        title="What's new and interesting?"
        sx={{ cursor: "pointer", userSelect: "none" }}
        onClick={handleOpen}
        action={
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "gray",
              whiteSpace: "nowrap",
              marginRight: "1rem",
              alignItems: "center",
              marginTop: "14px",
              height: "90%",
            }}
          >
            Make Post
          </Typography>
        }
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
              {username[0].toUpperCase()}
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
              error={linkError !== ""}
              helperText={linkError}
              required
            />
          </Box>
          {link !== "" && (
            <>
              {/* OG Image (if any) */}
              {ogMetadata?.image && (
                <img
                  src={ogMetadata.image}
                  alt={ogMetadata.title}
                  style={{ height: "300px", width: "100%", objectFit: "cover" }}
                />
              )}

              <Typography
                variant="h5"
                fontWeight={"bold"}
                sx={{ marginTop: "0.5rem" }}
              >
                {ogMetadata?.title}{" "}
                {ogMetadata?.site_name && `| ${ogMetadata?.site_name}`}
              </Typography>

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

              {/* Collections */}
              <MultipleSelectChip
                id="collections-list"
                label="Add Post to Collection(s)"
                options={collections}
                max={-1}
                sx={{ marginBottom: "1rem" }}
                onChange={(selected) => setSelectedCollections(selected)}
              />

              {/* Categories */}
              <MultipleSelectChip
                id="categories-list"
                label="Select Categories"
                options={categories}
                max={5}
                sx={{ marginBottom: "1rem" }}
                onChange={(selected) => setSelectedCategories(selected)}
              />

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
