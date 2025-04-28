import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VideocamIcon from "@mui/icons-material/Videocam";

const drawerWidth = 240;

const Sidebar = ({ username }) => {
  const { pathname } = useLocation();
  const items = [
    { text: "Profile", icon: <PersonIcon />, to: "/profile" },
    { text: "Heart Rate", icon: <FavoriteIcon />, to: "/heartrate" },
    { text: "Trends", icon: <TrendingUpIcon />, to: "/trends" },
    { text: "Live Video", icon: <VideocamIcon />, to: "/video" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          mt: 8,
        },
      }}
    >
      <List>
        <ListItem>
          <ListItemText primary={`User: ${username}`} />
        </ListItem>
        <Divider />
        {items.map(({ text, icon, to }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton component={Link} to={to} selected={pathname === to}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
