import { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function EditDeleteMenu({
  id,
  deleteOnly,
  onClose,
  editLabel,
  deleteLabel,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (selectedItem) => {
    if (selectedItem) onClose(id, selectedItem);
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton aria-label="settings" onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`edit-menu-${id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {!deleteOnly && (
          <MenuItem onClick={() => handleClose("edit")}>
            <EditIcon sx={{ marginRight: "0.5rem" }} /> {editLabel ?? "Edit"}
          </MenuItem>
        )}
        <MenuItem
          sx={{ color: "#f44336" }}
          onClick={() => handleClose("delete")}
        >
          <DeleteIcon sx={{ marginRight: "0.5rem" }} />{" "}
          {deleteLabel ?? "Delete"}
        </MenuItem>
      </Menu>
    </>
  );
}
