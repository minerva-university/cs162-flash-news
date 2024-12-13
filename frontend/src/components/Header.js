import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useNavigate } from "react-router-dom";

function Header() {
  const username = localStorage.getItem("username"); // Get username from local storage to be used in the header
  const navigate = useNavigate();
  const pages = [
    { name: "Home", path: "/feed" },
    { name: "Collections", path: `/user/${username}/collections` },
    { name: "Profile", path: `${username}/profile` },
  ];

  const [searchValue, setSearchValue] = useState("");
  const [userSuggestions, setUserSuggestions] = useState([]);

  const handleSearchChange = async (event) => {
    const q = event.target.value;
    setSearchValue(q);

    if (q.length > 2) {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch(
          `http://127.0.0.1:5000/api/user/search?q=${q}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setUserSuggestions(data.data || []);
        } else {
          console.error("Failed to fetch user suggestions");
        }
      } catch (error) {
        console.error("Error fetching user suggestions:", error);
      }
    } else {
      setUserSuggestions([]);
    }
  };

  const handleSearchSelect = (selectedUser) => {
    if (selectedUser && selectedUser.username) {
      navigate(`/${selectedUser.username}/profile`);
    }
    setSearchValue("");
    setUserSuggestions([]);
  };

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

          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Autocomplete
              freeSolo
              options={userSuggestions}
              getOptionLabel={(option) => option.username || ""}
              onInputChange={handleSearchChange}
              onChange={(event, value) => handleSearchSelect(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search for users..."
                  variant="outlined"
                  size="small"
                  sx={{
                    bgcolor: "white",
                    borderRadius: "5px",
                    width: "400px",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#D9EAF3",
                      },
                      "&:hover fieldset": {
                        borderColor: "#5F848C",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#5F848C",
                      },
                    },
                  }}
                />
              )}
            />
          </Box>

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
