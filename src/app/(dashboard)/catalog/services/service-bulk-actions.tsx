"use client";

import { useMemo, useState } from "react";
import {
  bulkCreateServices,
  bulkDeleteServices,
  type BulkServiceInput,
} from "@/actions/services";
import {
  bulkCreateCategories,
  bulkDeleteServiceCategories,
  type CategoryBulkDeleteHandling,
} from "@/actions/service-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invoiceModalStyles } from "@/components/billing/invoice-modal/styles";
import { cn } from "@/lib/utils";
import {
  FolderPlus,
  Layers,
  Plus,
  Trash2,
  X,
  ListPlus,
} from "lucide-react";

const dialogClassName =
  "rounded-2xl border-dashboard-border bg-dashboard-card sm:max-w-lg";

type CategoryOption = { id: string; name: string };

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

type CategorySummary = { id: string; name: string; sortOrder: number };

type ServiceRow = {
  key: string;
  name: string;
  duration: string;
  price: string;
};

function emptyServiceRow(): ServiceRow {
  return {
    key: crypto.randomUUID(),
    name: "",
    duration: "30",
    price: "0",
  };
}

type CategoryGroup = {
  id: string;
  name: string;
  sortOrder: number;
  services: ServiceItem[];
};

export function BulkActionBar({
  selectedServiceCount,
  selectedCategoryCount,
  onDeleteServices,
  onDeleteCategories,
  onAddServices,
  onAddCategories,
  onClearSelection,
  onExitBulkMode,
}: {
  selectedServiceCount: number;
  selectedCategoryCount: number;
  onDeleteServices: () => void;
  onDeleteCategories: () => void;
  onAddServices: () => void;
  onAddCategories: () => void;
  onClearSelection: () => void;
  onExitBulkMode: () => void;
}) {
  const totalSelected = selectedServiceCount + selectedCategoryCount;

  return (
    <div className="sticky top-4 z-10 overflow-hidden rounded-[20px] border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-violet-50 p-4 shadow-lg shadow-violet-500/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-dashboard-text">
            Bulk actions
          </span>
          {selectedServiceCount > 0 && (
            <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
              {selectedServiceCount}{" "}
              {selectedServiceCount === 1 ? "service" : "services"}
            </span>
          )}
          {selectedCategoryCount > 0 && (
            <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
              {selectedCategoryCount}{" "}
              {selectedCategoryCount === 1 ? "category" : "categories"}
            </span>
          )}
          {totalSelected === 0 && (
            <span className="text-xs text-dashboard-muted">
              Select items using the checkboxes
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {totalSelected > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="rounded-xl text-dashboard-muted hover:bg-white hover:text-dashboard-text"
            >
              Clear selection
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddCategories}
            className="rounded-xl border-dashboard-border bg-white hover:border-violet-200 hover:bg-violet-50"
          >
            <FolderPlus className="h-4 w-4" />
            Add categories
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddServices}
            className="rounded-xl border-dashboard-border bg-white hover:border-violet-200 hover:bg-violet-50"
          >
            <ListPlus className="h-4 w-4" />
            Add services
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={selectedServiceCount === 0}
            onClick={onDeleteServices}
            className="rounded-xl border-dashboard-danger/30 bg-white text-dashboard-danger hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Delete services
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={selectedCategoryCount === 0}
            onClick={onDeleteCategories}
            className="rounded-xl border-dashboard-danger/30 bg-white text-dashboard-danger hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Delete categories
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onExitBulkMode}
            className="h-8 w-8 rounded-xl text-dashboard-muted hover:bg-white"
            aria-label="Exit bulk mode"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BulkDeleteCategoriesDialog({
  open,
  onOpenChange,
  selectedCategories,
  allCategories,
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategories: CategoryGroup[];
  allCategories: CategoryGroup[];
  loading: boolean;
  onConfirm: (handling: CategoryBulkDeleteHandling) => void | Promise<void>;
}) {
  const [mode, setMode] = useState<"delete-services" | "move-services">(
    "delete-services"
  );
  const [targetCategoryId, setTargetCategoryId] = useState("");

  const serviceCount = selectedCategories.reduce(
    (sum, c) => sum + c.services.length,
    0
  );
  const moveTargets = allCategories.filter(
    (c) => !selectedCategories.some((s) => s.id === c.id)
  );
  const canConfirm =
    mode === "delete-services" ||
    (mode === "move-services" && targetCategoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClassName}>
        <DialogHeader>
          <DialogTitle className="text-dashboard-text">
            Delete {selectedCategories.length} categor
            {selectedCategories.length === 1 ? "y" : "ies"}?
          </DialogTitle>
          <DialogDescription className="text-dashboard-muted">
            {serviceCount > 0
              ? `${serviceCount} service${serviceCount === 1 ? "" : "s"} in these categories will be affected.`
              : "These categories have no services and can be removed safely."}
          </DialogDescription>
        </DialogHeader>

        {serviceCount > 0 && (
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-dashboard-border p-3 hover:border-violet-200">
              <input
                type="radio"
                name="cat-handling"
                checked={mode === "delete-services"}
                onChange={() => setMode("delete-services")}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-dashboard-text">
                  Delete services too
                </p>
                <p className="text-xs text-dashboard-muted">
                  Remove all {serviceCount} services along with the categories.
                </p>
              </div>
            </label>
            {moveTargets.length > 0 && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-dashboard-border p-3 hover:border-violet-200">
                <input
                  type="radio"
                  name="cat-handling"
                  checked={mode === "move-services"}
                  onChange={() => setMode("move-services")}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-dashboard-text">
                      Move services to another category
                    </p>
                    <p className="text-xs text-dashboard-muted">
                      Keep services and reassign them before deleting.
                    </p>
                  </div>
                  {mode === "move-services" && (
                    <Select
                      value={targetCategoryId}
                      onValueChange={setTargetCategoryId}
                    >
                      <SelectTrigger
                        className={invoiceModalStyles.selectTrigger}
                      >
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent>
                        {moveTargets.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </label>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl border-dashboard-border"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading || !canConfirm}
            onClick={async () =>
              await onConfirm(
                mode === "delete-services"
                  ? { mode: "delete-services" }
                  : { mode: "move-services", targetCategoryId }
              )
            }
            className="flex-1 rounded-xl bg-dashboard-danger text-white hover:bg-dashboard-danger/90"
          >
            {loading ? "Deleting…" : "Delete categories"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BulkDeleteConfirmDialog({
  open,
  onOpenChange,
  type,
  count,
  names,
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "services" | "categories";
  count: number;
  names: string[];
  loading: boolean;
  onConfirm: () => void;
}) {
  const label = type === "services" ? "service" : "category";
  const preview = names.slice(0, 5);
  const remaining = names.length - preview.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClassName}>
        <DialogHeader>
          <DialogTitle className="text-dashboard-text">
            Delete {count} {label}
            {count === 1 ? "" : "s"}?
          </DialogTitle>
          <DialogDescription className="text-dashboard-muted">
            This action cannot be undone. The selected {label}
            {count === 1 ? "" : "s"} will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        {preview.length > 0 && (
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-dashboard-border bg-dashboard-bg/50 p-3 text-sm text-dashboard-text">
            {preview.map((name) => (
              <li key={name} className="truncate">
                {name}
              </li>
            ))}
            {remaining > 0 && (
              <li className="text-dashboard-muted">
                and {remaining} more…
              </li>
            )}
          </ul>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl border-dashboard-border"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-dashboard-danger text-white hover:bg-dashboard-danger/90"
          >
            {loading ? "Deleting…" : `Delete ${count} ${label}${count === 1 ? "" : "s"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BulkAddCategoriesDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (categories: CategorySummary[]) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const names = useMemo(
    () =>
      text
        .split(/[\n,]+/)
        .map((n) => n.trim())
        .filter(Boolean),
    [text]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await bulkCreateCategories(names);
    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    if ("categories" in result && result.categories) {
      onSuccess(result.categories);
      setText("");
      onOpenChange(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setError("");
          setText("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className={dialogClassName}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-dashboard-text">
            <Layers className="h-5 w-5 text-dashboard-primary" />
            Add multiple categories
          </DialogTitle>
          <DialogDescription className="text-dashboard-muted">
            Enter one category name per line, or separate with commas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-categories" className={invoiceModalStyles.label}>
              Category names
            </Label>
            <Textarea
              id="bulk-categories"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Hair & styling\nNails\nSkin care"}
              rows={6}
              className={invoiceModalStyles.textarea}
            />
            {names.length > 0 && (
              <p className="text-xs text-dashboard-muted">
                {names.length} {names.length === 1 ? "category" : "categories"}{" "}
                will be created
              </p>
            )}
          </div>
          {error && <p className="text-sm text-dashboard-danger">{error}</p>}
          <Button
            type="submit"
            disabled={loading || names.length === 0}
            className={cn("w-full", invoiceModalStyles.primaryButton)}
          >
            {loading
              ? "Creating…"
              : names.length === 0
                ? "Create categories"
                : `Create ${names.length} ${names.length === 1 ? "category" : "categories"}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BulkAddServicesDialog({
  open,
  onOpenChange,
  categories,
  defaultCategoryId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryOption[];
  defaultCategoryId?: string;
  onSuccess: (services: ServiceItem[]) => void;
}) {
  const [categoryId, setCategoryId] = useState(
    defaultCategoryId ?? categories[0]?.id ?? ""
  );
  const [rows, setRows] = useState<ServiceRow[]>([
    emptyServiceRow(),
    emptyServiceRow(),
    emptyServiceRow(),
  ]);
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validRows = useMemo(
    () => rows.filter((row) => row.name.trim().length >= 2),
    [rows]
  );

  function updateRow(key: string, field: keyof ServiceRow, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, emptyServiceRow()]);
  }

  function removeRow(key: string) {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((row) => row.key !== key)
    );
  }

  function applyPaste() {
    const parsed = pasteText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/[,\t|]/).map((p) => p.trim());
        return {
          key: crypto.randomUUID(),
          name: parts[0] ?? "",
          duration: parts[1] ?? "30",
          price: parts[2] ?? "0",
        };
      });

    if (parsed.length > 0) {
      setRows(parsed);
      setPasteText("");
      setShowPaste(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setError("Select a category");
      return;
    }

    setLoading(true);
    setError("");

    const payload: BulkServiceInput[] = validRows.map((row) => ({
      name: row.name.trim(),
      duration: Number(row.duration),
      price: Number(row.price),
      categoryId,
    }));

    const result = await bulkCreateServices(payload);
    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    if ("services" in result && result.services) {
      onSuccess(result.services as ServiceItem[]);
      setRows([emptyServiceRow(), emptyServiceRow(), emptyServiceRow()]);
      onOpenChange(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setError("");
          setShowPaste(false);
          setPasteText("");
        } else {
          setCategoryId(defaultCategoryId ?? categories[0]?.id ?? "");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className={cn(dialogClassName, "sm:max-w-2xl")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-dashboard-text">
            <ListPlus className="h-5 w-5 text-dashboard-primary" />
            Add multiple services
          </DialogTitle>
          <DialogDescription className="text-dashboard-muted">
            Add rows below, or paste lines in the format: name, duration, price.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
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

          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Services
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPaste((v) => !v)}
              className="rounded-xl text-dashboard-primary hover:bg-violet-50"
            >
              {showPaste ? "Use form rows" : "Paste from text"}
            </Button>
          </div>

          {showPaste ? (
            <div className="space-y-2">
              <Textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={"Haircut, 30, 500\nColor, 90, 2500\nBlow dry, 20, 300"}
                rows={5}
                className={invoiceModalStyles.textarea}
              />
              <Button
                type="button"
                variant="outline"
                onClick={applyPaste}
                className="rounded-xl border-dashboard-border"
              >
                Apply pasted lines
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden gap-2 px-1 text-xs font-medium text-dashboard-muted sm:grid sm:grid-cols-[1fr_100px_100px_36px]">
                <span>Name</span>
                <span>Duration (min)</span>
                <span>Price (₹)</span>
                <span />
              </div>
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="grid gap-2 sm:grid-cols-[1fr_100px_100px_36px]"
                >
                  <Input
                    value={row.name}
                    onChange={(e) => updateRow(row.key, "name", e.target.value)}
                    placeholder="Service name"
                    className={invoiceModalStyles.input}
                  />
                  <Input
                    type="number"
                    min={5}
                    value={row.duration}
                    onChange={(e) =>
                      updateRow(row.key, "duration", e.target.value)
                    }
                    className={invoiceModalStyles.input}
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.price}
                    onChange={(e) => updateRow(row.key, "price", e.target.value)}
                    className={invoiceModalStyles.input}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(row.key)}
                    className="h-10 w-9 rounded-xl text-dashboard-muted hover:text-dashboard-danger"
                    aria-label="Remove row"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                className="rounded-xl border-dashed border-violet-200 text-dashboard-primary hover:bg-violet-50"
              >
                <Plus className="h-4 w-4" />
                Add row
              </Button>
            </div>
          )}

          {validRows.length > 0 && (
            <p className="text-xs text-dashboard-muted">
              {validRows.length}{" "}
              {validRows.length === 1 ? "service" : "services"} ready to create
            </p>
          )}
          {error && <p className="text-sm text-dashboard-danger">{error}</p>}
          <Button
            type="submit"
            disabled={loading || validRows.length === 0 || !categoryId}
            className={cn("w-full", invoiceModalStyles.primaryButton)}
          >
            {loading
              ? "Creating…"
              : `Create ${validRows.length} service${validRows.length === 1 ? "" : "s"}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export type { CategoryBulkDeleteHandling };

export async function runBulkDeleteServices(ids: string[]) {
  return bulkDeleteServices(ids);
}

export async function runBulkDeleteCategories(
  ids: string[],
  handling: CategoryBulkDeleteHandling
) {
  return bulkDeleteServiceCategories(ids, handling);
}
