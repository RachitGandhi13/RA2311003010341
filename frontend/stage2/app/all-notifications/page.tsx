"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box, Typography, Stack, Alert, Skeleton, Chip, Divider,
  Pagination, Select, MenuItem, FormControl, InputLabel,
  SelectChangeEvent, Paper,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import { fetchNotifications } from "@/lib/api";
import { logger } from "@/lib/logger";
import { Notification, NotificationType } from "@/lib/types";
import NotificationCard from "@/components/NotificationCard";

const CTX = "all-notifications";
const PAGE_SIZE_OPTIONS = [5, 10, 20];

type TypeFilter = NotificationType | "";

const FILTER_OPTIONS: { label: string; value: TypeFilter; icon?: React.ReactElement }[] = [
  { label: "All",       value: "" },
  { label: "Placement", value: "Placement", icon: <WorkIcon   sx={{ fontSize: 14 }} /> },
  { label: "Result",    value: "Result",    icon: <SchoolIcon  sx={{ fontSize: 14 }} /> },
  { label: "Event",     value: "Event",     icon: <EventIcon   sx={{ fontSize: 14 }} /> },
];

const ACTIVE_CHIP_COLOR: Record<string, "primary" | "success" | "warning" | "info"> = {
  "":          "primary",
  Placement:  "success",
  Result:     "warning",
  Event:      "info",
};

export default function AllNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [typeFilter, setTypeFilter]       = useState<TypeFilter>("");
  const [page, setPage]                   = useState(1);
  const [pageSize, setPageSize]           = useState(10);
  const [viewedIds, setViewedIds]         = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    logger.info(CTX, "Loading notifications", { page, pageSize, typeFilter });
    try {
      const data = await fetchNotifications({
        page,
        limit: pageSize,
        notification_type: typeFilter || undefined,
      });
      setNotifications(data);
      logger.info(CTX, "Notifications loaded", { count: data.length });
    } catch (err) {
      const msg = (err as Error).message;
      logger.error(CTX, "Failed to load notifications", { message: msg });
      setError("Could not load notifications. Showing cached data.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, typeFilter]);

  // Auto-reload every 30 seconds for live-ish updates
  useEffect(() => {
    load();
    const interval = setInterval(() => {
      logger.debug(CTX, "Auto-refresh triggered");
      load();
    }, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  // Reset to page 1 on filter change
  const handleTypeFilter = (val: TypeFilter) => {
    logger.info(CTX, "Type filter changed", { filter: val });
    setTypeFilter(val);
    setPage(1);
  };

  const handlePageSize = (e: SelectChangeEvent<number>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const toggleViewed = (id: string) => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        logger.debug(CTX, "Marked as unread", { id });
      } else {
        next.add(id);
        logger.debug(CTX, "Marked as read", { id });
      }
      return next;
    });
  };

  const unreadCount = notifications.filter((n) => !viewedIds.has(n.ID)).length;
  const hasMore     = notifications.length === pageSize;

  return (
    <Box>
      {/* ── Page header ─────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: 2, flexShrink: 0,
              bgcolor: "primary.main",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <NotificationsIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5">All Notifications</Typography>
            <Typography variant="caption" color="text.secondary">
              Paginated campus updates
            </Typography>
          </Box>
        </Box>

        {unreadCount > 0 && (
          <Chip label={`${unreadCount} unread`} color="error" size="small" sx={{ fontWeight: 700 }} />
        )}

        <Tooltip title="Refresh now">
          <IconButton
            onClick={load}
            size="small"
            color="primary"
            sx={{
              border: "1px solid",
              borderColor: "primary.light",
              bgcolor: "rgba(21,101,192,0.06)",
              "&:hover": { bgcolor: "rgba(21,101,192,0.12)" },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* ── Filters + page-size bar ──────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Pill filter chips */}
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {FILTER_OPTIONS.map((f) => {
            const active = typeFilter === f.value;
            return (
              <Chip
                key={f.value}
                label={f.label}
                icon={f.icon}
                color={active ? ACTIVE_CHIP_COLOR[f.value] : "default"}
                variant={active ? "filled" : "outlined"}
                onClick={() => handleTypeFilter(f.value)}
                sx={{
                  cursor: "pointer",
                  fontWeight: active ? 700 : 500,
                  transition: "all 0.15s ease",
                  "&:hover": { opacity: 0.85 },
                }}
              />
            );
          })}
        </Box>

        {/* Per-page selector */}
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Per page</InputLabel>
          <Select value={pageSize} label="Per page" onChange={handlePageSize}>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>{n} per page</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ── Error banner ─────────────────────────────────────── */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* ── Notification list ─────────────────────────────────── */}
      <Stack spacing={1.5}>
        {loading
          ? Array.from({ length: pageSize }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: 2 }} />
            ))
          : notifications.length === 0
          ? (
              <Paper
                variant="outlined"
                sx={{ p: 5, textAlign: "center", borderStyle: "dashed", borderColor: "divider" }}
              >
                <NotificationsIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
                <Typography color="text.secondary">
                  No notifications for the selected filter.
                </Typography>
              </Paper>
            )
          : notifications.map((n) => (
              <NotificationCard
                key={n.ID}
                notification={n}
                isViewed={viewedIds.has(n.ID)}
                onToggleViewed={toggleViewed}
              />
            ))
        }
      </Stack>

      {/* ── Pagination ───────────────────────────────────────── */}
      {!loading && notifications.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Page {page}&nbsp;·&nbsp;{notifications.length} shown
          </Typography>
          <Pagination
            page={page}
            count={page + (hasMore ? 1 : 0)}
            onChange={(_, val) => {
              logger.info(CTX, "Page changed", { page: val });
              setPage(val);
            }}
            color="primary"
            shape="rounded"
            size="medium"
          />
        </Box>
      )}
    </Box>
  );
}
