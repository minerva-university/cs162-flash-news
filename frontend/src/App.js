import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./App.css";
import FeedPage from "./pages/FeedPage";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionDetailModal from "./modals/CollectionDetailModal";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Header from "./components/Header";
import PostDetailPage from "./pages/PostDetailPage";
import SettingsPage from "./pages/SettingsPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#5F848C",
    },
    secondary: {
      main: "#FCF8EC",
    },
  },
});

function App() {
  const location = useLocation();
  const publicRoutes = ["/login", "/signup"];

  const currentUser = {
    user_id: 1, // Hardcoded user ID
    username: "testuser", // Hardcoded username
  };

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        {!publicRoutes.includes(location.pathname) && <Header currentUser={currentUser} />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/user/:username/collections" element={<CollectionsPage currentUser={currentUser} />} />
          <Route path="/collections/:id/:title" element={<CollectionDetailModal currentUser={currentUser} />} />
          <Route path="/:username/settings" element={<SettingsPage />} />
          <Route path="/:username/profile" element={<ProfilePage currentUser={currentUser} />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;