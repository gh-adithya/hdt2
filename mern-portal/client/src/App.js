import React, { useState, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, ThemeProvider, CssBaseline } from "@mui/material";

import getTheme from "./theme";
import NavBar from "./components/NavBar";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Profile from "./pages/Profile";
import HeartRate from "./pages/HeartRate";
import Trends from "./pages/Trends";
import LiveVideo from "./pages/LiveVideo";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  // Start in dark mode by default
  const [mode, setMode] = useState("dark");

  const theme = useMemo(() => getTheme(mode), [mode]);

  const handleLogin = (uname) => {
    setUsername(uname);
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setUsername("");
    setIsLoggedIn(false);
  };
  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Show login under the same dark theme
  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <NavBar onLogout={handleLogout} mode={mode} toggleMode={toggleMode} />
        <Sidebar username={username} />
        <Box component="main" sx={{ flexGrow: 1, mt: 8, p: 3 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/profile" />} />
            <Route path="/profile" element={<Profile username={username} />} />
            <Route
              path="/heartrate"
              element={<HeartRate username={username} />}
            />
            <Route path="/trends" element={<Trends username={username} />} />
            <Route path="/video" element={<LiveVideo />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
