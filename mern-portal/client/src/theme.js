// src/theme.js
import { createTheme } from "@mui/material/styles";

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#3f51b5" },
      secondary: { main: "#f50057" },
      background: {
        default: mode === "light" ? "#f4f6f8" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
    },
    typography: {
      fontFamily: ['"Roboto"', '"Helvetica"', '"Arial"', "sans-serif"].join(
        ","
      ),
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "light"
                ? "0 4px 12px rgba(0,0,0,0.05)"
                : "0 4px 12px rgba(0,0,0,0.5)",
            borderRadius: 12,
          },
        },
      },
    },
  });

export default getTheme;
