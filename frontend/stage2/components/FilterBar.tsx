"use client";
import {
  Box, Chip, FormControl, InputLabel,
  Select, MenuItem, SelectChangeEvent,
} from "@mui/material";
import WorkIcon   from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon  from "@mui/icons-material/Event";
import { NotificationType } from "@/lib/types";

type TypeFilter = NotificationType | "";

const FILTER_OPTIONS: { label: string; value: TypeFilter; icon?: React.ReactElement }[] = [
  { label: "All",       value: "" },
  { label: "Placement", value: "Placement", icon: <WorkIcon   sx={{ fontSize: 14 }} /> },
  { label: "Result",    value: "Result",    icon: <SchoolIcon  sx={{ fontSize: 14 }} /> },
  { label: "Event",     value: "Event",     icon: <EventIcon   sx={{ fontSize: 14 }} /> },
];

const CHIP_COLOR: Record<string, "default" | "primary" | "success" | "warning" | "info"> = {
  "":          "primary",
  Placement:  "success",
  Result:     "warning",
  Event:      "info",
};

interface DropdownOption {
  label: string;
  value: number;
}

interface FilterBarProps {
  typeFilter:      TypeFilter;
  onTypeFilter:    (val: TypeFilter) => void;
  dropdownLabel:   string;
  dropdownValue:   number;
  dropdownOptions: DropdownOption[];
  onDropdown:      (e: SelectChangeEvent<number>) => void;
}

export default function FilterBar({
  typeFilter,
  onTypeFilter,
  dropdownLabel,
  dropdownValue,
  dropdownOptions,
  onDropdown,
}: FilterBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 3,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1.5,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Type filter chips */}
      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
        {FILTER_OPTIONS.map((f) => {
          const active = typeFilter === f.value;
          return (
            <Chip
              key={f.value}
              label={f.label}
              icon={f.icon}
              color={active ? CHIP_COLOR[f.value] : "default"}
              variant={active ? "filled" : "outlined"}
              onClick={() => onTypeFilter(f.value)}
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

      {/* Right-side dropdown */}
      <FormControl size="small" sx={{ minWidth: 148 }}>
        <InputLabel>{dropdownLabel}</InputLabel>
        <Select value={dropdownValue} label={dropdownLabel} onChange={onDropdown}>
          {dropdownOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
