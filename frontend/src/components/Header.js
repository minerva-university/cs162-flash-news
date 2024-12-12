import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

function Header() {
  const username = localStorage.getItem("username"); // Get username from local storage to be used in the header
  const navigate = useNavigate();
  const pages = [
    { name: "Home", path: "/feed" },
    { name: "Collections", path: `/user/${username}/collections` },
    { name: "Profile", path: `${username}/profile` },
  ];

  const handleLogout = () => {
    // Clear tokens and user data from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("profile_picture");

    // Redirect to login page
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            FlashNews
          </Typography>
          <Box sx={{ marginLeft: "auto", display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                sx={{ my: 2, color: "white", display: "block" }}
                onClick={() => navigate(page.path)}
              >
                {page.name}
              </Button>
            ))}
            <Button
              sx={{ my: 2, color: "white", display: "block" }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Header;