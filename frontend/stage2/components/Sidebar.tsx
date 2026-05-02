"use client";
import {
  Box, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, Divider, Chip,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_BG   = "#0F172A";
const SIDEBAR_ACTIVE = "#4F46E5";

const NAV_LINKS = [
  {
    label: "All Notifications",
    href: "/all-notifications",
    icon: <NotificationsIcon sx={{ fontSize: 20 }} />,
    description: "Full paginated feed",
  },
  {
    label: "Priority Inbox",
    href: "/priority-inbox",
    icon: <InboxIcon sx={{ fontSize: 20 }} />,
    description: "AI-ranked top-K",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box
      component="aside"
      sx={{
        width: 256,
        flexShrink: 0,
        bgcolor: SIDEBAR_BG,
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, pt: 3.5, pb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            bgcolor: SIDEBAR_ACTIVE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(79,70,229,0.4)",
          }}
        >
          <NotificationsActiveIcon sx={{ color: "white", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography
            sx={{
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
              lineHeight: 1.25,
              letterSpacing: -0.2,
            }}
          >
            AffordMed
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.68rem",
              lineHeight: 1,
              mt: 0.25,
            }}
          >
            Campus Notifications
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 2 }} />

      {/* Nav */}
      <Box sx={{ px: 2, py: 3, flex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: "rgba(255,255,255,0.28)",
            px: 1,
            mb: 1.5,
            display: "block",
            letterSpacing: 1.5,
            fontSize: "0.6rem",
          }}
        >
          Views
        </Typography>

        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <ListItemButton
                key={l.href}
                component={Link}
                href={l.href}
                sx={{
                  borderRadius: "10px",
                  px: 1.5,
                  py: 1,
                  color: active ? "white" : "rgba(255,255,255,0.5)",
                  bgcolor: active ? SIDEBAR_ACTIVE : "transparent",
                  boxShadow: active ? "0 4px 12px rgba(79,70,229,0.3)" : "none",
                  "&:hover": {
                    bgcolor: active ? SIDEBAR_ACTIVE : "rgba(255,255,255,0.06)",
                    color: "white",
                  },
                  transition: "all 0.18s ease",
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 36, color: "inherit", "& svg": { fontSize: 20 } }}
                >
                  {l.icon}
                </ListItemIcon>
                <ListItemText
                  primary={l.label}
                  secondary={l.description}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontSize: "0.875rem",
                      fontWeight: active ? 600 : 400,
                      color: "inherit",
                      lineHeight: 1.3,
                    },
                    "& .MuiListItemText-secondary": {
                      fontSize: "0.68rem",
                      color: active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.28)",
                      lineHeight: 1.2,
                      mt: 0.25,
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 2 }} />
      <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
        <AutorenewIcon sx={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }} />
        <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem" }}>
          Auto-refreshes every 30s
        </Typography>
      </Box>
    </Box>
  );
}
