"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box, Typography, Stack, Alert, Skeleton,
  Chip, Divider, Pagination, SelectChangeEvent,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RefreshIcon       from "@mui/icons-material/Refresh";
import IconButton        from "@mui/material/IconButton";
import Tooltip           from "@mui/material/Tooltip";
import Avatar            from "@mui/material/Avatar";
import { fetchNotifications } from "@/lib/api";
import { logger }             from "@/lib/logger";
import { Notification, NotificationType } from "@/lib/types";
import NotificationCard from "@/components/NotificationCard";
import FilterBar        from "@/components/FilterBar";

const CTX = "all-notifications";
const PAGE_SIZE_OPTIONS = [5, 10, 20];

type TypeFilter = NotificationType | "";

// ─── inline helpers ──────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: number; color?: "error" | "primary" }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "20px",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: color === "error" ? "error.main" : color === "primary" ? "primary.main" : "text.primary",
          fontSize: "0.78rem",
        }}
      >
        {value}
      </Typography>
      <Typography variant="caption" color="text.disabled">
        {label}
      </Typography>
    </Box>
  );
}

function CardSkeleton() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 2,
        bgcolor: "background.paper",
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        borderLeft: "4px solid #E2E8F0",
      }}
    >
      <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "10px", flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="35%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="90%" height={18} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="22%" height={14} />
      </Box>
      <Skeleton variant="circular" width={28} height={28} sx={{ flexShrink: 0 }} />
    </Box>
  );
}

function EmptyState() {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "18px",
          bgcolor: "#F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
        }}
      >
        <NotificationsIcon sx={{ fontSize: 32, color: "text.disabled" }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
        No notifications found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Try a different filter or check back later.
      </Typography>
    </Box>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

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

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      logger.debug(CTX, "Auto-refresh triggered");
      load();
    }, 30_000);
    return () => clearInterval(interval);
  }, [load]);

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

      {/* ── Page header ────────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            flexWrap: "wrap",
            mb: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "primary.main",
              borderRadius: "14px",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
            }}
          >
            <NotificationsIcon sx={{ fontSize: 26 }} />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ lineHeight: 1.25, mb: 0.25 }}>
              All Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Paginated campus updates — auto-refreshes every 30 seconds
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                color="error"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            )}
            <Tooltip title="Refresh now">
              <IconButton
                onClick={load}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats pills */}
        {!loading && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <StatPill label="showing" value={notifications.length} />
            {unreadCount > 0 && <StatPill label="unread" value={unreadCount} color="error" />}
            <StatPill label={`page ${page}`} value={pageSize} />
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ── Filter bar ─────────────────────────────────────────── */}
      <FilterBar
        typeFilter={typeFilter}
        onTypeFilter={handleTypeFilter}
        dropdownLabel="Per page"
        dropdownValue={pageSize}
        dropdownOptions={PAGE_SIZE_OPTIONS.map((n) => ({ label: `${n} per page`, value: n }))}
        onDropdown={handlePageSize}
      />

      {/* ── Error banner ───────────────────────────────────────── */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* ── Notification list ──────────────────────────────────── */}
      <Stack spacing={1.5}>
        {loading
          ? Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          : notifications.length === 0
          ? <EmptyState />
          : notifications.map((n, i) => (
              <Box
                key={n.ID}
                sx={{
                  "@keyframes slideIn": {
                    from: { opacity: 0, transform: "translateY(6px)" },
                    to:   { opacity: 1, transform: "translateY(0)" },
                  },
                  animation: "slideIn 0.3s ease forwards",
                  animationDelay: `${Math.min(i * 0.045, 0.32)}s`,
                  opacity: 0,
                }}
              >
                <NotificationCard
                  notification={n}
                  isViewed={viewedIds.has(n.ID)}
                  onToggleViewed={toggleViewed}
                />
              </Box>
            ))
        }
      </Stack>

      {/* ── Pagination ─────────────────────────────────────────── */}
      {!loading && notifications.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3.5,
            pt: 2.5,
            borderTop: "1px solid",
            borderColor: "divider",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Page&nbsp;<strong>{page}</strong>&nbsp;·&nbsp;{notifications.length}&nbsp;items
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
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: "8px",
                fontWeight: 600,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
