import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CommentController from "../controllers/CommentController";
import PostController from "../controllers/PostController";

import {
  Avatar,
  Box,
  Button,
  Link,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
} from "@mui/material";
import AddCommentForm from "../forms/AddCommentForm";
import dayjs from "dayjs";
import EditDeleteMenu from "../components/EditDeleteMenu";
import UsernameAndOPChip from "../components/UsernameAndOPChip";

const PostDetailPage = () => {
  const navigate = useNavigate();
  const CURRENT_USERNAME = "lmao8109"; // @TODO: Replace with the currently logged in user's username (get from localStorage)
  const { id } = useParams(); // from URL params
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(-1);
  // @TODO need to allow editing the tags and whatnot

  const handleAddComment = (comment, commentId) => {
    setComments([
      {
        comment_id: commentId,
        comment,
        user: {
          // @TODO: Replace with the currently logged in user's data
          username: CURRENT_USERNAME,
          profile_picture: "https://source.unsplash.com/random",
        },
        created_at: new Date().toISOString(),
      },
      ...comments,
    ]);
  };

  const handlePostEditOrDelete = (postID, selectedItem) => {
    if (selectedItem === "delete") {
      // Confirm before deleting the post
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this post? This cannot be undone!"
      );
      if (confirmDelete) {
        PostController.deletePost(postID).then(() => navigate("/feed"));
      }
    } else {
      // Change the card to editing mode
      setIsEditingPost(true);
    }
  };
  const handleCommentEditOrDelete = (commentID, selectedItem) => {
    if (selectedItem === "delete") {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this comment?"
      );
      if (confirmDelete) {
        CommentController.deleteComment(commentID).then(() =>
          setComments(
            comments.filter((comment) => comment.comment_id !== commentID)
          )
        );
      }
    } else {
      // Change the relevant card to editing mode
      setIsEditingComment(commentID);
    }
  };

  const handleEditComment = (comment, commentId) => {
    
  }

  const getAllCommentsForPost = () => {
    if (!id) return;

    CommentController.getAllCommentsForPost(id)
      .then((response) => {
        setComments(response.comments);
      })
      .catch((error) => console.log(error));
  };

  const getPostDetails = () => {
    // Get the post's details
    PostController.getPost(id)
      .then((response) => {
        setPost(response);
        getAllCommentsForPost();
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (!id) return;

    getPostDetails();
  }, [id]);

  return post ? (
    <>
      {/* Post Detail Page Header */}
      <Box
        sx={{
          backgroundColor: "primary.main",
          height: "40vh",
          padding: "2rem",
          background: `linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(0, 0, 00, 1)), url(${post?.article.preview})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "multiply",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          color: "white",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            width: "60vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" style={{ marginBottom: "1.5rem" }}>
            {post?.article.title}
          </Typography>
        </Box>
      </Box>

      {/* Main content - 2 column layout */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          margin: "2rem auto",
        }}
      >
        {/* First Column - The original post and comments */}
        <Box
          sx={{
            width: "90%",
            maxWidth: "555px",
            marginRight: "2rem",
          }}
        >
          <Card sx={{ marginBottom: "1rem" }}>
            <CardHeader
              avatar={
                post?.profile_picture ? (
                  <Avatar
                    src={post.profile_picture}
                    sx={(theme) => ({
                      bgcolor: theme.palette.primary.main,
                    })}
                    aria-label="Profile Picture"
                  />
                ) : (
                  <Avatar
                    sx={(theme) => ({
                      bgcolor: theme.palette.primary.main,
                    })}
                    aria-label="Profile Picture"
                  >
                    {post?.user.username[0].toUpperCase()}
                  </Avatar>
                )
              }
              title={
                <UsernameAndOPChip username={post?.user.username} isOP={true} />
              }
              // @TODO: Only show if the current post belongs to the currently logged in user
              action={
                post?.user.username === CURRENT_USERNAME && (
                  <EditDeleteMenu
                    id={post.post_id}
                    onClose={handlePostEditOrDelete}
                  />
                )
              }
            />
            <CardContent>
              {post?.description &&
                post.description.split("\n").map((line, index) => {
                  return (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        marginBottom: "1rem",
                      }}
                    >
                      {line}
                    </Typography>
                  );
                })}
            </CardContent>
          </Card>

          {/* Add Comment Form */}
          <AddCommentForm post={post} onCommentAdded={handleAddComment} />

          {/* Comments Section (desc order of created_at) */}
          {comments && comments.length > 0 && (
            <>
              <Typography
                variant="h6"
                sx={{ marginTop: "2rem", marginBottom: "1rem" }}
              >
                Recent Comments
              </Typography>

              {comments.map((comment, index) =>
                comment.comment_id === isEditingComment ? (
                  <AddCommentForm
                    post={post}
                    onCommentAdded={handleEditComment}
                  />
                ) : (
                  <Card key={`comment-${index}`}>
                    <CardHeader
                      avatar={
                        comment.user.profile_picture ? (
                          <Avatar
                            src={comment.user.profile_picture}
                            sx={(theme) => ({
                              bgcolor: theme.palette.primary.main,
                            })}
                            aria-label="Profile Picture"
                          />
                        ) : (
                          <Avatar
                            sx={(theme) => ({
                              bgcolor: theme.palette.primary.main,
                            })}
                            aria-label="Profile Picture"
                          >
                            {comment.user.username[0].toUpperCase()}
                          </Avatar>
                        )
                      }
                      title={
                        <UsernameAndOPChip
                          username={comment.user.username}
                          isOP={comment.user.username === post.user.username}
                        />
                      }
                      subheader={`commented on ${dayjs(comment.commented_at).format("MMM D, YYYY")}`}
                      // @TODO: Only show if the current comment belongs to the currently logged in user
                      action={
                        post?.user.username === CURRENT_USERNAME && (
                          <EditDeleteMenu
                            id={comment.comment_id}
                            onClose={handleCommentEditOrDelete}
                          />
                        )
                      }
                    />
                    <CardContent>
                      {comment.comment &&
                        comment.comment.split("\n").map((line, index) => {
                          return (
                            <Typography
                              key={index}
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                marginBottom: "1rem",
                              }}
                            >
                              {line}
                            </Typography>
                          );
                        })}
                    </CardContent>
                  </Card>
                )
              )}
            </>
          )}
        </Box>

        {/* Second Column - The article details */}
        <Card sx={{ position: "sticky", top: 0, width: "30vw" }}>
          <CardHeader title={"About This Article"} />
          <CardContent sx={{ display: "flex" }}>
            <img
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                objectPosition: "center",
              }}
              src={post?.article.preview}
              alt={post?.article.title}
            />
            <Box sx={{ padding: "0 1rem" }}>
              <Typography
                variant="h6"
                sx={{ marginBottom: "0.5rem", fontSize: 16 }}
              >
                {post?.article.title.length > 40
                  ? `${post?.article.title.slice(0, 40)}...`
                  : post?.article.title}
              </Typography>
              <Typography variant="body2">
                {post?.article.caption.length > 40
                  ? `${post?.article.caption.slice(0, 40)}...`
                  : post?.article.caption}
              </Typography>
            </Box>
          </CardContent>
          <CardActions>
            <Button
              sx={{
                marginLeft: "auto !important",
                "&:hover": {
                  color: "#F6F5EE", // Beige from palette on hover
                },
              }}
            >
              <Link
                href={post?.article.link}
                sx={{
                  color: "inherit",
                }}
                underline="none"
                target="_blank"
                rel="noopener"
              >
                View on {post?.article.source}
              </Link>
            </Button>
          </CardActions>
        </Card>
      </Box>
    </>
  ) : (
    <Typography variant="h5" sx={{ margin: "1rem" }}>
      Post not found. Click here to{" "}
      <Link href="/feed">go back to the feed.</Link>
    </Typography>
  );
};

export default PostDetailPage;
