"use client";
import {
  Card, CardContent, Box, Typography,
  Chip, Tooltip, IconButton, Avatar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MarkEmailReadIcon    from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon  from "@mui/icons-material/MarkEmailUnread";
import WorkIcon             from "@mui/icons-material/Work";
import SchoolIcon           from "@mui/icons-material/School";
import EventIcon            from "@mui/icons-material/Event";
import AccessTimeIcon       from "@mui/icons-material/AccessTime";
import { Notification } from "@/lib/types";

const TYPE_CONFIG = {
  Placement: {
    color:      "#059669",
    lightBg:    "#D1FAE5",
    chipColor:  "success" as const,
    icon:       <WorkIcon />,
    glow:       "rgba(5,150,105,0.14)",
    cardBg:     "rgba(5,150,105,0.035)",
    borderPx:   4,
  },
  Result: {
    color:      "#D97706",
    lightBg:    "#FEF3C7",
    chipColor:  "warning" as const,
    icon:       <SchoolIcon />,
    glow:       "rgba(217,119,6,0.12)",
    cardBg:     "rgba(217,119,6,0.03)",
    borderPx:   3,
  },
  Event: {
    color:      "#2563EB",
    lightBg:    "#DBEAFE",
    chipColor:  "info" as const,
    icon:       <EventIcon />,
    glow:       "rgba(37,99,235,0.08)",
    cardBg:     "rgba(37,99,235,0.02)",
    borderPx:   3,
  },
} as const;

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

interface Props {
  notification:   Notification;
  isViewed:       boolean;
  onToggleViewed: (id: string) => void;
  rank?:          number;
  score?:         number;
}

export default function NotificationCard({
  notification,
  isViewed,
  onToggleViewed,
  rank,
  score,
}: Props) {
  const { ID, Type, Message, Timestamp } = notification;
  const cfg = TYPE_CONFIG[Type];

  const d = new Date(Timestamp);
  const formattedTime =
    `${d.getFullYear()}-` +
    `${String(d.getMonth() + 1).padStart(2, "0")}-` +
    `${String(d.getDate()).padStart(2, "0")} ` +
    `${String(d.getHours()).padStart(2, "0")}:` +
    `${String(d.getMinutes()).padStart(2, "0")}`;

  const isUnread    = !isViewed;
  const borderColor = isUnread ? cfg.color : "#E2E8F0";
  const cardBg      = isUnread ? cfg.cardBg : "#FAFAFA";
  const baseShadow  = isUnread
    ? `0 2px 8px ${cfg.glow}, 0 1px 3px rgba(15,23,42,0.05)`
    : "0 1px 3px rgba(15,23,42,0.04)";
  const hoverShadow = isUnread
    ? `0 8px 24px ${cfg.glow}, 0 4px 12px rgba(15,23,42,0.08)`
    : "0 6px 20px rgba(15,23,42,0.1)";

  return (
    <Card
      sx={{
        borderLeft: `${cfg.borderPx}px solid ${borderColor}`,
        bgcolor: cardBg,
        opacity: isViewed ? 0.75 : 1,
        boxShadow: baseShadow,
        border: "1px solid",
        borderColor: isUnread ? alpha(cfg.color, 0.15) : "rgba(15,23,42,0.06)",
        borderLeftColor: borderColor,
        borderLeftWidth: cfg.borderPx,
        transition: "box-shadow 0.25s ease, transform 0.2s ease, opacity 0.2s ease",
        cursor: "default",
        "&:hover": {
          boxShadow: hoverShadow,
          transform: "translateY(-2px)",
          opacity: 1,
        },
      }}
    >
      <CardContent sx={{ pb: "14px !important", px: { xs: 2, sm: 2.5 }, pt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>

          {/* Type icon avatar */}
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: isUnread ? cfg.lightBg : "#F1F5F9",
              color: isUnread ? cfg.color : "#94A3B8",
              borderRadius: "10px",
              flexShrink: 0,
              "& svg": { fontSize: 20 },
            }}
          >
            {cfg.icon}
          </Avatar>

          {/* Main content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Top row: type chip + unread dot + rank */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", mb: 0.75 }}>
              <Chip
                label={Type}
                color={cfg.chipColor}
                size="small"
                sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700 }}
              />

              {isUnread && (
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: cfg.color,
                    boxShadow: `0 0 0 2px ${cfg.lightBg}`,
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1, transform: "scale(1)" },
                      "50%": { opacity: 0.5, transform: "scale(0.85)" },
                    },
                    animation: "pulse 2.2s ease-in-out infinite",
                  }}
                />
              )}

              {rank !== undefined && (
                rank <= 3 ? (
                  <Typography
                    component="span"
                    sx={{ fontSize: 15, lineHeight: 1 }}
                    aria-label={`Rank ${rank}`}
                  >
                    {RANK_MEDALS[rank]}
                  </Typography>
                ) : (
                  <Chip
                    label={`#${rank}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  />
                )
              )}

              {score !== undefined && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.disabled", fontSize: "0.62rem", ml: "auto" }}
                >
                  {score.toLocaleString()}
                </Typography>
              )}
            </Box>

            {/* Message */}
            <Typography
              variant="body2"
              sx={{
                fontWeight: isUnread ? 600 : 400,
                color: isUnread ? "text.primary" : "text.secondary",
                mb: 0.75,
                wordBreak: "break-word",
                lineHeight: 1.55,
              }}
            >
              {Message}
            </Typography>

            {/* Metadata */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 11, color: "text.disabled" }} />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.68rem" }}>
                {formattedTime}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.68rem" }}>
                &nbsp;·&nbsp;{ID.substring(0, 8)}…
              </Typography>
            </Box>
          </Box>

          {/* Read/unread toggle */}
          <Tooltip title={isViewed ? "Mark as unread" : "Mark as read"} placement="left">
            <IconButton
              size="small"
              onClick={() => onToggleViewed(ID)}
              sx={{
                flexShrink: 0,
                mt: "-2px",
                color: isUnread ? cfg.color : "text.disabled",
                bgcolor: isUnread ? alpha(cfg.color, 0.08) : "transparent",
                "&:hover": {
                  bgcolor: isUnread ? alpha(cfg.color, 0.16) : "action.hover",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isViewed
                ? <MarkEmailUnreadIcon fontSize="small" />
                : <MarkEmailReadIcon  fontSize="small" />
              }
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
