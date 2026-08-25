"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  deleteService,
  duplicateService,
  reorderServices,
} from "@/actions/services";
import {
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from "@/actions/service-categories";
import {
  BulkActionBar,
  BulkAddCategoriesDialog,
  BulkAddServicesDialog,
  BulkDeleteCategoriesDialog,
  BulkDeleteConfirmDialog,
  runBulkDeleteCategories,
  runBulkDeleteServices,
  type CategoryBulkDeleteHandling,
} from "./service-bulk-actions";
import { ServiceForm, PackageForm, AddOnForm } from "./catalog-forms";
import { CatalogDialogContent, catalogFormFooterClassName } from "./catalog-dialog";
import type { CatalogServiceItem, CatalogTab, CategoryGroup } from "./catalog-types";
import {
  AUDIENCE_LABELS,
  CATALOG_TYPE_LABELS,
  CATEGORY_GROUP_LABELS,
  STATUS_LABELS,
  SERVICE_AUDIENCES,
  SERVICE_STATUSES,
} from "@/lib/catalog/constants";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
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
  CheckSquare,
  Package,
  Sparkles,
} from "lucide-react";
import { invoiceModalStyles } from "@/components/billing/invoice-modal/styles";
import { formatCurrency, formatDuration, cn } from "@/lib/utils";

type Employee = { id: string; name: string };

const CATALOG_TABS: { id: CatalogTab; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "SERVICE", label: "Services" },
  { id: "PACKAGE", label: "Packages" },
  { id: "ADD_ON", label: "Add-ons" },
];

