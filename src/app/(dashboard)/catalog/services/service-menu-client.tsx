"use client";

import { useMemo, useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Service name</Label>
          <Input id="name" name="name" required defaultValue={service?.name} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={service?.description ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min={5}
            required
            defaultValue={service?.duration ?? 30}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={service?.price ?? 0}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
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
          <Label>Assigned employees (optional)</Label>
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
                  "rounded-full border px-3 py-1 text-xs",
                  selectedEmployees.includes(emp.id)
                    ? "border-violet-400 bg-violet-50 text-violet-700"
                    : "border-stone-200"
                )}
              >
                {emp.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Category name</Label>
        <Input
          id="cat-name"
          name="name"
          required
          defaultValue={category?.name}
          placeholder="e.g. Hair & styling"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : category ? "Update category" : "Add category"}
      </Button>
    </form>
  );
}

function ServiceCard({
  service,
  manageOrder,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  service: ServiceItem;
  manageOrder: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="group flex items-stretch overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="w-1 shrink-0 bg-violet-500" />
      <div className="flex flex-1 items-center gap-3 px-4 py-3">
        {manageOrder ? (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              disabled={!canMoveUp}
              onClick={onMoveUp}
              className="rounded p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30"
              aria-label="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <GripVertical className="h-4 w-4 text-stone-300" />
            <button
              type="button"
              disabled={!canMoveDown}
              onClick={onMoveDown}
              className="rounded p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30"
              aria-label="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <GripVertical className="h-4 w-4 shrink-0 text-stone-300" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-stone-900">{service.name}</p>
          <p className="text-sm text-stone-500">
            {formatDuration(service.duration)}
          </p>
        </div>
        <p className="shrink-0 text-sm font-medium text-stone-900">
          {formatCurrency(service.price)}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
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
          return { ...cat, services: cat.services.filter((s) => s.id !== service.id) };
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Service menu</h1>
          <p className="mt-1 text-stone-500">
            View and manage the services offered by your business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Options
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setAddCategoryOpen(true)}>
                Add category
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setManageOrder((v) => !v)}>
                {manageOrder ? "Done reordering" : "Manage order"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditService(null)}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add service</DialogTitle>
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

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search service name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className={cn(showFilters && "border-violet-300 bg-violet-50")}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
        <Button
          variant={manageOrder ? "default" : "outline"}
          onClick={() => setManageOrder((v) => !v)}
        >
          Manage order
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="flex flex-wrap gap-2 pt-4">
            <Button
              size="sm"
              variant={selectedCategoryId === null ? "default" : "outline"}
              onClick={() => setSelectedCategoryId(null)}
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
              >
                {cat.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit">
          <CardContent className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-stone-900">
              Categories
            </h2>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    selectedCategoryId === null
                      ? "bg-violet-50 font-medium text-violet-700"
                      : "text-stone-600 hover:bg-stone-50"
                  )}
                >
                  <span>All categories</span>
                  <span className="text-stone-400">{totalServices}</span>
                </button>
              </li>
              {localCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      selectedCategoryId === cat.id
                        ? "bg-violet-50 font-medium text-violet-700"
                        : "text-stone-600 hover:bg-stone-50"
                    )}
                  >
                    <span>{cat.name}</span>
                    <span className="text-stone-400">
                      {categoryCounts.get(cat.id) ?? 0}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setAddCategoryOpen(true)}
              className="mt-4 text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
            >
              Add category
            </button>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-stone-500">
                No services match your search.
              </CardContent>
            </Card>
          ) : (
            filteredGroups.map((group) => (
              <section key={group.id}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-stone-900">
                    {group.name}
                  </h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          setEditCategory({ id: group.id, name: group.name })
                        }
                      >
                        Edit category
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteCategory(group.id)}
                        className="text-red-600"
                      >
                        Delete category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  {group.services.map((service, index) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      manageOrder={manageOrder}
                      canMoveUp={index > 0}
                      canMoveDown={index < group.services.length - 1}
                      onMoveUp={() =>
                        moveService(group.id, group.services, index, "up")
                      }
                      onMoveDown={() =>
                        moveService(group.id, group.services, index, "down")
                      }
                      onEdit={() => {
                        setEditService(service);
                        setAddOpen(true);
                      }}
                      onDelete={() => handleDeleteService(service.id)}
                      onDuplicate={() => handleDuplicate(service.id)}
                    />
                  ))}
                </div>
              </section>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit service</DialogTitle>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          {editCategory && (
            <CategoryForm
              category={editCategory}
              onSuccess={(category) => {
                setEditCategory(null);
                setLocalCategories((prev) =>
                  prev.map((c) =>
                    c.id === category.id
                      ? { ...c, name: category.name, sortOrder: category.sortOrder }
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
