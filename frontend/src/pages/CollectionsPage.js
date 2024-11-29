// src/pages/CollectionsPage.js
import React, { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import CollectionDetailModal from "../modals/CollectionDetailModal";
import "./CollectionsPage.css";

const CollectionsPage = ({ isOwner }) => {
  const [activeTab, setActiveTab] = useState("Public");
  // const [publicCollections, setPublicCollections] = useState([]);
  // const [privateCollections, setPrivateCollections] = useState([]);

  // TODO: Fetching collections articles function
  // Based on the active tab and the user's ownership, fetch the appropriate collections
  // const fetchCollections = async (tab) => {
  //  try {
  //  // Placeholder for fetching logic
  // await fetch(`${<backend_host>}/collections?type=${tab}`
  // { method: "GET", headers: HEADERS_WITH_JWT(user) });
  //    console.log(`Fetching ${tab} collections...`);

  //    if (tab === "Public") {
  //      setPublicCollections([]); // Replace with actual data
  //    } else {
  //      setPrivateCollections([]); // Replace with actual data
  //    }
  //  } catch (error) {
  //    console.error("Error fetching collections:", error);
  //  }
  //};

  // Draft of useEffect for handling backend fetching when the active tab changes
  //useEffect(() => {
  //  fetchCollections(activeTab);
  //}, [activeTab]);

  // TODO: Draft logic for expanding article as a preview
  // TODO: Draft logic for being rendered to the article page (navigate to post? navigate to the source?)

  return (
    <Box className="collections-page">
      <Box className="profile-section">
        <Avatar
          className="profile-avatar"
          sx={{ width: 70, height: 70, bgcolor: "#ddd" }}
        />
        <Box className="profile-content">
          <Typography
            className="profile-title"
            sx={{
              fontSize: "1.2em",
              fontWeight: "bold",
              marginLeft: 0,
              textAlign: "left",
            }}
          >
            My Collections
          </Typography>
          <Box className="tab-buttons">
            <button
              className={`button ${activeTab === "Public" ? "active" : ""}`}
              onClick={() => setActiveTab("Public")}
            >
              Public
            </button>
            <button
              className={`button ${activeTab === "Private" ? "active" : ""}`}
              onClick={() => setActiveTab("Private")}
            >
              Private
            </button>
          </Box>
          <Typography className="profile-subtext">
            View and manage your saved news articles.
          </Typography>
        </Box>
        <button className="add-link-button">Add New Link</button>
      </Box>
      <Divider className="divider" />
      {/* Always show the Public tab */}
      <CollectionDetailModal type="Public" />

      {/* TODO: add conditionally rendering of the Private tab only if the user is the owner {isOwner && (...)} */}
      {/* activeTab === "Private" && isOnwer && <CollectionDetailModal type="Private" /> */}
      <CollectionDetailModal type="Private" />
    </Box>
  );
};

export default CollectionsPage;
