"use client";
import { Card, CardContent, Box, Typography, Chip, Tooltip, IconButton } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Notification } from "@/lib/types";

const TYPE_COLOR: Record<string, "success" | "warning" | "info"> = {
  Placement: "success",
  Result:    "warning",
  Event:     "info",
};

// Subtle tint applied to unread card backgrounds per type
const TYPE_BG_UNREAD: Record<string, string> = {
  Placement: "rgba(46, 125, 50, 0.05)",
  Result:    "rgba(230, 81, 0, 0.05)",
  Event:     "rgba(2, 119, 189, 0.05)",
};

// Border accent color per type (matches palette.*.main)
const TYPE_BORDER: Record<string, string> = {
  Placement: "#2E7D32",
  Result:    "#E65100",
  Event:     "#0277BD",
};

const TYPE_ICON: Record<string, React.ReactElement> = {
  Placement: <WorkIcon   sx={{ fontSize: 14 }} />,
  Result:    <SchoolIcon  sx={{ fontSize: 14 }} />,
  Event:     <EventIcon   sx={{ fontSize: 14 }} />,
};

// Rank medals for top-3; numeric badge for the rest
const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

interface Props {
  notification: Notification;
  isViewed: boolean;
  onToggleViewed: (id: string) => void;
  rank?: number;
  score?: number;
}

export default function NotificationCard({
  notification,
  isViewed,
  onToggleViewed,
  rank,
  score,
}: Props) {
  const { ID, Type, Message, Timestamp } = notification;

  // Locale-agnostic format avoids SSR / client hydration mismatch
  const d = new Date(Timestamp);
  const formattedTime =
    `${d.getFullYear()}-` +
    `${String(d.getMonth() + 1).padStart(2, "0")}-` +
    `${String(d.getDate()).padStart(2, "0")} ` +
    `${String(d.getHours()).padStart(2, "0")}:` +
    `${String(d.getMinutes()).padStart(2, "0")}`;

  const borderColor = isViewed ? "#D1D5DB" : TYPE_BORDER[Type];
  const bgColor     = isViewed ? "#FFFFFF"  : TYPE_BG_UNREAD[Type];

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: "4px solid",
        borderLeftColor: borderColor,
        bgcolor: bgColor,
        opacity: isViewed ? 0.82 : 1,
        transition: "box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          transform: "translateY(-2px)",
          opacity: 1,
        },
      }}
    >
      <CardContent sx={{ pb: "12px !important", px: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>

          {/* Rank badge (priority inbox only) */}
          {rank !== undefined && (
            <Box sx={{ minWidth: 34, display: "flex", justifyContent: "center", pt: "3px", flexShrink: 0 }}>
              {rank <= 3 ? (
                <Typography sx={{ fontSize: 22, lineHeight: 1 }} aria-label={`Rank ${rank}`}>
                  {RANK_MEDALS[rank]}
                </Typography>
              ) : (
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: "grey.100",
                    border: "1.5px solid",
                    borderColor: "grey.300",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.68rem" }}
                  >
                    {rank}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Main content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Chip row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", mb: 0.75 }}>
              <Chip
                label={Type}
                color={TYPE_COLOR[Type]}
                size="small"
                icon={TYPE_ICON[Type]}
                sx={{ fontWeight: 700 }}
              />
              {!isViewed && (
                <Chip
                  label="NEW"
                  size="small"
                  color="error"
                  sx={{
                    fontSize: "0.6rem",
                    height: 18,
                    fontWeight: 800,
                    letterSpacing: 0.6,
                    px: 0.25,
                  }}
                />
              )}
              {score !== undefined && (
                <Chip
                  label={`Score: ${score.toLocaleString()}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontSize: "0.64rem", height: 20, borderColor: "primary.light" }}
                />
              )}
            </Box>

            {/* Message */}
            <Typography
              variant="body1"
              sx={{
                fontWeight: isViewed ? 400 : 600,
                color: isViewed ? "text.secondary" : "text.primary",
                mb: 0.75,
                wordBreak: "break-word",
                lineHeight: 1.55,
              }}
            >
              {Message}
            </Typography>

            {/* Metadata row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 12, color: "text.disabled" }} />
              <Typography variant="caption" color="text.disabled">
                {formattedTime}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ ml: 0.25 }}>
                ·&nbsp;ID:&nbsp;{ID.substring(0, 8)}…
              </Typography>
            </Box>
          </Box>

          {/* Read / unread toggle */}
          <Tooltip title={isViewed ? "Mark as unread" : "Mark as read"}>
            <IconButton
              size="small"
              onClick={() => onToggleViewed(ID)}
              sx={{
                mt: "-2px",
                flexShrink: 0,
                color: isViewed ? "text.disabled" : "primary.main",
                "&:hover": {
                  bgcolor: isViewed
                    ? "action.hover"
                    : "rgba(21, 101, 192, 0.08)",
                },
              }}
            >
              {isViewed ? (
                <MarkEmailUnreadIcon fontSize="small" />
              ) : (
                <MarkEmailReadIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
