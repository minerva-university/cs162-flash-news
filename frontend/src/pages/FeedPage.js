import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import PostController from "../controllers/PostController";
import PostCard from "../components/PostCard";
import AddPostForm from "../forms/AddPostForm";
import FollowButton from "../components/FollowButton";

const FeedPage = () => {
  const [posts, setPosts] = useState(null);

  const getPosts = async () => {
    PostController.getFeedPosts().then((posts) => {
      setPosts(posts);
    });
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <Box style={{ padding: 20 }}>
      <AddPostForm onPostAdded={getPosts} />
      {posts &&
        posts.map((post) => (
          <PostCard key={post.post_id} post={post}>
            {/* Include FollowButton */}
            <FollowButton userId={post.user_id} />
          </PostCard>
        ))}
    </Box>
  );
};

export default FeedPage;
