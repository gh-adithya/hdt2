// src/components/NavBar.js
import React from "react";
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

const NavBar = ({ onLogout, mode, toggleMode }) => (
  <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Health Portal
      </Typography>
      <IconButton color="inherit" onClick={toggleMode}>
        {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
      <IconButton color="inherit" onClick={onLogout}>
        <LogoutIcon />
      </IconButton>
    </Toolbar>
  </AppBar>
);

export default NavBar;
