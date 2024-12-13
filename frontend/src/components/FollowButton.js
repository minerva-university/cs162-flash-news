import React, { useState } from "react";
import { Button } from "@mui/material";

const FollowButton = ({ userId }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowToggle = () => {
    // Placeholder function for API call
    if (!isFollowing) {
      console.log(`Following user: ${userId}`);
      // Call API to follow the user
    } else {
      console.log(`Unfollowing user: ${userId}`);
      // Call API to unfollow the user
    }
    setIsFollowing(!isFollowing);
  };

  return (
    <Button
      variant={isFollowing ? "contained" : "outlined"}
      color="primary"
      onClick={handleFollowToggle}
      sx={{
        textTransform: "none",
        marginLeft: "auto",
        display: "block",
      }}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};

export default FollowButton;
