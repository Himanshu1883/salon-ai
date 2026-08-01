"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  FolderKanban,
  MoreHorizontal,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import {
  createProject,
  deleteProject,
  updateProject,
  updateProjectStatus,
  type ProjectListItem,
} from "@/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DEFAULT_VISIBLE_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_PRIORITY_COLORS,
  PROJECT_PRIORITY_LABELS,
  PROJECT_STATUSES,
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_TABS,
  type ProjectPriority,
  type ProjectStatus,
} from "@/lib/projects";

type EmployeeOption = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

function ProjectForm({
  project,
  employees,
  onSuccess,
}: {
  project?: ProjectListItem;
  employees: EmployeeOption[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "PLANNING");
  const [priority, setPriority] = useState<string>(project?.priority ?? "none");
  const [assignee, setAssignee] = useState<string>(
    project?.assignedEmployeeId ?? "none"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("status", status);
    if (priority !== "none") formData.set("priority", priority);
    if (assignee !== "none") formData.set("assignedEmployeeId", assignee);

    const result = project
      ? await updateProject(project.id, formData)
      : await createProject(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={project?.name}
          placeholder="e.g. Salon renovation"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={project?.description ?? ""}
          placeholder="Optional details..."
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {PROJECT_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {PROJECT_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PROJECT_PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={
              project?.dueDate
                ? format(new Date(project.dueDate), "yyyy-MM-dd")
                : ""
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Assign to</Label>
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 hover:bg-violet-700"
      >
        {loading ? "Saving..." : project ? "Update project" : "Create project"}
      </Button>
    </form>
  );
}

function ProjectCard({
  project,
  employees,
  onRefresh,
}: {
  project: ProjectListItem;
  employees: EmployeeOption[];
  onRefresh: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleStatusChange(status: ProjectStatus) {
    startTransition(async () => {
      await updateProjectStatus(project.id, status);
      onRefresh();
    });
  }

  function handleDelete() {
    if (!confirm("Delete this project?")) return;
    startTransition(async () => {
      await deleteProject(project.id);
      onRefresh();
    });
  }

  return (
    <>
      <motion.div
        layout
        className={cn(
          "group rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
          pending && "opacity-60"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-stone-900">{project.name}</h3>
            {project.description && (
              <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                {project.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {PROJECT_STATUSES.filter((s) => s !== project.status).map((s) => (
                <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)}>
                  Move to {PROJECT_STATUS_LABELS[s]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {project.priority && (
            <span
              className={cn(
                "font-medium",
                PROJECT_PRIORITY_COLORS[project.priority as ProjectPriority]
              )}
            >
              {PROJECT_PRIORITY_LABELS[project.priority as ProjectPriority]}
            </span>
          )}
          {project.dueDate && (
            <span className="flex items-center gap-1 text-stone-500">
              <Calendar className="h-3 w-3" />
              {format(new Date(project.dueDate), "MMM d, yyyy")}
            </span>
          )}
          {project.assignedEmployee && (
            <span className="flex items-center gap-1 text-stone-500">
              <User className="h-3 w-3" />
              {project.assignedEmployee.name}
            </span>
          )}
        </div>
      </motion.div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            project={project}
            employees={employees}
            onSuccess={() => {
              setEditOpen(false);
              onRefresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function EmptyColumn({ status }: { status: ProjectStatus }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white/60 px-4 py-10 text-center">
      <FolderKanban className="mb-2 h-8 w-8 text-stone-300" />
      <p className="text-sm font-medium text-stone-500">No {PROJECT_STATUS_LABELS[status].toLowerCase()} projects</p>
      <p className="mt-1 text-xs text-stone-400">
        Create a project or move one here
      </p>
    </div>
  );
}

export function ProjectsClient({
  projects,
  employees,
}: {
  projects: ProjectListItem[];
  employees: EmployeeOption[];
}) {
  const router = useRouter();
  const [visibleStatuses, setVisibleStatuses] = useState<Set<ProjectStatus>>(
    () => new Set(DEFAULT_VISIBLE_STATUSES)
  );
  const [createOpen, setCreateOpen] = useState(false);

  function toggleStatus(status: ProjectStatus) {
    setVisibleStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        if (next.size === 1) return prev;
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }

  function handleRefresh() {
    router.refresh();
  }

  const grouped = useMemo(() => {
    const map = Object.fromEntries(
      PROJECT_STATUSES.map((s) => [s, [] as ProjectListItem[]])
    ) as Record<ProjectStatus, ProjectListItem[]>;
    for (const project of projects) {
      map[project.status].push(project);
    }
    return map;
  }, [projects]);

  const activeColumns = PROJECT_STATUSES.filter((s) => visibleStatuses.has(s));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Projects
          </h1>
          <p className="mt-1 text-stone-500">
            Track salon initiatives, renovations, and team tasks
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700">
              <Plus className="mr-2 h-4 w-4" />
              New project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              employees={employees}
              onSuccess={() => {
                setCreateOpen(false);
                handleRefresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div
        role="tablist"
        aria-label="Filter projects by status"
        className="flex gap-1 overflow-x-auto rounded-2xl border border-[#E8ECF4] bg-stone-50/90 p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {PROJECT_STATUS_TABS.map((tab) => {
          const active = visibleStatuses.has(tab.value);
          const count = grouped[tab.value].length;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => toggleStatus(tab.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-violet-600/10 text-violet-900 shadow-sm shadow-violet-600/10"
                  : "text-stone-500 hover:bg-white hover:text-stone-800"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-xs tabular-nums",
                  active
                    ? "bg-violet-600/10 text-violet-800"
                    : "bg-stone-200/70 text-stone-500"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "grid gap-4",
          activeColumns.length === 1 && "grid-cols-1",
          activeColumns.length === 2 && "grid-cols-1 md:grid-cols-2",
          activeColumns.length >= 3 && "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
          activeColumns.length >= 4 && "xl:grid-cols-4",
          activeColumns.length >= 5 && "xl:grid-cols-5"
        )}
      >
        {activeColumns.map((status) => (
          <div
            key={status}
            className={cn(
              "flex min-h-[420px] flex-col rounded-[20px] border p-3",
              PROJECT_STATUS_COLORS[status].column
            )}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-stone-800">
                {PROJECT_STATUS_LABELS[status]}
              </h2>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  PROJECT_STATUS_COLORS[status].badge
                )}
              >
                {grouped[status].length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              {grouped[status].length === 0 ? (
                <EmptyColumn status={status} />
              ) : (
                grouped[status].map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    employees={employees}
                    onRefresh={handleRefresh}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
