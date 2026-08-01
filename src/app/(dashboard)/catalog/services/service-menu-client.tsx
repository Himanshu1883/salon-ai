"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  createService,
  updateService,
  deleteService,
  duplicateService,
  reorderServices,
} from "@/actions/services";
import {
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from "@/actions/service-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  SlidersHorizontal,
  GripVertical,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Copy,
  ChevronDown as ChevronDownIcon,
  Scissors,
  Clock,
  Layers,
  FolderOpen,
  ArrowUpDown,
} from "lucide-react";
import { invoiceModalStyles } from "@/components/billing/invoice-modal/styles";
import { formatCurrency, formatDuration, cn } from "@/lib/utils";

type Employee = { id: string; name: string };

type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  categoryId: string | null;
  sortOrder: number;
  employees: { employee: { id: string; name: string } }[];
};

type CategoryGroup = {
  id: string;
  name: string;
  sortOrder: number;
  services: ServiceItem[];
};

const dialogClassName =
  "rounded-2xl border-dashboard-border bg-dashboard-card sm:max-w-lg";

function ServiceForm({
  service,
  categories,
  employees,
  defaultCategoryId,
  onSuccess,
}: {
  service?: ServiceItem;
  categories: { id: string; name: string }[];
  employees: Employee[];
  defaultCategoryId?: string;
  onSuccess: (service?: ServiceItem) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState(
    service?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? ""
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    service?.employees.map((e) => e.employee.id) ?? []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", categoryId);
    selectedEmployees.forEach((id) => formData.append("employeeIds", id));

    const result = service
      ? await updateService(service.id, formData)
      : await createService(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if ("service" in result && result.service) {
      onSuccess(result.service as ServiceItem);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name" className={invoiceModalStyles.label}>
            Service name
          </Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={service?.name}
            className={invoiceModalStyles.input}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description" className={invoiceModalStyles.label}>
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={service?.description ?? ""}
            className={invoiceModalStyles.textarea}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration" className={invoiceModalStyles.label}>
            Duration (minutes)
          </Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min={5}
            required
            defaultValue={service?.duration ?? 30}
            className={invoiceModalStyles.input}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price" className={invoiceModalStyles.label}>
            Price (₹)
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={service?.price ?? 0}
            className={invoiceModalStyles.input}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label className={invoiceModalStyles.label}>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className={invoiceModalStyles.selectTrigger}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {employees.length > 0 && (
        <div className="space-y-2">
          <Label className={invoiceModalStyles.label}>
            Assigned employees (optional)
          </Label>
          <div className="flex flex-wrap gap-2">
            {employees.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() =>
                  setSelectedEmployees((prev) =>
                    prev.includes(emp.id)
                      ? prev.filter((id) => id !== emp.id)
                      : [...prev, emp.id]
                  )
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedEmployees.includes(emp.id)
                    ? "border-violet-300 bg-violet-50 text-violet-700"
                    : "border-dashboard-border bg-white text-dashboard-muted hover:border-violet-200 hover:bg-violet-50/50"
                )}
              >
                {emp.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-dashboard-danger">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className={cn("w-full", invoiceModalStyles.primaryButton)}
      >
        {loading ? "Saving..." : service ? "Update service" : "Add service"}
      </Button>
    </form>
  );
}

type CategorySummary = { id: string; name: string; sortOrder: number };

const ACTION_TIMEOUT_MS = 25_000;

async function withTimeout<T>(
  promise: Promise<T>,
  message: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ACTION_TIMEOUT_MS)
    ),
  ]);
}

function CategoryForm({
  category,
  onSuccess,
}: {
  category?: { id: string; name: string };
  onSuccess: (category: CategorySummary) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    setError("");

    try {
      const result = await withTimeout(
        category
          ? updateServiceCategory(category.id, formData)
          : createServiceCategory(formData),
        "Save timed out. Check your connection and try again."
      );

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("category" in result && result.category) {
        onSuccess(result.category);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save category."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="cat-name" className={invoiceModalStyles.label}>
          Category name
        </Label>
        <Input
          id="cat-name"
          name="name"
          required
          defaultValue={category?.name}
          placeholder="e.g. Hair & styling"
          className={invoiceModalStyles.input}
        />
      </div>
      {error && <p className="text-sm text-dashboard-danger">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className={cn("w-full", invoiceModalStyles.primaryButton)}
      >
        {loading ? "Saving..." : category ? "Update category" : "Add category"}
      </Button>
    </form>
  );
}

function ServiceReorderCard({
  service,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  service: ServiceItem;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="group flex items-stretch overflow-hidden rounded-2xl border border-dashboard-border bg-white shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
      <div className="w-1 shrink-0 bg-gradient-to-b from-dashboard-primary to-dashboard-secondary" />
      <div className="flex flex-1 items-center gap-3 px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            className="rounded-lg p-0.5 text-dashboard-muted hover:bg-violet-50 hover:text-dashboard-primary disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <GripVertical className="h-4 w-4 text-dashboard-muted/40" />
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            className="rounded-lg p-0.5 text-dashboard-muted hover:bg-violet-50 hover:text-dashboard-primary disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-dashboard-text">{service.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-dashboard-muted">
            <Clock className="h-3 w-3" />
            {formatDuration(service.duration)}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums text-dashboard-text">
          {formatCurrency(service.price)}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-xl text-dashboard-muted hover:bg-violet-50 hover:text-dashboard-primary"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={onEdit} className="rounded-lg">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate} className="rounded-lg">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="rounded-lg text-dashboard-danger focus:text-dashboard-danger"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ServiceActionsMenu({
  onEdit,
  onDuplicate,
  onDelete,
}: {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-dashboard-muted hover:bg-violet-50 hover:text-dashboard-primary"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem onClick={onEdit} className="rounded-lg">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate} className="rounded-lg">
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="rounded-lg text-dashboard-danger focus:text-dashboard-danger"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ServicesTable({
  services,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  services: ServiceItem[];
  onEdit: (service: ServiceItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-dashboard-border">
      <Table>
        <TableHeader>
          <TableRow className="border-dashboard-border bg-dashboard-bg/60 hover:bg-dashboard-bg/60">
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Service
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Duration
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Price
            </TableHead>
            <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-dashboard-muted sm:table-cell">
              Staff
            </TableHead>
            <TableHead className="w-12 text-right text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow
              key={service.id}
              className="border-dashboard-border/60 transition-colors hover:bg-violet-50/30"
            >
              <TableCell>
                <div className="min-w-0">
                  <p className="font-medium text-dashboard-text">
                    {service.name}
                  </p>
                  {service.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-dashboard-muted">
                      {service.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-sm text-dashboard-muted">
                  <Clock className="h-3.5 w-3.5 text-dashboard-primary" />
                  {formatDuration(service.duration)}
                </span>
              </TableCell>
              <TableCell className="font-semibold tabular-nums text-dashboard-text">
                {formatCurrency(service.price)}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {service.employees.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {service.employees.slice(0, 2).map(({ employee }) => (
                      <Badge
                        key={employee.id}
                        variant="secondary"
                        className="rounded-lg bg-dashboard-bg text-xs text-dashboard-text"
                      >
                        {employee.name}
                      </Badge>
                    ))}
                    {service.employees.length > 2 && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-violet-50 text-xs text-violet-700"
                      >
                        +{service.employees.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-dashboard-muted">Any staff</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <ServiceActionsMenu
                  onEdit={() => onEdit(service)}
                  onDelete={() => onDelete(service.id)}
                  onDuplicate={() => onDuplicate(service.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  accent,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-[20px] border border-dashboard-border bg-dashboard-card p-5 shadow-dashboard-card"
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            iconBg,
            accent
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-dashboard-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-dashboard-text">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function ServiceMenuClient({
  categories: initialCategories,
  uncategorized,
  employees,
}: {
  categories: CategoryGroup[];
  uncategorized: ServiceItem[];
  employees: Employee[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [manageOrder, setManageOrder] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editService, setEditService] = useState<ServiceItem | null>(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [localCategories, setLocalCategories] = useState(initialCategories);

  useEffect(() => {
    setLocalCategories(initialCategories);
  }, [initialCategories]);

  const totalServices = useMemo(
    () =>
      initialCategories.reduce((sum, c) => sum + c.services.length, 0) +
      uncategorized.length,
    [initialCategories, uncategorized]
  );

  const avgPrice = useMemo(() => {
    const all = [
      ...initialCategories.flatMap((c) => c.services),
      ...uncategorized,
    ];
    if (all.length === 0) return 0;
    return all.reduce((sum, s) => sum + s.price, 0) / all.length;
  }, [initialCategories, uncategorized]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    let groups = localCategories.map((cat) => ({
      ...cat,
      services: cat.services.filter((s) =>
        q ? s.name.toLowerCase().includes(q) : true
      ),
    }));

    if (selectedCategoryId) {
      groups = groups.filter((g) => g.id === selectedCategoryId);
    }

    return groups.filter((g) => g.services.length > 0 || !q);
  }, [localCategories, search, selectedCategoryId]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const cat of localCategories) {
      map.set(cat.id, cat.services.length);
    }
    return map;
  }, [localCategories]);

  function upsertLocalService(service: ServiceItem) {
    setLocalCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== service.categoryId) {
          return {
            ...cat,
            services: cat.services.filter((s) => s.id !== service.id),
          };
        }
        const existing = cat.services.findIndex((s) => s.id === service.id);
        const services =
          existing >= 0
            ? cat.services.map((s) => (s.id === service.id ? service : s))
            : [...cat.services, service];
        return { ...cat, services };
      })
    );
  }

  async function handleDeleteService(id: string) {
    if (!confirm("Delete this service?")) return;
    setLocalCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        services: cat.services.filter((s) => s.id !== id),
      }))
    );
    await deleteService(id);
  }

  async function handleDuplicate(id: string) {
    await duplicateService(id);
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Delete this category?")) return;
    const result = await deleteServiceCategory(id);
    if ("error" in result && result.error) {
      alert(result.error);
      return;
    }
    if (selectedCategoryId === id) setSelectedCategoryId(null);
    setLocalCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function moveService(
    categoryId: string,
    services: ServiceItem[],
    index: number,
    direction: "up" | "down"
  ) {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= services.length) return;

    const ordered = [...services];
    [ordered[index], ordered[newIndex]] = [ordered[newIndex], ordered[index]];

    setLocalCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, services: ordered } : cat
      )
    );

    await reorderServices(
      categoryId,
      ordered.map((s) => s.id)
    );
  }

  function openEditService(service: ServiceItem) {
    setEditService(service);
    setAddOpen(true);
  }

  return (
    <div className="space-y-6 pb-8 font-[family-name:var(--font-inter)]">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-[20px] border border-dashboard-border bg-dashboard-card shadow-dashboard-card"
      >
        <div className="bg-gradient-to-br from-violet-600/5 via-dashboard-card to-dashboard-card px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-dashboard-primary to-violet-500 text-white shadow-lg shadow-violet-500/25 sm:h-20 sm:w-20">
                <Scissors className="h-8 w-8 sm:h-9 sm:w-9" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-dashboard-text sm:text-3xl">
                  Service menu
                </h1>
                <p className="mt-1 text-sm text-dashboard-muted">
                  View and manage the services offered by your business.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="rounded-lg border-0 bg-violet-100 px-2.5 py-0.5 text-violet-700 hover:bg-violet-100">
                    <Layers className="mr-1 h-3 w-3" />
                    {localCategories.length} categories
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="rounded-lg bg-dashboard-bg text-dashboard-text"
                  >
                    {totalServices} services
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-dashboard-border bg-white shadow-sm hover:border-violet-200 hover:bg-violet-50"
                  >
                    Options
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem
                    onClick={() => setAddCategoryOpen(true)}
                    className="rounded-lg"
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Add category
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setManageOrder((v) => !v)}
                    className="rounded-lg"
                  >
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    {manageOrder ? "Done reordering" : "Manage order"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => setEditService(null)}
                    className="rounded-xl bg-gradient-to-r from-dashboard-primary to-dashboard-secondary shadow-md shadow-violet-500/20 hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Add service
                  </Button>
                </DialogTrigger>
                <DialogContent className={dialogClassName}>
                  <DialogHeader>
                    <DialogTitle className="text-dashboard-text">
                      Add service
                    </DialogTitle>
                  </DialogHeader>
                  <ServiceForm
                    categories={localCategories.map((c) => ({
                      id: c.id,
                      name: c.name,
                    }))}
                    employees={employees}
                    defaultCategoryId={selectedCategoryId ?? undefined}
                    onSuccess={(service) => {
                      setAddOpen(false);
                      if (service) upsertLocalService(service as ServiceItem);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total services"
          value={String(totalServices)}
          icon={<Scissors className="h-5 w-5" />}
          iconBg="bg-violet-50"
          accent="text-dashboard-primary"
          delay={0.05}
        />
        <StatCard
          label="Categories"
          value={String(localCategories.length)}
          icon={<Layers className="h-5 w-5" />}
          iconBg="bg-indigo-50"
          accent="text-indigo-600"
          delay={0.1}
        />
        <StatCard
          label="Average price"
          value={formatCurrency(avgPrice)}
          icon={<Clock className="h-5 w-5" />}
          iconBg="bg-emerald-50"
          accent="text-emerald-600"
          delay={0.15}
        />
      </div>

      {/* Search & filters toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dashboard-muted" />
          <Input
            placeholder="Search service name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(invoiceModalStyles.input, "h-11 pl-11")}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "h-11 rounded-2xl border-dashboard-border bg-white shadow-sm hover:border-violet-200 hover:bg-violet-50",
            showFilters && "border-violet-300 bg-violet-50 text-violet-700"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
        <Button
          variant={manageOrder ? "default" : "outline"}
          onClick={() => setManageOrder((v) => !v)}
          className={cn(
            "h-11 rounded-2xl",
            manageOrder
              ? "bg-gradient-to-r from-dashboard-primary to-dashboard-secondary shadow-md shadow-violet-500/20"
              : "border-dashboard-border bg-white shadow-sm hover:border-violet-200 hover:bg-violet-50"
          )}
        >
          <ArrowUpDown className="h-4 w-4" />
          {manageOrder ? "Done reordering" : "Manage order"}
        </Button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden rounded-[20px] border border-dashboard-border bg-dashboard-card p-4 shadow-dashboard-card"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
            Filter by category
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedCategoryId === null ? "default" : "outline"}
              onClick={() => setSelectedCategoryId(null)}
              className={cn(
                "rounded-xl",
                selectedCategoryId === null
                  ? "bg-gradient-to-r from-dashboard-primary to-dashboard-secondary"
                  : "border-dashboard-border hover:border-violet-200 hover:bg-violet-50"
              )}
            >
              All categories
            </Button>
            {localCategories.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={
                  selectedCategoryId === cat.id ? "default" : "outline"
                }
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "rounded-xl",
                  selectedCategoryId === cat.id
                    ? "bg-gradient-to-r from-dashboard-primary to-dashboard-secondary"
                    : "border-dashboard-border hover:border-violet-200 hover:bg-violet-50"
                )}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Category sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="h-fit rounded-[20px] border border-dashboard-border bg-dashboard-card p-5 shadow-dashboard-card"
        >
          <h2 className="mb-4 text-sm font-semibold text-dashboard-text">
            Categories
          </h2>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  selectedCategoryId === null
                    ? "bg-violet-50 font-medium text-dashboard-primary"
                    : "text-dashboard-muted hover:bg-dashboard-bg"
                )}
              >
                <span>All categories</span>
                <span
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-xs tabular-nums",
                    selectedCategoryId === null
                      ? "bg-violet-100 text-violet-700"
                      : "bg-dashboard-bg text-dashboard-muted"
                  )}
                >
                  {totalServices}
                </span>
              </button>
            </li>
            {localCategories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    selectedCategoryId === cat.id
                      ? "bg-violet-50 font-medium text-dashboard-primary"
                      : "text-dashboard-muted hover:bg-dashboard-bg"
                  )}
                >
                  <span className="truncate">{cat.name}</span>
                  <span
                    className={cn(
                      "ml-2 shrink-0 rounded-lg px-2 py-0.5 text-xs tabular-nums",
                      selectedCategoryId === cat.id
                        ? "bg-violet-100 text-violet-700"
                        : "bg-dashboard-bg text-dashboard-muted"
                    )}
                  >
                    {categoryCounts.get(cat.id) ?? 0}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setAddCategoryOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 px-3 py-2.5 text-sm font-medium text-dashboard-primary transition-colors hover:border-violet-300 hover:bg-violet-50"
          >
            <Plus className="h-4 w-4" />
            Add category
          </button>
        </motion.div>

        {/* Services content */}
        <div className="space-y-8">
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-dashboard-border bg-dashboard-bg/50 px-6 py-16 text-center">
              <Scissors className="mb-3 h-10 w-10 text-dashboard-muted/50" />
              <p className="text-sm font-medium text-dashboard-text">
                No services match your search
              </p>
              <p className="mt-1 text-xs text-dashboard-muted">
                Try adjusting filters or add a new service to get started.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setEditService(null);
                  setAddOpen(true);
                }}
                className="mt-4 rounded-xl bg-gradient-to-r from-dashboard-primary to-dashboard-secondary shadow-md shadow-violet-500/20"
              >
                <Plus className="h-4 w-4" />
                Add service
              </Button>
            </div>
          ) : (
            filteredGroups.map((group, groupIndex) => (
              <motion.section
                key={group.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-dashboard-primary">
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-dashboard-text">
                        {group.name}
                      </h2>
                      <p className="text-xs text-dashboard-muted">
                        {group.services.length}{" "}
                        {group.services.length === 1 ? "service" : "services"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-dashboard-muted hover:bg-violet-50 hover:text-dashboard-primary"
                      >
                        Actions
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem
                        onClick={() =>
                          setEditCategory({ id: group.id, name: group.name })
                        }
                        className="rounded-lg"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit category
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteCategory(group.id)}
                        className="rounded-lg text-dashboard-danger focus:text-dashboard-danger"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {manageOrder ? (
                  <div className="space-y-2">
                    {group.services.map((service, index) => (
                      <ServiceReorderCard
                        key={service.id}
                        service={service}
                        canMoveUp={index > 0}
                        canMoveDown={index < group.services.length - 1}
                        onMoveUp={() =>
                          moveService(group.id, group.services, index, "up")
                        }
                        onMoveDown={() =>
                          moveService(group.id, group.services, index, "down")
                        }
                        onEdit={() => openEditService(service)}
                        onDelete={() => handleDeleteService(service.id)}
                        onDuplicate={() => handleDuplicate(service.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <ServicesTable
                    services={group.services}
                    onEdit={openEditService}
                    onDelete={handleDeleteService}
                    onDuplicate={handleDuplicate}
                  />
                )}
              </motion.section>
            ))
          )}
        </div>
      </div>

      <Dialog
        open={!!editService && addOpen}
        onOpenChange={(open) => {
          if (!open) setEditService(null);
          setAddOpen(open);
        }}
      >
        <DialogContent className={dialogClassName}>
          <DialogHeader>
            <DialogTitle className="text-dashboard-text">
              Edit service
            </DialogTitle>
          </DialogHeader>
          {editService && (
            <ServiceForm
              service={editService}
              categories={localCategories.map((c) => ({
                id: c.id,
                name: c.name,
              }))}
              employees={employees}
              onSuccess={(service) => {
                setEditService(null);
                setAddOpen(false);
                if (service) upsertLocalService(service);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <DialogContent className={dialogClassName}>
          <DialogHeader>
            <DialogTitle className="text-dashboard-text">
              Add category
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSuccess={(category) => {
              setAddCategoryOpen(false);
              setLocalCategories((prev) => [
                ...prev,
                { ...category, services: [] },
              ]);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editCategory}
        onOpenChange={(open) => !open && setEditCategory(null)}
      >
        <DialogContent className={dialogClassName}>
          <DialogHeader>
            <DialogTitle className="text-dashboard-text">
              Edit category
            </DialogTitle>
          </DialogHeader>
          {editCategory && (
            <CategoryForm
              category={editCategory}
              onSuccess={(category) => {
                setEditCategory(null);
                setLocalCategories((prev) =>
                  prev.map((c) =>
                    c.id === category.id
                      ? {
                          ...c,
                          name: category.name,
                          sortOrder: category.sortOrder,
                        }
                      : c
                  )
                );
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
