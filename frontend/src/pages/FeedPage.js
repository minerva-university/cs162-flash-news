import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Masonry from "@mui/lab/Masonry";
import Box from "@mui/material/Box";
import PostController from "../controllers/PostController";
import PostCard from "../components/PostCard";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    PostController.getAll().then((posts) => {
      setPosts(posts);
    });
  }, []);

  return (
    <div>
      <h1>Feed</h1>
      <p>Render the form to add a post</p>
      <Box style={{ padding: 20 }}>
        {posts &&
          posts.map((post) => <PostCard key={post.post_id} post={post} />)}
      </Box>
    </div>
  );
};

export default FeedPage;
