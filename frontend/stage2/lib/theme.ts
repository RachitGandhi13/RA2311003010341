"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary:   { main: "#4F46E5", light: "#818CF8", dark: "#3730A3" },
    secondary: { main: "#EC4899", light: "#F9A8D4", dark: "#BE185D" },
    success:   { main: "#059669", light: "#34D399", dark: "#065F46" },
    warning:   { main: "#D97706", light: "#FCD34D", dark: "#92400E" },
    info:      { main: "#2563EB", light: "#60A5FA", dark: "#1D4ED8" },
    error:     { main: "#DC2626", light: "#F87171", dark: "#991B1B" },
    background: { default: "#F1F5F9", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#64748B" },
    divider: "rgba(15,23,42,0.06)",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: { fontWeight: 700, letterSpacing: -0.5 },
    h5: { fontWeight: 700, letterSpacing: -0.3 },
    h6: { fontWeight: 600, letterSpacing: -0.2 },
    subtitle1: { fontWeight: 600, letterSpacing: -0.1 },
    subtitle2: { fontWeight: 600, fontSize: "0.8rem" },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.55, fontSize: "0.875rem" },
    caption: { fontSize: "0.72rem", letterSpacing: 0.2 },
    overline: { fontSize: "0.65rem", letterSpacing: 1.5, fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 transparent;
        }
        body::-webkit-scrollbar { width: 6px; height: 6px; }
        body::-webkit-scrollbar-track { background: transparent; }
        body::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        * { box-sizing: border-box; }
      `,
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "0.72rem",
          letterSpacing: 0.2,
          borderRadius: 20,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
          borderRadius: 14,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "0 1px 0 rgba(15,23,42,0.1)" },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          border: "1px solid rgba(15,23,42,0.07)",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { borderRadius: "10px !important" },
      },
    },
  },
});

export default theme;
