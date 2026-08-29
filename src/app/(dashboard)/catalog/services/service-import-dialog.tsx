"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  analyzeServiceMenuFile,
  commitServiceMenuImportAction,
  getServiceMenuCsvTemplate,
} from "@/actions/service-import";
import type {
  ColumnMapping,
  ImportPreview,
  PreviewRecord,
} from "@/lib/catalog-import";
import { IMPORT_AUDIENCES, type ImportAudience } from "@/lib/catalog-import/types";
import { AUDIENCE_LABELS } from "@/lib/catalog/constants";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  AlertTriangle,
} from "lucide-react";

type Step = "upload" | "mapping" | "analyze" | "review" | "confirm" | "complete";
type PreviewTab = "all" | "services" | "packages" | "categories" | "review" | "duplicates";

const STEPS: { id: Step; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "analyze", label: "Analyze" },
  { id: "review", label: "Review" },
  { id: "confirm", label: "Import" },
  { id: "complete", label: "Complete" },
];

const PAGE_SIZE = 50;
const ANALYZE_MESSAGES = [
  "Extracting services",
  "Detecting categories",
  "Detecting packages",
  "Matching prices",
  "Checking duplicates",
];

function downloadTemplate(csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gotix-service-menu-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function statusBadge(status: PreviewRecord["status"]) {
  if (status === "READY") return "bg-emerald-50 text-emerald-700";
  if (status === "DUPLICATE") return "bg-amber-50 text-amber-800";
  if (status === "NEEDS_REVIEW") return "bg-orange-50 text-orange-800";
  if (status === "INVALID") return "bg-red-50 text-red-700";
  return "bg-stone-100 text-stone-600";
}

export function ServiceImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [analyzeIndex, setAnalyzeIndex] = useState(0);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<string[][]>([]);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [records, setRecords] = useState<PreviewRecord[]>([]);
  const [tab, setTab] = useState<PreviewTab>("all");
  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    servicesCreated: number;
    packagesCreated: number;
    categoriesCreated: number;
    servicesReused: number;
    duplicatesSkipped: number;
    warnings: string[];
    problems: Array<{ name: string; reason: string }>;
  } | null>(null);

  function reset() {
    setStep("upload");
    setFile(null);
    setError("");
    setPreview(null);
    setRecords([]);
    setMapping({});
    setHeaders([]);
    setSampleRows([]);
    setResult(null);
    setTab("all");
    setPage(0);
    setEditingId(null);
  }

  async function runAnalyze(currentFile: File, currentMapping?: ColumnMapping) {
    setError("");
    setStep("analyze");
    setAnalyzeIndex(0);
    const timer = window.setInterval(() => {
      setAnalyzeIndex((i) => (i + 1) % ANALYZE_MESSAGES.length);
    }, 700);
    try {
      const formData = new FormData();
      formData.append("file", currentFile);
      const response = await analyzeServiceMenuFile(formData, currentMapping);
      if ("error" in response && response.error) {
        setError(response.error);
        setStep(currentMapping ? "mapping" : "upload");
        return;
      }
      if ("needsMapping" in response && response.needsMapping) {
        setHeaders(response.headers);
        setSampleRows(response.sampleRows);
        setMapping({
          audience: response.headers.find((h) => /audience/i.test(h)),
          category: response.headers.find((h) => /category/i.test(h)),
          name: response.headers.find((h) => /service|item|name/i.test(h)),
          price: response.headers.find((h) => /price|rate|amount/i.test(h)),
          notes: response.headers.find((h) => /note|remark/i.test(h)),
        });
        setStep("mapping");
        return;
      }
      if ("preview" in response && response.preview) {
        setPreview(response.preview);
        setRecords(response.preview.records);
        setStep("review");
        setPage(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "File could not be parsed.");
      setStep("upload");
    } finally {
      window.clearInterval(timer);
    }
  }

  function acceptFile(next: File | undefined) {
    if (!next) return;
    setFile(next);
    void runAnalyze(next);
  }

  const filtered = useMemo(() => {
    if (tab === "services") return records.filter((r) => r.type === "SERVICE");
    if (tab === "packages") return records.filter((r) => r.type === "PACKAGE");
    if (tab === "review") {
      return records.filter((r) => r.status === "NEEDS_REVIEW" || r.status === "INVALID");
    }
    if (tab === "duplicates") return records.filter((r) => r.status === "DUPLICATE");
    return records;
  }, [records, tab]);

  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const readyCount = records.filter((r) => r.action === "CREATE").length;
  const skipCount = records.filter((r) => r.action === "SKIP").length;
  const reviewCount = records.filter(
    (r) =>
      r.action === "REVIEW" ||
      r.status === "NEEDS_REVIEW" ||
      r.status === "INVALID"
  ).length;
  const duplicateCount = records.filter((r) => r.status === "DUPLICATE").length;
  const createServices = records.filter((r) => r.action === "CREATE" && r.type === "SERVICE").length;
  const createPackages = records.filter((r) => r.action === "CREATE" && r.type === "PACKAGE").length;
  const createCategories = new Set(
    records.filter((r) => r.action === "CREATE").map((r) => r.category)
  ).size;

  function updateRecord(id: string, patch: Partial<PreviewRecord>) {
    setRecords((prev) =>
      prev.map((record) => (record.id === id ? { ...record, ...patch } : record))
    );
  }

  async function handleImport() {
    if (!preview) return;
    setImporting(true);
    setError("");
    try {
      const payload = records
        .filter((record) => record.action !== "REVIEW")
        .map((record) => ({
          id: record.id,
          action: record.action === "UPDATE" ? ("UPDATE" as const) : record.action === "SKIP" ? ("SKIP" as const) : ("CREATE" as const),
          audience: record.audience,
          category: record.category,
          name: record.name,
          type: record.type,
          price: record.price,
          isStartingPrice: record.isStartingPrice,
          notes: record.notes,
          includedItems: record.includedItems,
          existingServiceId: record.duplicateOf?.id,
        }));
      const response = await commitServiceMenuImportAction({
        filename: preview.filename,
        fileType: preview.fileType,
        records: payload,
      });
      if ("error" in response && response.error) {
        setError(response.error);
        return;
      }
      if ("result" in response && response.result) {
        setResult(response.result);
        setStep("complete");
        router.refresh();
      }
    } finally {
      setImporting(false);
    }
  }

  const visualStep: Step =
    step === "mapping" ? "upload" : step === "confirm" ? "review" : step;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="flex max-h-[min(92dvh,980px)] w-[calc(100%-1.5rem)] max-w-6xl flex-col gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="shrink-0 border-b border-dashboard-border bg-gradient-to-br from-violet-600/[0.05] via-white to-white px-6 py-5 pr-12 text-left">
          <DialogTitle>Import service menu</DialogTitle>
          <DialogDescription>
            Upload a salon price list, review the extracted catalog, then confirm before anything is saved.
          </DialogDescription>
          <ol className="mt-4 flex flex-wrap gap-2">
            {STEPS.map((item, index) => {
              const activeIndex = STEPS.findIndex((s) => s.id === visualStep);
              const done = index < activeIndex;
              const active = item.id === visualStep;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                    active && "bg-violet-600 text-white",
                    done && "bg-violet-50 text-violet-700",
                    !active && !done && "bg-stone-100 text-stone-500"
                  )}
                >
                  <span>{index + 1}</span>
                  {item.label}
                </li>
              );
            })}
          </ol>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {step === "upload" ? (
            <div className="space-y-4">
              <button
                type="button"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  acceptFile(e.dataTransfer.files?.[0]);
                }}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition",
                  dragOver
                    ? "border-violet-400 bg-violet-50"
                    : "border-dashboard-border bg-dashboard-bg hover:border-violet-300"
                )}
              >
                <Upload className="mb-3 h-8 w-8 text-violet-600" />
                <p className="font-medium text-dashboard-text">Drag & drop your price list</p>
                <p className="mt-1 text-sm text-dashboard-muted">
                  or click to browse. Accepted: CSV, Excel (.xlsx), PDF
                </p>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.pdf,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => acceptFile(e.target.files?.[0] ?? undefined)}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-dashboard-muted">
                  Nothing is saved until you review and confirm the import.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const template = await getServiceMenuCsvTemplate();
                    if ("csv" in template) downloadTemplate(template.csv);
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download CSV template
                </Button>
              </div>
            </div>
          ) : null}

          {step === "mapping" ? (
            <div className="space-y-4">
              <p className="text-sm text-dashboard-muted">
                Map your spreadsheet columns, then continue.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["audience", "Audience"],
                    ["category", "Category"],
                    ["name", "Service / Item"],
                    ["price", "Price"],
                    ["notes", "Notes"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1.5">
                    <Label>{label}</Label>
                    <Select
                      value={mapping[key] ?? "__none"}
                      onValueChange={(value) =>
                        setMapping((prev) => ({
                          ...prev,
                          [key]: value === "__none" ? undefined : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Not mapped</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              {sampleRows[0] ? (
                <p className="text-xs text-dashboard-muted">
                  Sample: {sampleRows[0].filter(Boolean).slice(0, 5).join(" · ")}
                </p>
              ) : null}
              <Button
                disabled={!file || !mapping.category || !mapping.name}
                onClick={() => file && void runAnalyze(file, mapping)}
              >
                Continue
              </Button>
            </div>
          ) : null}

          {step === "analyze" ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-violet-600" />
              <p className="font-medium">Analyzing your price list...</p>
              <p className="mt-2 text-sm text-dashboard-muted">
                {ANALYZE_MESSAGES[analyzeIndex]}
              </p>
            </div>
          ) : null}

          {step === "review" && preview ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashboard-border bg-dashboard-bg p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-dashboard-text">
                      <FileSpreadsheet className="mr-1 inline h-4 w-4" />
                      {preview.filename}
                    </p>
                    <p className="mt-1 text-sm text-dashboard-muted">
                      Detected {preview.counts.services} services, {preview.counts.categories}{" "}
                      categories, {preview.counts.packages} packages, {preview.counts.audiences}{" "}
                      audiences
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge className="bg-amber-50 text-amber-800 hover:bg-amber-50">
                      {duplicateCount} duplicates
                    </Badge>
                    <Badge className="bg-orange-50 text-orange-800 hover:bg-orange-50">
                      {preview.counts.needsReview + preview.counts.invalid} records need review
                    </Badge>
                  </div>
                </div>
                {preview.warnings.length ? (
                  <ul className="mt-3 space-y-1 text-xs text-amber-800">
                    {preview.warnings.map((warning) => (
                      <li key={warning}>
                        <AlertTriangle className="mr-1 inline h-3 w-3" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <Tabs
                value={tab}
                onValueChange={(value) => {
                  setTab(value as PreviewTab);
                  setPage(0);
                }}
              >
                <TabsList className="h-auto flex-wrap">
                  <TabsTrigger value="all">All ({records.length})</TabsTrigger>
                  <TabsTrigger value="services">
                    Services ({records.filter((r) => r.type === "SERVICE").length})
                  </TabsTrigger>
                  <TabsTrigger value="packages">
                    Packages ({records.filter((r) => r.type === "PACKAGE").length})
                  </TabsTrigger>
                  <TabsTrigger value="categories">
                    Categories ({preview.categories.length})
                  </TabsTrigger>
                  <TabsTrigger value="review">Needs review ({reviewCount})</TabsTrigger>
                  <TabsTrigger value="duplicates">Duplicates ({duplicateCount})</TabsTrigger>
                </TabsList>
                <TabsContent value="categories">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {preview.categories.map((category) => (
                      <div
                        key={`${category.audience}-${category.name}`}
                        className="rounded-xl border border-dashboard-border p-3"
                      >
                        <p className="text-xs text-dashboard-muted">{category.audience}</p>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-dashboard-muted">
                          {category.serviceCount} services · {category.packageCount} packages
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                {tab !== "categories" ? (
                  <div className="overflow-x-auto rounded-xl border border-dashboard-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Audience</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Service / Package</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Included</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paged.map((record) => (
                          <TableRow key={record.id} className="align-top">
                            <TableCell className="min-w-[120px]">
                              {editingId === record.id ? (
                                <Select
                                  value={record.audience ?? "__none"}
                                  onValueChange={(value) =>
                                    updateRecord(record.id, {
                                      audience: value === "__none" ? null : (value as ImportAudience),
                                      audienceNeedsReview: value === "__none",
                                      action: record.action === "REVIEW" && value !== "__none" ? "CREATE" : record.action,
                                      status:
                                        record.action === "REVIEW" && value !== "__none"
                                          ? "READY"
                                          : record.status,
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none">Needs review</SelectItem>
                                    {IMPORT_AUDIENCES.map((audience) => (
                                      <SelectItem key={audience} value={audience}>
                                        {AUDIENCE_LABELS[audience]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                AUDIENCE_LABELS[record.audience as ImportAudience] ??
                                "Needs review"
                              )}
                            </TableCell>
                            <TableCell className="min-w-[140px]">
                              {editingId === record.id ? (
                                <Input
                                  value={record.category}
                                  onChange={(e) =>
                                    updateRecord(record.id, { category: e.target.value })
                                  }
                                />
                              ) : (
                                record.category || "—"
                              )}
                            </TableCell>
                            <TableCell className="min-w-[180px]">
                              {editingId === record.id ? (
                                <div className="space-y-1">
                                  <Input
                                    value={record.name}
                                    onChange={(e) =>
                                      updateRecord(record.id, { name: e.target.value })
                                    }
                                  />
                                  <Input
                                    value={record.notes}
                                    placeholder="Notes"
                                    onChange={(e) =>
                                      updateRecord(record.id, { notes: e.target.value })
                                    }
                                  />
                                </div>
                              ) : (
                                <div>
                                  <p className="font-medium">{record.name || "—"}</p>
                                  {record.warnings[0] ? (
                                    <p className="text-xs text-amber-700">{record.warnings[0]}</p>
                                  ) : null}
                                  {record.problems[0] ? (
                                    <p className="text-xs text-red-600">
                                      {record.problems[0].message}. {record.problems[0].suggestion}
                                    </p>
                                  ) : null}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{record.type === "PACKAGE" ? "Package" : "Service"}</TableCell>
                            <TableCell className="min-w-[120px] tabular-nums">
                              {editingId === record.id ? (
                                <div className="space-y-1">
                                  <Input
                                    type="number"
                                    value={record.price ?? ""}
                                    onChange={(e) =>
                                      updateRecord(record.id, {
                                        price: e.target.value === "" ? null : Number(e.target.value),
                                      })
                                    }
                                  />
                                  <label className="flex items-center gap-1 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={record.isStartingPrice}
                                      onChange={(e) =>
                                        updateRecord(record.id, {
                                          isStartingPrice: e.target.checked,
                                          pricingType: e.target.checked ? "STARTING_FROM" : "FIXED",
                                        })
                                      }
                                    />
                                    Starting from
                                  </label>
                                </div>
                              ) : record.price == null ? (
                                "—"
                              ) : record.isStartingPrice ? (
                                `from ${formatCurrency(record.price)}`
                              ) : (
                                formatCurrency(record.price)
                              )}
                            </TableCell>
                            <TableCell className="max-w-[220px] text-xs text-dashboard-muted">
                              {record.includedItems.length
                                ? record.includedItems
                                    .map(
                                      (item) =>
                                        `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}${item.complimentary ? " (free)" : ""}`
                                    )
                                    .join(", ")
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("rounded-md", statusBadge(record.status))}>
                                {record.status === "READY"
                                  ? "Ready"
                                  : record.status === "DUPLICATE"
                                    ? "Already exists"
                                    : record.status === "NEEDS_REVIEW"
                                      ? "Needs review"
                                      : record.status}
                              </Badge>
                              <p className="mt-1 text-[11px] text-dashboard-muted">
                                {record.confidence} confidence
                              </p>
                            </TableCell>
                            <TableCell className="min-w-[160px] space-y-1">
                              <Select
                                value={record.action}
                                onValueChange={(value) =>
                                  updateRecord(record.id, {
                                    action: value as PreviewRecord["action"],
                                  })
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CREATE">Create new</SelectItem>
                                  <SelectItem value="SKIP">Skip</SelectItem>
                                  <SelectItem value="UPDATE">Update existing</SelectItem>
                                  <SelectItem value="REVIEW">Review</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() =>
                                    setEditingId(editingId === record.id ? null : record.id)
                                  }
                                >
                                  {editingId === record.id ? "Done" : "Edit"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() =>
                                    updateRecord(record.id, { action: "SKIP", status: "SKIPPED" })
                                  }
                                >
                                  Skip
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              </Tabs>
              {tab !== "categories" && pageCount > 1 ? (
                <div className="flex items-center justify-between text-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-dashboard-muted">
                    Page {page + 1} of {pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= pageCount}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === "confirm" && preview ? (
            <div className="space-y-4">
              <p className="text-sm text-dashboard-muted">
                Ready to import {readyCount} items to {preview.salonName}. Existing services will not
                be overwritten unless you chose Update.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-xs text-dashboard-muted">Will create</p>
                  <p className="text-lg font-semibold">
                    {createServices} services · {createPackages} packages · {createCategories}{" "}
                    categories
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-xs text-dashboard-muted">Held back</p>
                  <p className="text-lg font-semibold">
                    {skipCount} skipped · {reviewCount} need review · {duplicateCount} duplicates
                  </p>
                </div>
              </div>
              {records
                .filter((r) => r.action !== "CREATE")
                .slice(0, 12)
                .map((record) => (
                  <p key={record.id} className="text-xs text-dashboard-muted">
                    {record.name || "Untitled"}: {record.action}
                    {record.problems[0] ? ` — ${record.problems[0].message}` : ""}
                    {record.duplicateOf ? " — already exists" : ""}
                  </p>
                ))}
            </div>
          ) : null}

          {step === "complete" && result ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-emerald-700">
                <Check className="h-5 w-5" />
                Import complete
              </div>
              <ul className="space-y-1 text-sm">
                <li>✓ {result.servicesCreated} services created</li>
                <li>✓ {result.categoriesCreated} categories created</li>
                <li>✓ {result.packagesCreated} packages created</li>
                <li>✓ {result.servicesReused} existing services reused</li>
                <li>✓ {result.duplicatesSkipped} duplicates skipped</li>
              </ul>
              {result.problems.length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-medium">Warnings</p>
                  {result.problems.slice(0, 12).map((problem) => (
                    <p key={`${problem.name}-${problem.reason}`}>
                      {problem.name}: {problem.reason}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-dashboard-border bg-white px-6 py-4">
          <Button variant="outline" onClick={() => (step === "complete" ? (onOpenChange(false), reset()) : onOpenChange(false))}>
            {step === "complete" ? "Done" : "Cancel"}
          </Button>
          <div className="flex flex-wrap gap-2">
            {step === "review" ? (
              <Button variant="outline" onClick={() => setStep("confirm")} disabled={readyCount === 0}>
                Review summary
              </Button>
            ) : null}
            {step === "confirm" ? (
              <>
                <Button variant="outline" onClick={() => setStep("review")}>
                  Back
                </Button>
                <Button onClick={() => void handleImport()} disabled={importing || readyCount === 0}>
                  {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Import {readyCount} items
                </Button>
              </>
            ) : null}
            {step === "complete" ? (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  reset();
                  router.refresh();
                }}
              >
                View services
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
