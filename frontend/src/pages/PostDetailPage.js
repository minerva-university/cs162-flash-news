import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PostController from "../controllers/PostController";

import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import {
  Box,
  Button,
  Link,
  Card,
  CardContent,
  CardHeader,
  CardActions,
} from "@mui/material";

const PostDetailPage = () => {
  const { id } = useParams(); // from URL params
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!id) return;

    PostController.getPost(id)
      .then((response) => {
        setPost(response);
      })
      .catch((error) => console.error);
  }, [id]);

  return (
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

      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          margin: "2rem auto",
        }}
      >
        {/* The original post and comments */}
        <Box
          sx={{
            width: "90%",
            maxWidth: "555px",
            marginRight: "2rem",
          }}
        >
          <Card>
            <CardHeader
              avatar={
                post?.profile_picture ? (
                  <Avatar
                    src={post.profile_picture}
                    sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
                    aria-label="recipe"
                  />
                ) : (
                  <Avatar
                    sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
                    aria-label="recipe"
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
        </Box>

        {/* The article details */}
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
  );
};

export default PostDetailPage;