function matchesCatalogFilters(
  item: CatalogServiceItem,
  opts: {
    q: string;
    catalogTab: CatalogTab;
    audience: string | null;
    status: string | null;
    staffId: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    minDuration: number | null;
    maxDuration: number | null;
  }
) {
  const haystack = [
    item.name,
    item.description ?? "",
    item.categoryName ?? "",
    AUDIENCE_LABELS[item.audience as keyof typeof AUDIENCE_LABELS] ?? item.audience,
  ]
    .join(" ")
    .toLowerCase();

  if (opts.q && !haystack.includes(opts.q)) return false;
  if (opts.catalogTab !== "ALL" && item.catalogType !== opts.catalogTab) return false;
  if (opts.audience && item.audience !== opts.audience) return false;
  if (opts.status && item.status !== opts.status) return false;
  if (opts.staffId) {
    const ids = item.employees.map((e) => e.employee.id);
    if (!ids.includes(opts.staffId)) return false;
  }
  if (opts.minPrice != null && item.price < opts.minPrice) return false;
  if (opts.maxPrice != null && item.price > opts.maxPrice) return false;
  if (opts.minDuration != null && item.duration < opts.minDuration) return false;
  if (opts.maxDuration != null && item.duration > opts.maxDuration) return false;
  return true;
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
      <div className={catalogFormFooterClassName}>
        <Button
          type="submit"
          disabled={loading}
          className={cn("w-full", invoiceModalStyles.primaryButton)}
        >
          {loading ? "Saving..." : category ? "Update category" : "Add category"}
        </Button>
      </div>
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
  service: CatalogServiceItem;
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
  bulkMode = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: {
  services: CatalogServiceItem[];
  onEdit: (service: CatalogServiceItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  bulkMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (ids: string[], select: boolean) => void;
}) {
  const serviceIds = services.map((s) => s.id);
  const allSelected =
    bulkMode &&
    serviceIds.length > 0 &&
    serviceIds.every((id) => selectedIds?.has(id));
  const someSelected =
    bulkMode && serviceIds.some((id) => selectedIds?.has(id));

  return (
    <div className="overflow-hidden rounded-2xl border border-dashboard-border">
      <Table>
        <TableHeader>
          <TableRow className="border-dashboard-border bg-dashboard-bg/60 hover:bg-dashboard-bg/60">
            {bulkMode && (
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = Boolean(someSelected && !allSelected);
                  }}
                  onChange={() =>
                    onToggleSelectAll?.(serviceIds, !allSelected)
                  }
                  aria-label="Select all services in category"
                />
              </TableHead>
            )}
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Type
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Name
            </TableHead>
            <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-dashboard-muted md:table-cell">
              Category
            </TableHead>
            <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-dashboard-muted sm:table-cell">
              Audience
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Duration
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Price
            </TableHead>
            <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-dashboard-muted lg:table-cell">
              Staff
            </TableHead>
            <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-dashboard-muted md:table-cell">
              Status
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
              className={cn(
                "border-dashboard-border/60 transition-colors hover:bg-violet-50/30",
                bulkMode &&
                  selectedIds?.has(service.id) &&
                  "bg-violet-50/50"
              )}
            >
              {bulkMode && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds?.has(service.id) ?? false}
                    onChange={() => onToggleSelect?.(service.id)}
                    aria-label={`Select ${service.name}`}
                  />
                </TableCell>
              )}
              <TableCell>
                <Badge variant="secondary" className="rounded-lg bg-violet-50 text-xs text-violet-700">
                  {CATALOG_TYPE_LABELS[service.catalogType as keyof typeof CATALOG_TYPE_LABELS] ?? service.catalogType}
                </Badge>
              </TableCell>
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
                  {service.catalogType === "PACKAGE" && service.packageItems.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {service.packageItems.map((item) => (
                        <Badge
                          key={item.id}
                          variant="secondary"
                          className="rounded-full border border-violet-200/80 bg-violet-50/80 px-2 py-0 text-[11px] font-medium text-violet-700"
                        >
                          {item.includedService.name}
                        </Badge>
                      ))}
                      {service.savings != null && service.savings > 0 && (
                        <span className="text-[11px] font-medium text-emerald-600">
                          Save {formatCurrency(service.savings)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="text-sm text-dashboard-muted">
                  {service.categoryName ?? "—"}
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="secondary" className="rounded-lg bg-dashboard-bg text-xs">
                  {AUDIENCE_LABELS[service.audience as keyof typeof AUDIENCE_LABELS] ?? service.audience}
                </Badge>
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
              <TableCell className="hidden lg:table-cell">
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
              <TableCell className="hidden md:table-cell">
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-lg text-xs",
                    service.status === "ACTIVE" && "bg-emerald-50 text-emerald-700",
                    service.status === "INACTIVE" && "bg-amber-50 text-amber-700",
                    service.status === "ARCHIVED" && "bg-stone-100 text-stone-600"
                  )}
                >
                  {STATUS_LABELS[service.status as keyof typeof STATUS_LABELS] ?? service.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {!bulkMode && (
                  <ServiceActionsMenu
                    onEdit={() => onEdit(service)}
                    onDelete={() => onDelete(service.id)}
                    onDuplicate={() => onDuplicate(service.id)}
                  />
                )}
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
  uncategorized: CatalogServiceItem[];
  employees: Employee[];
}) {
  const [search, setSearch] = useState("");
  const [catalogTab, setCatalogTab] = useState<CatalogTab>("ALL");
  const [filterAudience, setFilterAudience] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterStaffId, setFilterStaffId] = useState<string | null>(null);
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterMinDuration, setFilterMinDuration] = useState("");
  const [filterMaxDuration, setFilterMaxDuration] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [manageOrder, setManageOrder] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addPackageOpen, setAddPackageOpen] = useState(false);
  const [addAddOnOpen, setAddAddOnOpen] = useState(false);
  const [editItem, setEditItem] = useState<CatalogServiceItem | null>(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [localCategories, setLocalCategories] = useState(initialCategories);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set()
  );
  const [bulkDeleteType, setBulkDeleteType] = useState<
    "services" | "categories" | null
  >(null);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkAddServicesOpen, setBulkAddServicesOpen] = useState(false);
  const [bulkAddCategoriesOpen, setBulkAddCategoriesOpen] = useState(false);

  useEffect(() => {
    setLocalCategories(initialCategories);
  }, [initialCategories]);

  const allCatalogItems = useMemo(
    () => [
      ...localCategories.flatMap((c) => c.services),
      ...uncategorized,
    ],
    [localCategories, uncategorized]
  );

  const typeCounts = useMemo(() => {
    const counts = { SERVICE: 0, PACKAGE: 0, ADD_ON: 0 };
    for (const item of allCatalogItems) {
      if (item.catalogType in counts) {
        counts[item.catalogType as keyof typeof counts]++;
      }
    }
    return counts;
  }, [allCatalogItems]);

  const avgPrice = useMemo(() => {
    if (allCatalogItems.length === 0) return 0;
    return allCatalogItems.reduce((sum, s) => sum + s.price, 0) / allCatalogItems.length;
  }, [allCatalogItems]);

  const bookableServices = useMemo(
    () => allCatalogItems.filter((s) => s.catalogType === "SERVICE"),
    [allCatalogItems]
  );

  const addOnOptions = useMemo(
    () => allCatalogItems.filter((s) => s.catalogType === "ADD_ON" && s.status !== "ARCHIVED"),
    [allCatalogItems]
  );

  const filterOpts = useMemo(
    () => ({
      q: search.trim().toLowerCase(),
      catalogTab,
      audience: filterAudience,
      status: filterStatus,
      staffId: filterStaffId,
      minPrice: filterMinPrice ? Number(filterMinPrice) : null,
      maxPrice: filterMaxPrice ? Number(filterMaxPrice) : null,
      minDuration: filterMinDuration ? Number(filterMinDuration) : null,
      maxDuration: filterMaxDuration ? Number(filterMaxDuration) : null,
    }),
    [
      search,
      catalogTab,
      filterAudience,
      filterStatus,
      filterStaffId,
      filterMinPrice,
      filterMaxPrice,
      filterMinDuration,
      filterMaxDuration,
    ]
  );

  const filteredGroups = useMemo(() => {
    let groups = localCategories.map((cat) => ({
      ...cat,
      services: cat.services.filter((s) => matchesCatalogFilters(s, filterOpts)),
    }));

    if (selectedCategoryId) {
      groups = groups.filter((g) => g.id === selectedCategoryId);
    }

    return groups.filter((g) => g.services.length > 0 || !filterOpts.q);
  }, [localCategories, selectedCategoryId, filterOpts]);

  const filteredUncategorized = useMemo(
    () => uncategorized.filter((s) => matchesCatalogFilters(s, filterOpts)),
    [uncategorized, filterOpts]
  );

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const cat of localCategories) {
      map.set(
        cat.id,
        cat.services.filter((s) => matchesCatalogFilters(s, filterOpts)).length
      );
    }
    return map;
  }, [localCategories, filterOpts]);

  const sidebarSections = useMemo(() => {
    const groups: Record<string, CategoryGroup[]> = {
      SERVICES: [],
      PACKAGES: [],
      ADDONS: [],
    };
    for (const cat of localCategories) {
      const key = cat.categoryGroup ?? "SERVICES";
      if (groups[key]) groups[key].push(cat);
      else groups.SERVICES.push(cat);
    }
    return groups;
  }, [localCategories]);

  function toggleBulkMode() {
    setBulkMode((v) => {
      if (v) {
        setSelectedServiceIds(new Set());
        setSelectedCategoryIds(new Set());
      } else {
        setManageOrder(false);
      }
      return !v;
    });
  }

  function toggleServiceSelection(id: string) {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleServiceSelectionAll(ids: string[], select: boolean) {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (select) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function toggleCategorySelection(id: string) {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedServiceNames = useMemo(() => {
    const names: string[] = [];
    for (const cat of localCategories) {
      for (const service of cat.services) {
        if (selectedServiceIds.has(service.id)) names.push(service.name);
      }
    }
    return names;
  }, [localCategories, selectedServiceIds]);

  const selectedCategoryGroups = useMemo(
    () => localCategories.filter((c) => selectedCategoryIds.has(c.id)),
    [localCategories, selectedCategoryIds]
  );

  async function confirmBulkDeleteServices() {
    setBulkDeleteLoading(true);
    const ids = [...selectedServiceIds];
    const result = await runBulkDeleteServices(ids);
    setBulkDeleteLoading(false);
    if ("error" in result && result.error) {
      alert(result.error);
      return;
    }
    setLocalCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        services: cat.services.filter((s) => !selectedServiceIds.has(s.id)),
      }))
    );
    setSelectedServiceIds(new Set());
    setBulkDeleteType(null);
  }

  async function confirmBulkDeleteCategories(
    handling: CategoryBulkDeleteHandling
  ) {
    setBulkDeleteLoading(true);
    const ids = [...selectedCategoryIds];
    const result = await runBulkDeleteCategories(ids, handling);
    setBulkDeleteLoading(false);
    if ("error" in result && result.error) {
      alert(result.error);
      return;
    }

    if (handling.mode === "delete-services") {
      setLocalCategories((prev) =>
        prev.filter((c) => !selectedCategoryIds.has(c.id))
      );
    } else {
      const movedServices = selectedCategoryGroups.flatMap((c) => c.services);
      setLocalCategories((prev) => {
        const remaining = prev.filter((c) => !selectedCategoryIds.has(c.id));
        return remaining.map((cat) =>
          cat.id === handling.targetCategoryId
            ? { ...cat, services: [...cat.services, ...movedServices] }
            : cat
        );
      });
    }

    if (selectedCategoryId && selectedCategoryIds.has(selectedCategoryId)) {
      setSelectedCategoryId(null);
    }
    setSelectedCategoryIds(new Set());
    setBulkDeleteType(null);
  }

  async function confirmBulkDelete() {
    if (bulkDeleteType === "services") {
      await confirmBulkDeleteServices();
    }
  }

  function handleBulkServicesCreated(services: CatalogServiceItem[]) {
    setLocalCategories((prev) => {
      const byCategory = new Map<string, CatalogServiceItem[]>();
      for (const service of services) {
        if (!service.categoryId) continue;
        const list = byCategory.get(service.categoryId) ?? [];
        list.push(service);
        byCategory.set(service.categoryId, list);
      }
      return prev.map((cat) => {
        const added = byCategory.get(cat.id);
        if (!added?.length) return cat;
        return { ...cat, services: [...cat.services, ...added] };
      });
    });
  }

  function handleBulkCategoriesCreated(
    categories: { id: string; name: string; sortOrder: number }[]
  ) {
    setLocalCategories((prev) => [
      ...prev,
      ...categories.map((c) => ({ ...c, services: [] })),
    ]);
  }

  function upsertLocalService(service: CatalogServiceItem) {
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
    services: CatalogServiceItem[],
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

  function openEditItem(item: CatalogServiceItem) {
    setEditItem(item);
    if (item.catalogType === "PACKAGE") setAddPackageOpen(true);
    else if (item.catalogType === "ADD_ON") setAddAddOnOpen(true);
    else setAddOpen(true);
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
                    {allCatalogItems.length} catalog items
                  </Badge>
                  <Badge variant="secondary" className="rounded-lg bg-dashboard-bg text-dashboard-text">
                    {typeCounts.SERVICE} services
                  </Badge>
                  <Badge variant="secondary" className="rounded-lg bg-dashboard-bg text-dashboard-text">
                    {typeCounts.PACKAGE} packages
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
                    onClick={() => {
                      setManageOrder((v) => {
                        if (!v) setBulkMode(false);
                        return !v;
                      });
                    }}
                    className="rounded-lg"
                  >
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    {manageOrder ? "Done reordering" : "Manage order"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Dialog open={addPackageOpen} onOpenChange={setAddPackageOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" onClick={() => setEditItem(null)} className="rounded-xl border-dashboard-border">
                    <Package className="h-4 w-4" />
                    Add package
                  </Button>
                </DialogTrigger>
                <CatalogDialogContent
                  wide
                  title={editItem?.catalogType === "PACKAGE" ? "Edit package" : "Create package"}
                >
                  <PackageForm
                    pkg={editItem?.catalogType === "PACKAGE" ? editItem : undefined}
                    categories={localCategories.map((c) => ({ id: c.id, name: c.name, categoryGroup: c.categoryGroup }))}
                    employees={employees}
                    bookableServices={bookableServices}
                    defaultCategoryId={selectedCategoryId ?? undefined}
                    onSuccess={(service) => {
                      setAddPackageOpen(false);
                      setEditItem(null);
                      if (service) upsertLocalService(service);
                    }}
                  />
                </CatalogDialogContent>
              </Dialog>
              <Dialog open={addAddOnOpen} onOpenChange={setAddAddOnOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" onClick={() => setEditItem(null)} className="rounded-xl border-dashboard-border">
                    <Sparkles className="h-4 w-4" />
                    Add add-on
                  </Button>
                </DialogTrigger>
                <CatalogDialogContent
                  title={editItem?.catalogType === "ADD_ON" ? "Edit add-on" : "Add add-on"}
                >
                  <AddOnForm
                    addOn={editItem?.catalogType === "ADD_ON" ? editItem : undefined}
                    categories={localCategories.map((c) => ({ id: c.id, name: c.name, categoryGroup: c.categoryGroup }))}
                    employees={employees}
                    parentServiceOptions={bookableServices}
                    defaultCategoryId={selectedCategoryId ?? undefined}
                    onSuccess={(service) => {
                      setAddAddOnOpen(false);
                      setEditItem(null);
                      if (service) upsertLocalService(service);
                    }}
                  />
                </CatalogDialogContent>
              </Dialog>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => setEditItem(null)}
                    className="rounded-xl bg-gradient-to-r from-dashboard-primary to-dashboard-secondary shadow-md shadow-violet-500/20 hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Add service
                  </Button>
                </DialogTrigger>
                <CatalogDialogContent
                  title={editItem?.catalogType === "SERVICE" ? "Edit service" : "Add service"}
                >
                  <ServiceForm
                    service={editItem?.catalogType === "SERVICE" ? editItem : undefined}
                    categories={localCategories.map((c) => ({
                      id: c.id,
                      name: c.name,
                      categoryGroup: c.categoryGroup,
                    }))}
                    employees={employees}
                    addOnOptions={addOnOptions}
                    defaultCategoryId={selectedCategoryId ?? undefined}
                    onSubmitStart={() => {
                      setAddOpen(false);
                      setEditItem(null);
                    }}
                    onError={(message) => {
                      alert(message);
                      setAddOpen(true);
                    }}
                    onSuccess={(service) => {
                      setAddOpen(false);
                      setEditItem(null);
                      if (service) upsertLocalService(service);
                    }}
                  />
                </CatalogDialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total catalog items"
          value={String(allCatalogItems.length)}
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

      {/* Catalog type tabs */}
      <div className="flex flex-wrap gap-2 rounded-[20px] border border-dashboard-border bg-dashboard-card p-2 shadow-dashboard-card">
        {CATALOG_TABS.map((tab) => (
          <Button
            key={tab.id}
            size="sm"
            variant={catalogTab === tab.id ? "default" : "ghost"}
            onClick={() => setCatalogTab(tab.id)}
            className={cn(
              "rounded-xl",
              catalogTab === tab.id
                ? "bg-gradient-to-r from-dashboard-primary to-dashboard-secondary shadow-md shadow-violet-500/20"
                : "text-dashboard-muted hover:bg-violet-50 hover:text-dashboard-primary"
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Search & filters toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dashboard-muted" />
          <Input
            placeholder="Search name, category, audience..."
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
          variant={bulkMode ? "default" : "outline"}
          onClick={toggleBulkMode}
          className={cn(
            "h-11 rounded-2xl",
            bulkMode
              ? "bg-gradient-to-r from-dashboard-primary to-dashboard-secondary shadow-md shadow-violet-500/20"
              : "border-dashboard-border bg-white shadow-sm hover:border-violet-200 hover:bg-violet-50"
          )}
        >
          <CheckSquare className="h-4 w-4" />
          {bulkMode ? "Done selecting" : "Bulk actions"}
        </Button>
        <Button
          variant={manageOrder ? "default" : "outline"}
          onClick={() => {
            setManageOrder((v) => {
              if (!v) setBulkMode(false);
              return !v;
            });
          }}
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

      {bulkMode && (
        <BulkActionBar
          selectedServiceCount={selectedServiceIds.size}
          selectedCategoryCount={selectedCategoryIds.size}
          onDeleteServices={() => setBulkDeleteType("services")}
          onDeleteCategories={() => setBulkDeleteType("categories")}
          onAddServices={() => setBulkAddServicesOpen(true)}
          onAddCategories={() => setBulkAddCategoriesOpen(true)}
          onClearSelection={() => {
            setSelectedServiceIds(new Set());
            setSelectedCategoryIds(new Set());
          }}
          onExitBulkMode={() => {
            setBulkMode(false);
            setSelectedServiceIds(new Set());
            setSelectedCategoryIds(new Set());
          }}
        />
      )}

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden rounded-[20px] border border-dashboard-border bg-dashboard-card p-4 shadow-dashboard-card"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dashboard-muted">Audience</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={filterAudience === null ? "default" : "outline"} onClick={() => setFilterAudience(null)} className="rounded-xl">All</Button>
                {SERVICE_AUDIENCES.map((a) => (
                  <Button key={a} size="sm" variant={filterAudience === a ? "default" : "outline"} onClick={() => setFilterAudience(a)} className="rounded-xl">{AUDIENCE_LABELS[a]}</Button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dashboard-muted">Status</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={filterStatus === null ? "default" : "outline"} onClick={() => setFilterStatus(null)} className="rounded-xl">All</Button>
                {SERVICE_STATUSES.map((s) => (
                  <Button key={s} size="sm" variant={filterStatus === s ? "default" : "outline"} onClick={() => setFilterStatus(s)} className="rounded-xl">{STATUS_LABELS[s]}</Button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dashboard-muted">Staff</p>
              <Select value={filterStaffId ?? "all"} onValueChange={(v) => setFilterStaffId(v === "all" ? null : v)}>
                <SelectTrigger className={invoiceModalStyles.selectTrigger}><SelectValue placeholder="All staff" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All staff</SelectItem>
                  {employees.map((e) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-dashboard-muted">Min price</Label>
                <Input value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value)} type="number" min={0} className={invoiceModalStyles.input} />
              </div>
              <div>
                <Label className="text-xs text-dashboard-muted">Max price</Label>
                <Input value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value)} type="number" min={0} className={invoiceModalStyles.input} />
              </div>
              <div>
                <Label className="text-xs text-dashboard-muted">Min duration</Label>
                <Input value={filterMinDuration} onChange={(e) => setFilterMinDuration(e.target.value)} type="number" min={0} className={invoiceModalStyles.input} />
              </div>
              <div>
                <Label className="text-xs text-dashboard-muted">Max duration</Label>
                <Input value={filterMaxDuration} onChange={(e) => setFilterMaxDuration(e.target.value)} type="number" min={0} className={invoiceModalStyles.input} />
              </div>
            </div>
          </div>
          <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wide text-dashboard-muted">Category</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={selectedCategoryId === null ? "default" : "outline"} onClick={() => setSelectedCategoryId(null)} className="rounded-xl">All categories</Button>
            {localCategories.map((cat) => (
              <Button key={cat.id} size="sm" variant={selectedCategoryId === cat.id ? "default" : "outline"} onClick={() => setSelectedCategoryId(cat.id)} className="rounded-xl">{cat.name}</Button>
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
                  {allCatalogItems.filter((s) => matchesCatalogFilters(s, filterOpts)).length}
                </span>
              </button>
            </li>
            {(["SERVICES", "PACKAGES", "ADDONS"] as const).map((groupKey) => {
              const sectionCats = sidebarSections[groupKey] ?? [];
              if (sectionCats.length === 0) return null;
              return (
                <li key={groupKey} className="pt-3">
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
                    {CATEGORY_GROUP_LABELS[groupKey]}
                  </p>
                  <ul className="space-y-1">
                    {sectionCats.map((cat) => (
                      <li key={cat.id}>
                        <div
                          className={cn(
                            "flex w-full items-center gap-2 rounded-xl px-2 py-1 transition-colors",
                            selectedCategoryId === cat.id && !bulkMode
                              ? "bg-violet-50"
                              : bulkMode && selectedCategoryIds.has(cat.id)
                                ? "bg-violet-50/70"
                                : ""
                          )}
                        >
                          {bulkMode && (
                            <Checkbox
                              checked={selectedCategoryIds.has(cat.id)}
                              onChange={() => toggleCategorySelection(cat.id)}
                              aria-label={`Select category ${cat.name}`}
                              className="ml-1 shrink-0"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={cn(
                              "flex min-w-0 flex-1 items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors",
                              selectedCategoryId === cat.id
                                ? "font-medium text-dashboard-primary"
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
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
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
                  setEditItem(null);
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
                        onEdit={() => openEditItem(service)}
                        onDelete={() => handleDeleteService(service.id)}
                        onDuplicate={() => handleDuplicate(service.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <ServicesTable
                    services={group.services}
                    onEdit={openEditItem}
                    onDelete={handleDeleteService}
                    onDuplicate={handleDuplicate}
                    bulkMode={bulkMode}
                    selectedIds={selectedServiceIds}
                    onToggleSelect={toggleServiceSelection}
                    onToggleSelectAll={toggleServiceSelectionAll}
                  />
                )}
              </motion.section>
            ))
          )}
        </div>
      </div>

      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <CatalogDialogContent title="Add category">
          <CategoryForm
            onSuccess={(category) => {
              setAddCategoryOpen(false);
              setLocalCategories((prev) => [
                ...prev,
                { ...category, services: [] },
              ]);
            }}
          />
        </CatalogDialogContent>
      </Dialog>

      <Dialog
        open={!!editCategory}
        onOpenChange={(open) => !open && setEditCategory(null)}
      >
        <CatalogDialogContent title="Edit category">
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
        </CatalogDialogContent>
      </Dialog>

      <BulkDeleteConfirmDialog
        open={bulkDeleteType === "services"}
        onOpenChange={(open) => !open && setBulkDeleteType(null)}
        type="services"
        count={selectedServiceIds.size}
        names={selectedServiceNames}
        loading={bulkDeleteLoading}
        onConfirm={confirmBulkDelete}
      />

      <BulkDeleteCategoriesDialog
        open={bulkDeleteType === "categories"}
        onOpenChange={(open) => !open && setBulkDeleteType(null)}
        selectedCategories={selectedCategoryGroups}
        allCategories={localCategories}
        loading={bulkDeleteLoading}
        onConfirm={confirmBulkDeleteCategories}
      />

      <BulkAddServicesDialog
        open={bulkAddServicesOpen}
        onOpenChange={setBulkAddServicesOpen}
        categories={localCategories.map((c) => ({ id: c.id, name: c.name }))}
        defaultCategoryId={selectedCategoryId ?? undefined}
        onSuccess={handleBulkServicesCreated}
      />

      <BulkAddCategoriesDialog
        open={bulkAddCategoriesOpen}
        onOpenChange={setBulkAddCategoriesOpen}
        onSuccess={handleBulkCategoriesCreated}
      />
    </div>
  );
}
