import React, { useEffect, useRef, useState } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";

import Avatar from "@mui/material/Avatar";
import { Box, Button, Modal } from "@mui/material";
import TagsController from "../controllers/TagsController";
import MultipleSelectChip from "../components/MultipleSelectChip";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  maxWidth: "555px",
  bgcolor: "background.paper",
  boxShadow: 24,
  outline: "none",
  p: 4,
};

export default function AddPostForm() {
  const profile_picture = ""; // @TODO current user's profile picture
  const mainTextareaRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

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
    // @TODO: Nicer confirmation modal
    // const confirmation = confirm("Are you sure you want to exit? All changes will be lost.");
    // if (confirmation)

    setOpen(false);
  };

  // const handleTagAdd = (event) => {
  //   if (event.key === "Enter" && tagInput.trim() !== "") {
  //     setTagsData([...tags, { key: tags.length, label: tagInput }]);
  //     setTagInput("");
  //   }
  // };

  // const handleTagDelete = (tagToDelete) => () => {
  //   setTagsData((tags) => tags.filter((tag) => tag.key !== tagToDelete.key));
  // };

  return (
    <Card sx={{ width: "50%", maxWidth: "555px", margin: "0 auto 3rem" }}>
      <CardHeader
        avatar={
          <Avatar
            src={profile_picture ?? ""}
            sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
            aria-label="recipe"
          >
            R
          </Avatar>
        }
        title="What's new and interesting?"
        sx={{ cursor: "pointer", userSelect: "none" }}
        onClick={handleOpen}
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box sx={{ display: "flex", border: "1px" }}>
            <Avatar
              src={profile_picture ?? ""}
              sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
              aria-label="User Profile"
            >
              R
            </Avatar>
            
          </Box>
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
          <MultipleSelectChip
            id="categories-list"
            label="Select Categor(ies)"
            options={categories}
            max={5}
            sx={{ marginBottom: "1rem" }}
            onChange={(selected) => setSelectedCategories(selected)}
          />
          {/* Save Post */}
          <Button sx={{ marginLeft: "auto" }}>Save</Button>
        </Box>
      </Modal>
    </Card>
  );
}
