"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box, Typography, Stack, Alert, Skeleton,
  Chip, Divider, SelectChangeEvent, Paper,
} from "@mui/material";
import InboxIcon   from "@mui/icons-material/MoveToInbox";
import RefreshIcon from "@mui/icons-material/Refresh";
import MemoryIcon  from "@mui/icons-material/Memory";
import IconButton  from "@mui/material/IconButton";
import Tooltip     from "@mui/material/Tooltip";
import Avatar      from "@mui/material/Avatar";
import { fetchNotifications }           from "@/lib/api";
import { getTopK, scoreNotification }   from "@/lib/priorityQueue";
import { logger }                        from "@/lib/logger";
import { Notification, NotificationType, ScoredNotification } from "@/lib/types";
import NotificationCard from "@/components/NotificationCard";
import FilterBar        from "@/components/FilterBar";

const CTX = "priority-inbox";
const TOP_N_OPTIONS = [10, 15, 20];

type TypeFilter = NotificationType | "";

// ─── inline helpers ──────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: "error" | "primary" | "success";
}) {
  const textColor =
    color === "error"   ? "error.main"   :
    color === "primary" ? "primary.main" :
    color === "success" ? "success.main" :
    "text.primary";

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
        sx={{ fontWeight: 700, color: textColor, fontSize: "0.78rem" }}
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
        <Skeleton variant="text" width="88%" height={18} sx={{ mb: 0.5 }} />
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
        <InboxIcon sx={{ fontSize: 32, color: "text.disabled" }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
        No notifications match
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Try a different filter or refresh to load more.
      </Typography>
    </Box>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function PriorityInboxPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [topK, setTopK]                         = useState<ScoredNotification[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState<string | null>(null);
  const [topN, setTopN]                         = useState(10);
  const [typeFilter, setTypeFilter]             = useState<TypeFilter>("");
  const [viewedIds, setViewedIds]               = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    logger.info(CTX, "Loading all notifications for priority ranking", { topN });
    try {
      const data = await fetchNotifications({ limit: 200 });
      setAllNotifications(data);
      logger.info(CTX, "Raw notifications loaded", { count: data.length });
    } catch (err) {
      const msg = (err as Error).message;
      logger.error(CTX, "Failed to load notifications", { message: msg });
      setError("Could not load notifications. Showing cached data.");
    } finally {
      setLoading(false);
    }
  }, [topN]);

  useEffect(() => {
    const source = typeFilter
      ? allNotifications.filter((n) => n.Type === typeFilter)
      : allNotifications;

    const ranked = getTopK(source, topN);
    logger.info(CTX, "Priority heap computed", {
      sourceSize: source.length,
      topN,
      typeFilter: typeFilter || "all",
      resultCount: ranked.length,
    });
    setTopK(ranked);
  }, [allNotifications, topN, typeFilter]);

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      logger.debug(CTX, "Auto-refresh triggered");
      load();
    }, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const handleTopN = (e: SelectChangeEvent<number>) => {
    const val = Number(e.target.value);
    logger.info(CTX, "Top-N changed", { topN: val });
    setTopN(val);
  };

  const handleTypeFilter = (val: TypeFilter) => {
    logger.info(CTX, "Type filter changed", { filter: val });
    setTypeFilter(val);
  };

  const toggleViewed = (id: string) => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); logger.debug(CTX, "Marked unread", { id }); }
      else               { next.add(id);    logger.debug(CTX, "Marked read",   { id }); }
      return next;
    });
  };

  const unreadCount  = topK.filter((s) => !viewedIds.has(s.notification.ID)).length;
  const highestScore = topK[0]?.score;
  const lowestScore  = topK[topK.length - 1]?.score;

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
              bgcolor: "success.main",
              borderRadius: "14px",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
            }}
          >
            <InboxIcon sx={{ fontSize: 26 }} />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ lineHeight: 1.25, mb: 0.25 }}>
              Priority Inbox
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-ranked notifications by relevance — MinHeap O(N log K)
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
        {!loading && topK.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <StatPill label="ranked" value={topK.length} color="primary" />
            <StatPill label="total fetched" value={allNotifications.length} />
            {unreadCount > 0 && <StatPill label="unread" value={unreadCount} color="error" />}
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ── Filter bar ─────────────────────────────────────────── */}
      <FilterBar
        typeFilter={typeFilter}
        onTypeFilter={handleTypeFilter}
        dropdownLabel="Show top"
        dropdownValue={topN}
        dropdownOptions={TOP_N_OPTIONS.map((n) => ({ label: `Top ${n}`, value: n }))}
        onDropdown={handleTopN}
      />

      {/* ── Algorithm stats banner ─────────────────────────────── */}
      {!loading && topK.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            px: 2.5,
            py: 1.5,
            mb: 3,
            bgcolor: "rgba(79,70,229,0.03)",
            borderColor: "rgba(79,70,229,0.15)",
            borderRadius: 2,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Chip
            label="MinHeap O(N log K)"
            size="small"
            color="primary"
            variant="outlined"
            icon={<MemoryIcon sx={{ fontSize: "12px !important" }} />}
            sx={{ fontSize: "0.63rem", height: 22 }}
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Typography variant="caption" color="text.secondary">
            Score range:&nbsp;
            <Box component="strong" sx={{ color: "text.primary" }}>
              {lowestScore?.toLocaleString()}
            </Box>
            &nbsp;–&nbsp;
            <Box component="strong" sx={{ color: "text.primary" }}>
              {highestScore?.toLocaleString()}
            </Box>
          </Typography>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Typography variant="caption" color="text.secondary">
            Showing&nbsp;
            <Box component="strong" sx={{ color: "primary.main" }}>
              {topK.length}
            </Box>
            &nbsp;of&nbsp;
            <Box component="strong" sx={{ color: "text.primary" }}>
              {allNotifications.length}
            </Box>
            &nbsp;total
          </Typography>
        </Paper>
      )}

      {/* ── Error banner ───────────────────────────────────────── */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* ── Ranked list ────────────────────────────────────────── */}
      <Stack spacing={1.5}>
        {loading
          ? Array.from({ length: Math.min(topN, 5) }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          : topK.length === 0
          ? <EmptyState />
          : topK.map((scored, i) => (
              <Box
                key={scored.notification.ID}
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
                  notification={scored.notification}
                  isViewed={viewedIds.has(scored.notification.ID)}
                  onToggleViewed={toggleViewed}
                  rank={i + 1}
                  score={scoreNotification(scored.notification).score}
                />
              </Box>
            ))
        }
      </Stack>
    </Box>
  );
}
