"use client";
import {
  AppBar, Toolbar, Typography, Box,
  IconButton, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const SIDEBAR_BG    = "#0F172A";
const SIDEBAR_ACTIVE = "#4F46E5";

const NAV_LINKS = [
  { label: "All Notifications", href: "/all-notifications", icon: <NotificationsIcon fontSize="small" /> },
  { label: "Priority Inbox",    href: "/priority-inbox",    icon: <InboxIcon fontSize="small" /> },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile-only top bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          display: { xs: "flex", lg: "none" },
          bgcolor: SIDEBAR_BG,
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 60 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexGrow: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: SIDEBAR_ACTIVE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <NotificationsActiveIcon sx={{ fontSize: 18, color: "white" }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ color: "white", fontWeight: 700, lineHeight: 1.2, fontSize: "0.95rem" }}
              >
                AffordMed
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.4)", display: "block", lineHeight: 1, fontSize: "0.62rem" }}
              >
                Campus Notifications
              </Typography>
            </Box>
          </Box>

          <IconButton color="inherit" onClick={() => setOpen(true)} size="medium">
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: 265,
            bgcolor: SIDEBAR_BG,
            borderRadius: "14px 0 0 14px",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: SIDEBAR_ACTIVE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NotificationsActiveIcon sx={{ fontSize: 18, color: "white" }} />
            </Box>
            <Typography sx={{ color: "white", fontWeight: 700, fontSize: "0.95rem" }}>
              AffordMed
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpen(false)}
            size="small"
            sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "white" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 2 }} />

        <List sx={{ pt: 2, px: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <ListItemButton
                key={l.href}
                component={Link}
                href={l.href}
                onClick={() => setOpen(false)}
                sx={{
                  borderRadius: "10px",
                  px: 1.5,
                  py: 1,
                  color: active ? "white" : "rgba(255,255,255,0.5)",
                  bgcolor: active ? SIDEBAR_ACTIVE : "transparent",
                  "&:hover": {
                    bgcolor: active ? SIDEBAR_ACTIVE : "rgba(255,255,255,0.07)",
                    color: "white",
                  },
                  transition: "all 0.15s ease",
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                  {l.icon}
                </ListItemIcon>
                <ListItemText
                  primary={l.label}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontSize: "0.875rem",
                      fontWeight: active ? 600 : 400,
                      color: "inherit",
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
