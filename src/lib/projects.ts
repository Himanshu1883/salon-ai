export const PROJECT_STATUSES = [
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELED",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const DEFAULT_VISIBLE_STATUSES: ProjectStatus[] = [
  "PLANNING",
  "IN_PROGRESS",
];

export const PROJECT_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
};

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const PROJECT_STATUS_COLORS: Record<
  ProjectStatus,
  { chip: string; column: string; badge: string }
> = {
  PLANNING: {
    chip: "bg-violet-100 text-violet-800 border-violet-200",
    column: "border-violet-200 bg-violet-50/50",
    badge: "bg-violet-100 text-violet-800",
  },
  IN_PROGRESS: {
    chip: "bg-blue-100 text-blue-800 border-blue-200",
    column: "border-blue-200 bg-blue-50/50",
    badge: "bg-blue-100 text-blue-800",
  },
  ON_HOLD: {
    chip: "bg-amber-100 text-amber-800 border-amber-200",
    column: "border-amber-200 bg-amber-50/50",
    badge: "bg-amber-100 text-amber-800",
  },
  COMPLETED: {
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    column: "border-emerald-200 bg-emerald-50/50",
    badge: "bg-emerald-100 text-emerald-800",
  },
  CANCELED: {
    chip: "bg-stone-100 text-stone-600 border-stone-200",
    column: "border-stone-200 bg-stone-50/50",
    badge: "bg-stone-100 text-stone-600",
  },
};

export const PROJECT_PRIORITY_COLORS: Record<ProjectPriority, string> = {
  LOW: "text-stone-500",
  MEDIUM: "text-blue-600",
  HIGH: "text-amber-600",
  URGENT: "text-red-600",
};
