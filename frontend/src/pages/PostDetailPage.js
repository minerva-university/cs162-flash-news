import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
import CommentController from "../controllers/CommentController";

const PostDetailPage = () => {
  const { id } = useParams(); // from URL params
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  const handleAddComment = (comment, commentId) => {
    setComments([
      {
        comment_id: commentId,
        comment,
        user: {
          // @TODO: Replace with the currently logged in user's data
          username: "XXXTODO",
          profile_picture: "https://source.unsplash.com/random",
        },
        created_at: new Date().toISOString(),
      },
      ...comments,
    ]);
  };

  const getAllCommentsForPost = () => {
    if (!id) return;

    CommentController.getAllCommentsForPost(id)
      .then((response) => {
        setComments(response.comments);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (!id) return;

    PostController.getPost(id)
      .then((response) => {
        setPost(response);
        getAllCommentsForPost();
      })
      .catch((error) => console.log(error));
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
              title={post?.user.username}
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
          <Typography
            variant="h6"
            sx={{ marginTop: "2rem", marginBottom: "1rem" }}
          >
            Recent Comments
          </Typography>
          {comments &&
            comments.length > 0 &&
            comments.map((comment, index) => (
              <Card>
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
                  title={comment.user.username}
                  subheader={`commented on ${dayjs(comment.commented_at).format("MMM D, YYYY")}`}
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
            ))}
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
