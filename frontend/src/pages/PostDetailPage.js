import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import CommentController from "../controllers/CommentController";
import PostController from "../controllers/PostController";
import TagController from "../controllers/TagController";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import {
  Avatar,
  Box,
  Button,
  Link,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Chip,
  Typography,
  TextareaAutosize,
} from "@mui/material";
import AddCommentForm from "../forms/AddCommentForm";
import dayjs from "dayjs";
import EditDeleteMenu from "../components/EditDeleteMenu";
import UsernameAndOPChip from "../components/UsernameAndOPChip";
import ThemedButton from "../components/ThemedButton";
import MultipleSelectChip from "../components/MultipleSelectChip";
import { DB_HOST } from "../controllers/config.js";

const PostDetailPage = () => {
  const navigate = useNavigate();
  const CURRENT_USERNAME = localStorage.getItem("username");
  const CURRENT_PROFILE_PICTURE = localStorage.getItem("profile_picture");
  const { id } = useParams(); // from URL params
  const [post, setPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [comments, setComments] = useState([]);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const mainTextareaRef = useRef(null);

  const handleAddComment = (comment, commentId) => {
    setComments([
      {
        comment_id: commentId,
        comment,
        user: {
          username: CURRENT_USERNAME,
          profile_picture: `${CURRENT_PROFILE_PICTURE}`,
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
        "Are you sure you want to delete this post? This cannot be undone!",
      );
      if (confirmDelete) {
        PostController.deletePost(postID).then(() => navigate("/feed"));
      }
    } else if (selectedItem === "edit") {
      // Change the card to editing mode
      setIsEditingPost(true);
      mainTextareaRef.current.value = post.description;
    }
  };
  const handleCommentDelete = (commentID, selectedItem) => {
    // You can't edit your comments! Accept the consequences of your actions!
    if (selectedItem === "delete") {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this comment?",
      );
      if (confirmDelete) {
        CommentController.deleteComment(commentID).then(() =>
          setComments(
            comments.filter((comment) => comment.comment_id !== commentID),
          ),
        );
      }
    }
  };

  const savePostEdit = () => {
    const newDescription = mainTextareaRef.current.value;
    if (!newDescription || !post) return;

    const newPost = {
      post_description: newDescription,
      categories: selectedCategories,
    };

    PostController.updatePost(post.post_id, newPost).then(() => {
      setPost({
        ...post,
        description: newDescription,
        categories: selectedCategories,
      });
      setIsEditingPost(false);
    });
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

    // Get the post's details
    PostController.getPost(id)
      .then((response) => {
        setPost(response);
        setSelectedCategories(response.categories);
        getAllCommentsForPost();
      })
      .catch((error) => console.log(error));

    // Get all tags in the database
    TagController.getAll().then((response) => {
      if (response && response.categories && response.categories.length > 0)
        setCategories(response?.categories?.map((c) => c.category_id));
    });
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
          <Card sx={{ marginBottom: "1.5rem" }}>
            <CardHeader
              avatar={
                post?.user.profile_picture ? (
                  <Avatar
                    src={`${DB_HOST}${post.user.profile_picture}`}
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
              // Only show if the current post belongs to the currently logged in user
              action={
                post?.user.username === CURRENT_USERNAME && (
                  <EditDeleteMenu
                    id={post.post_id}
                    editLabel={"Edit Post"}
                    deleteLabel={"Delete Post"}
                    onClose={handlePostEditOrDelete}
                  />
                )
              }
            />
            {/* Post Content (Viewing Mode) */}
            {!isEditingPost && (
              <CardContent>
                {post?.description.split("\n").map((line, index) => {
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
                {/* Category Chips */}
                {post.categories && post.categories.length > 0 && (
                  <Box
                    sx={{
                      marginTop: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <LocalOfferIcon
                      fontSize="small"
                      sx={{ marginRight: "0.5rem" }}
                    />
                    {post.categories.map((category) => (
                      <Chip
                        key={category}
                        label={category}
                        variant="outlined"
                        size="small"
                        sx={{ marginRight: "0.5rem" }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            )}
            {/* Post in Editing Mode */}
            <CardContent sx={{ display: isEditingPost ? "block" : "none" }}>
              <TextareaAutosize
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  marginBottom: "1rem",
                }}
                ref={mainTextareaRef}
                aria-label="minimum height"
                minRows={3}
                placeholder={`What's on your mind?`}
              />

              {/* Categories */}
              <MultipleSelectChip
                id="categories-list"
                label="Select Categories"
                options={categories}
                max={5}
                sx={{ marginBottom: "1rem" }}
                alreadySelected={selectedCategories}
                onChange={(selected) => setSelectedCategories(selected)}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <ThemedButton onClick={() => setIsEditingPost(false)}>
                  Cancel
                </ThemedButton>
                <ThemedButton
                  sx={{ marginLeft: "auto" }}
                  onClick={savePostEdit}
                >
                  Save Post
                </ThemedButton>
              </Box>
            </CardContent>
          </Card>

          {/* Add Comment Form */}
          <AddCommentForm post={post} onCommentAdded={handleAddComment} />

          {/* Comments Section (desc order of created_at) */}
          {comments && comments.length > 0 && (
            <>
              <Typography
                variant="h6"
                sx={{ marginTop: "2.5rem", marginBottom: "1rem" }}
              >
                Recent Comments
              </Typography>

              {comments.map((comment, index) => (
                <Card key={`comment-${index}`} sx={{ marginBottom: "1rem" }}>
                  <CardHeader
                    avatar={
                      comment.user.profile_picture ? (
                        <Avatar
                          src={`${DB_HOST}${comment.user.profile_picture}`}
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
                      comment.user.username === CURRENT_USERNAME && (
                        <EditDeleteMenu
                          id={comment.comment_id}
                          deleteOnly={true}
                          onClose={handleCommentDelete}
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
              ))}
            </>
          )}
        </Box>

        {/* Second Column - The article details */}
        <Card sx={{ position: "sticky", top: 0, width: "30vw" }}>
          <CardHeader title={"About This Article"} />
          <CardContent sx={{ display: "flex" }}>
            {post?.article.preview && (
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
            )}
            <Box
              sx={{
                padding: post?.article.preview ? "0 1rem" : 0,
                flex: "1 1 auto",
              }}
            >
              <Typography
                variant="h6"
                sx={{ marginBottom: "0.5rem", fontSize: 16 }}
              >
                {post?.article.title?.length > 40
                  ? `${post?.article.title.slice(0, 40)}...`
                  : (post?.article.title ?? "No title available")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ textWrap: "wrap", wordBreak: "break-word" }}
              >
                {post?.article.caption?.length > 40
                  ? `${post?.article.caption.slice(0, 40)}...`
                  : (post?.article.caption ?? post?.article.link)}
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
                {post?.article.source
                  ? `View on ${post?.article.source}`
                  : "View Article"}
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
