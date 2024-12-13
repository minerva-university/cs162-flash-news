import React, { useState, useEffect } from "react";
import ThemedButton from "../components/ThemedButton";
import PropTypes from "prop-types"; // For type-checking props

const FollowButton = ({ userId }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // Fetch initial following status
    const fetchFollowingStatus = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          console.error("Access token missing. User is not logged in.");
          return;
        }

        const response = await fetch(
          `http://127.0.0.1:5000/api/user/following`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const followingUsers = data.followed_users.map((user) => user.id);
          setIsFollowing(followingUsers.includes(userId));
        } else {
          console.error("Failed to fetch following status");
        }
      } catch (error) {
        console.error("Error fetching following status:", error);
      }
    };

    fetchFollowingStatus();
  }, [userId]);

  const handleFollowToggle = async () => {
    const endpoint = isFollowing
      ? `http://127.0.0.1:5000/api/user/unfollow/${userId}`
      : `http://127.0.0.1:5000/api/user/follow/${userId}`;

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("Access token missing. User is not logged in.");
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        const errorData = await response.json();
        console.error("Error toggling follow status:", errorData.message);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  return (
    <ThemedButton
      variant={isFollowing ? "contained" : "outlined"}
      onClick={handleFollowToggle}
      sx={{
        textTransform: "none",
        marginLeft: "auto",
        backgroundColor: "#D9EAF3",
        color: "#5F848C",
        fontWeight: "bold",
        fontFamily: "'Raleway', sans-serif",
        "&:hover": {
          backgroundColor: "#6b949c",
        },
      }}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </ThemedButton>
  );
};

FollowButton.propTypes = {
  userId: PropTypes.number.isRequired, // Ensure `userId` is passed as a prop
};

export default FollowButton;
