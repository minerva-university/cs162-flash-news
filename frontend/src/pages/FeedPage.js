import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import PostController from "../controllers/PostController";
import PostCard from "../components/PostCard";
import AddPostForm from "../forms/AddPostForm";

const FeedPage = () => {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    PostController.getAll().then((posts) => {
      setPosts(posts);
    });
  }, []);

  return (
    <Box style={{ padding: 20 }}>
      <AddPostForm />
      {posts && 
        posts.posts.map((post) => <PostCard key={post.post_id} post={post} />)}
    </Box>
  );
};

export default FeedPage;
