import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./App.css";
import Header from "./components/Header";
import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/FeedPage";
import CollectionsPage from "./pages/CollectionsPage";
import ProfilePage from "./pages/ProfilePage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#456268",
    },
    secondary: {
      main: "#79a3b1",
    }
  },
});

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
