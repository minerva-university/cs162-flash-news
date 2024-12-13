import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import PostController from "../controllers/PostController";
import PostCard from "../components/PostCard";
import AddPostForm from "../forms/AddPostForm";
import FollowButton from "../components/FollowButton";

const FeedPage = () => {
  const [posts, setPosts] = useState([]); // Initialize as an empty array

  const getPosts = async () => {
    try {
      const response = await PostController.getFeedPosts();
      setPosts(response.posts || []); 
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]); 
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <Box style={{ padding: 20 }}>
      <AddPostForm onPostAdded={getPosts} />
      {posts.map((post) => (
        <PostCard key={post.post_id} post={post}>
          <FollowButton userId={post.user_id} />
        </PostCard>
      ))}
    </Box>
  );
};

export default FeedPage;
