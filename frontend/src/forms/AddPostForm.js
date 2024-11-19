import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";

import Avatar from "@mui/material/Avatar";
import { Box, Modal } from "@mui/material";

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
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    // @TODO: Nicer confirmation modal
    // const confirmation = confirm("Are you sure you want to exit? All changes will be lost.");
    // if (confirmation)

    setOpen(false);
  };

  return (
    <Card sx={{ width: "50%", maxWidth: "555px", margin: "0 auto 3rem" }}>
      <CardHeader
        avatar={
          profile_picture ? (
            <Avatar
              src={profile_picture}
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
          {profile_picture ? (
            <Avatar
              src={profile_picture}
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
          )}
          <TextareaAutosize
            aria-label="minimum height"
            minRows={3}
            placeholder="What's on your mind?"
          />
        </Box>
      </Modal>
    </Card>
  );
}
