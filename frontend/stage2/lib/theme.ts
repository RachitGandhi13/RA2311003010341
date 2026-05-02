"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary:   { main: "#1565C0", light: "#5E92F3", dark: "#003C8F" },
    secondary: { main: "#E53935", light: "#FF6F60", dark: "#AB000D" },
    success:   { main: "#2E7D32", light: "#4CAF50", dark: "#1B5E20" },
    warning:   { main: "#E65100", light: "#FF9800", dark: "#BF360C" },
    info:      { main: "#0277BD", light: "#29B6F6", dark: "#01579B" },
    background: { default: "#F4F6F9", paper: "#FFFFFF" },
    text: { primary: "#1A2027", secondary: "#546E7A" },
    divider: "rgba(0,0,0,0.08)",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h5: { fontWeight: 700, letterSpacing: -0.3 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: "0.72rem", letterSpacing: 0.2 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "0 1px 10px rgba(0,0,0,0.18)" },
      },
    },
  },
});

export default theme;
