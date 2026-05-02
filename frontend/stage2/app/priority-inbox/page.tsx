"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box, Typography, Stack, Alert, Skeleton, Chip, Divider,
  Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Paper,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import MemoryIcon from "@mui/icons-material/Memory";
import { fetchNotifications } from "@/lib/api";
import { getTopK, scoreNotification } from "@/lib/priorityQueue";
import { logger } from "@/lib/logger";
import { Notification, NotificationType, ScoredNotification } from "@/lib/types";
import NotificationCard from "@/components/NotificationCard";

const CTX = "priority-inbox";
const TOP_N_OPTIONS = [10, 15, 20];

type TypeFilter = NotificationType | "";

const FILTER_OPTIONS: { label: string; value: TypeFilter; icon?: React.ReactElement }[] = [
  { label: "All",       value: "" },
  { label: "Placement", value: "Placement", icon: <WorkIcon   sx={{ fontSize: 14 }} /> },
  { label: "Result",    value: "Result",    icon: <SchoolIcon  sx={{ fontSize: 14 }} /> },
  { label: "Event",     value: "Event",     icon: <EventIcon   sx={{ fontSize: 14 }} /> },
];

const ACTIVE_CHIP_COLOR: Record<string, "primary" | "success" | "warning" | "info"> = {
  "":         "primary",
  Placement:  "success",
  Result:     "warning",
  Event:      "info",
};

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
      // Fetch full dataset (no pagination) — heap will pick top-N
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

  // Recompute top-K whenever source data, N, or type filter changes
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
      {/* ── Page header ─────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: 2, flexShrink: 0,
              bgcolor: "secondary.main",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <InboxIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5">Priority Inbox</Typography>
            <Typography variant="caption" color="text.secondary">
              AI-ranked notifications by relevance
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

      {/* ── Controls: filter chips + top-N selector ──────────── */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2.5,
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

        {/* Top-N selector */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Show top</InputLabel>
          <Select value={topN} label="Show top" onChange={handleTopN}>
            {TOP_N_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>Top {n}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ── Stats summary bar ────────────────────────────────── */}
      {!loading && topK.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            px: 2.5,
            py: 1.5,
            mb: 2.5,
            bgcolor: "rgba(21,101,192,0.04)",
            borderColor: "rgba(21,101,192,0.18)",
            borderRadius: 2,
            display: "flex",
            gap: 2.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Showing{" "}
            <Box component="strong" sx={{ color: "primary.main" }}>{topK.length}</Box>
            {" "}of{" "}
            <Box component="strong" sx={{ color: "text.primary" }}>{allNotifications.length}</Box>
            {" "}total
          </Typography>

          <Divider orientation="vertical" flexItem />

          <Typography variant="caption" color="text.secondary">
            Score range:{" "}
            <Box component="strong" sx={{ color: "text.primary" }}>{lowestScore?.toLocaleString()}</Box>
            {" – "}
            <Box component="strong" sx={{ color: "text.primary" }}>{highestScore?.toLocaleString()}</Box>
          </Typography>

          <Divider orientation="vertical" flexItem />

          <Chip
            label="MinHeap O(N log K)"
            size="small"
            color="primary"
            variant="outlined"
            icon={<MemoryIcon sx={{ fontSize: "12px !important" }} />}
            sx={{ fontSize: "0.63rem", height: 22 }}
          />
        </Paper>
      )}

      {/* ── Error banner ─────────────────────────────────────── */}
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Ranked list ──────────────────────────────────────── */}
      <Stack spacing={1.5}>
        {loading
          ? Array.from({ length: topN }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: 2 }} />
            ))
          : topK.length === 0
          ? (
              <Paper
                variant="outlined"
                sx={{ p: 5, textAlign: "center", borderStyle: "dashed", borderColor: "divider" }}
              >
                <InboxIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
                <Typography color="text.secondary">
                  No notifications match the selected filter.
                </Typography>
              </Paper>
            )
          : topK.map((scored, i) => (
              <NotificationCard
                key={scored.notification.ID}
                notification={scored.notification}
                isViewed={viewedIds.has(scored.notification.ID)}
                onToggleViewed={toggleViewed}
                rank={i + 1}
                score={scoreNotification(scored.notification).score}
              />
            ))
        }
      </Stack>
    </Box>
  );
}
