import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function EditDeleteMenu({ id, onClose }) {
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
    <IconButton aria-label="settings" onClick={handleClick}>
      <MoreVertIcon />
      <Menu
        id={`edit-menu-${id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => handleClose("edit")}>Edit</MenuItem>
        <MenuItem onClick={() => handleClose("delete")}>Delete</MenuItem>
      </Menu>
    </IconButton>
  );
}
