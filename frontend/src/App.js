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

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        {!publicRoutes.includes(location.pathname) && <Header />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/feed" element={<FeedPage />} />
          {/* TODO: add functionality for "isOwner" prop */}
          <Route
            path="/collections"
            element={<CollectionsPage isOwner={true} />}
          />
          <Route
            path="/collections/:id/:title"
            element={<CollectionDetailModal isOwner={true} />}
          />
          <Route path="/profile" element={<ProfilePage isOwner={true} />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;
