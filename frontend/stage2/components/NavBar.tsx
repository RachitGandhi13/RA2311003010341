"use client";
import {
  AppBar, Toolbar, Typography, Button, Box,
  IconButton, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { label: "All Notifications", href: "/all-notifications", icon: <NotificationsIcon fontSize="small" /> },
  { label: "Priority Inbox",    href: "/priority-inbox",    icon: <InboxIcon fontSize="small" /> },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "primary.dark" }}>
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
          {/* Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexGrow: 1 }}>
            <NotificationsActiveIcon sx={{ fontSize: 26, opacity: 0.95 }} />
            <Box sx={{ lineHeight: 1 }}>
              <Typography
                variant="h6"
                component="span"
                sx={{ fontWeight: 700, letterSpacing: 0.3, display: "block", lineHeight: 1.15 }}
              >
                AffordMed
              </Typography>
              <Typography
                variant="caption"
                component="span"
                sx={{ opacity: 0.65, display: "block", lineHeight: 1, fontSize: "0.68rem" }}
              >
                Campus Notifications
              </Typography>
            </Box>
          </Box>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 0.75 }}>
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Button
                  key={l.href}
                  component={Link}
                  href={l.href}
                  color="inherit"
                  startIcon={l.icon}
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    py: 0.75,
                    fontWeight: active ? 700 : 500,
                    bgcolor: active ? "rgba(255,255,255,0.18)" : "transparent",
                    border: "1.5px solid",
                    borderColor: active ? "rgba(255,255,255,0.45)" : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.12)",
                      borderColor: "rgba(255,255,255,0.25)",
                    },
                    transition: "all 0.18s ease",
                  }}
                >
                  {l.label}
                </Button>
              );
            })}
          </Box>

          {/* Mobile hamburger */}
          <Box sx={{ display: { xs: "flex", sm: "none" } }}>
            <IconButton color="inherit" onClick={() => setOpen(true)} size="medium">
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: 265, borderRadius: "12px 0 0 12px" } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 1.75,
            bgcolor: "primary.dark",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <NotificationsActiveIcon sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              AffordMed
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={() => setOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        <List sx={{ pt: 1.5, px: 1 }}>
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <ListItemButton
                key={l.href}
                component={Link}
                href={l.href}
                selected={active}
                onClick={() => setOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "& .MuiListItemIcon-root": { color: "white" },
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: active ? "white" : "text.secondary",
                  }}
                >
                  {l.icon}
                </ListItemIcon>
                <ListItemText
                  primary={l.label}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontWeight: active ? 700 : 400,
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}
