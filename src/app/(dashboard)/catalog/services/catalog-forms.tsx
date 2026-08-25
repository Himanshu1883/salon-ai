"use client";

import { useMemo, useState } from "react";
import { createService, updateService } from "@/actions/services";
import { createPackage, updatePackage } from "@/actions/service-packages";
import { createAddOn, updateAddOn } from "@/actions/service-addons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { invoiceModalStyles } from "@/components/billing/invoice-modal/styles";
import {
  AUDIENCE_LABELS,
  PRICING_STRATEGY_LABELS,
  SERVICE_AUDIENCES,
  SERVICE_STATUSES,
  STATUS_LABELS,
  type PackagePricingStrategy,
} from "@/lib/catalog/constants";
import {
  computePackageDuration,
  computePackageItemsTotal,
  resolvePackagePrice,
} from "@/lib/catalog/package-pricing";
import { formatCurrency, formatDuration, cn } from "@/lib/utils";
import type { CatalogServiceItem } from "./catalog-types";
import { catalogFormFooterClassName } from "./catalog-dialog";

type Employee = { id: string; name: string };
type CategoryOption = { id: string; name: string; categoryGroup?: string };

const dialogInput = invoiceModalStyles.input;

export function ServiceForm({
  service,
  categories,
  employees,
  addOnOptions,
  defaultCategoryId,
  onSubmitStart,
  onError,
  onSuccess,
}: {
  service?: CatalogServiceItem;
  categories: CategoryOption[];
  employees: Employee[];
  addOnOptions: CatalogServiceItem[];
  defaultCategoryId?: string;
  onSubmitStart?: () => void;
  onError?: (message: string) => void;
  onSuccess: (service?: CatalogServiceItem) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState(
    service?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? ""
  );
  const [audience, setAudience] = useState(service?.audience ?? "UNISEX");
  const [status, setStatus] = useState(service?.status ?? "ACTIVE");
  const [onlineBooking, setOnlineBooking] = useState(service?.onlineBooking ?? true);
  const [inStoreBooking, setInStoreBooking] = useState(service?.inStoreBooking ?? true);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    service?.employees.map((e) => e.employee.id) ?? []
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(
    service?.parentAddOnLinks.map((l) => l.addOnService.id) ?? []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", categoryId);
    formData.set("audience", audience);
    formData.set("status", status);
    formData.set("onlineBooking", String(onlineBooking));
    formData.set("inStoreBooking", String(inStoreBooking));
    selectedEmployees.forEach((id) => formData.append("employeeIds", id));
    selectedAddOns.forEach((id) => formData.append("addOnServiceIds", id));

    if (!service) onSubmitStart?.();
    const closeEarly = true;

    const result = service
      ? await updateService(service.id, formData)
      : await createService(formData);

    if (result.error) {
      setLoading(false);
      setError(result.error);
      if (closeEarly) onError?.(result.error);
      return;
    }
    setLoading(false);
    if ("service" in result && result.service) {
      onSuccess(result.service as CatalogServiceItem);
    } else {
      onSuccess();
    }
  }

  const serviceCategories = categories.filter(
    (c) => !c.categoryGroup || c.categoryGroup === "SERVICES"
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name" className={invoiceModalStyles.label}>Service name</Label>
          <Input id="name" name="name" required defaultValue={service?.name} className={dialogInput} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description" className={invoiceModalStyles.label}>Description</Label>
          <Textarea id="description" name="description" defaultValue={service?.description ?? ""} className={invoiceModalStyles.textarea} />
        </div>
        <div className="space-y-2">
          <Label className={invoiceModalStyles.label}>Audience</Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className={invoiceModalStyles.selectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_AUDIENCES.map((a) => (
                <SelectItem key={a} value={a}>{AUDIENCE_LABELS[a]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className={invoiceModalStyles.label}>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className={invoiceModalStyles.selectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration" className={invoiceModalStyles.label}>Duration (minutes)</Label>
          <Input id="duration" name="duration" type="number" min={5} required defaultValue={service?.duration ?? 30} className={dialogInput} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price" className={invoiceModalStyles.label}>Price (₹)</Label>
          <Input id="price" name="price" type="number" min={0} step="0.01" required defaultValue={service?.price ?? 0} className={dialogInput} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label className={invoiceModalStyles.label}>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className={invoiceModalStyles.selectTrigger}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-dashboard-text">
          <Checkbox checked={onlineBooking} onChange={(e) => setOnlineBooking(e.target.checked)} />
          Online booking
        </label>
        <label className="flex items-center gap-2 text-sm text-dashboard-text">
          <Checkbox checked={inStoreBooking} onChange={(e) => setInStoreBooking(e.target.checked)} />
          In-store booking
        </label>
      </div>

      {employees.length > 0 && (
        <div className="space-y-2">
          <Label className={invoiceModalStyles.label}>Assigned employees (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {employees.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() =>
                  setSelectedEmployees((prev) =>
                    prev.includes(emp.id) ? prev.filter((id) => id !== emp.id) : [...prev, emp.id]
                  )
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedEmployees.includes(emp.id)
                    ? "border-violet-300 bg-violet-50 text-violet-700"
                    : "border-dashboard-border bg-white text-dashboard-muted hover:border-violet-200"
                )}
              >
                {emp.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {addOnOptions.length > 0 && (
        <div className="space-y-2">
          <Label className={invoiceModalStyles.label}>Optional add-ons</Label>
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-dashboard-border p-3">
            {addOnOptions.map((addOn) => (
              <label key={addOn.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedAddOns.includes(addOn.id)}
                  onChange={(e) => {
                    setSelectedAddOns((prev) =>
                      e.target.checked
                        ? [...prev, addOn.id]
                        : prev.filter((id) => id !== addOn.id)
                    );
                  }}
                />
                <span className="flex-1">{addOn.name}</span>
                <span className="text-dashboard-muted">{formatCurrency(addOn.price)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-dashboard-danger">{error}</p>}
      <div className={catalogFormFooterClassName}>
        <Button type="submit" disabled={loading} className={cn("w-full", invoiceModalStyles.primaryButton)}>
          {loading ? "Saving..." : service ? "Update service" : "Add service"}
        </Button>
      </div>
    </form>
  );
}

export function PackageForm({
  pkg,
  categories,
  employees,
  bookableServices,
  defaultCategoryId,
  onSuccess,
}: {
  pkg?: CatalogServiceItem;
  categories: CategoryOption[];
  employees: Employee[];
  bookableServices: CatalogServiceItem[];
  defaultCategoryId?: string;
  onSuccess: (service?: CatalogServiceItem) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState(pkg?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? "");
  const [audience, setAudience] = useState(pkg?.audience ?? "UNISEX");
  const [status, setStatus] = useState(pkg?.status ?? "ACTIVE");
  const [onlineBooking, setOnlineBooking] = useState(pkg?.onlineBooking ?? true);
  const [inStoreBooking, setInStoreBooking] = useState(pkg?.inStoreBooking ?? true);
  const [pricingStrategy, setPricingStrategy] = useState<PackagePricingStrategy>(
    (pkg?.pricingStrategy as PackagePricingStrategy) ?? "CUSTOM_PRICE"
  );
  const [customPrice, setCustomPrice] = useState(String(pkg?.price ?? ""));
  const [discountPercent, setDiscountPercent] = useState(String(pkg?.discountPercent ?? ""));
  const [discountAmount, setDiscountAmount] = useState(String(pkg?.discountAmount ?? ""));
  const [includedIds, setIncludedIds] = useState<string[]>(
    pkg?.packageItems.map((i) => i.includedService.id) ?? []
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    pkg?.employees.map((e) => e.employee.id) ?? []
  );
  const packageCategories = categories.filter(
    (c) => !c.categoryGroup || c.categoryGroup === "PACKAGES" || c.categoryGroup === "SERVICES"
  );

  const selectedServices = useMemo(
    () => bookableServices.filter((s) => includedIds.includes(s.id)),
    [bookableServices, includedIds]
  );

  const preview = useMemo(() => {
    if (selectedServices.length === 0) return null;
    const itemsTotal = computePackageItemsTotal(selectedServices);
    const pricing = resolvePackagePrice({
      itemsTotal,
      pricingStrategy,
      customPrice: customPrice ? Number(customPrice) : undefined,
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      discountAmount: discountAmount ? Number(discountAmount) : undefined,
    });
    return {
      ...pricing,
      duration: computePackageDuration(selectedServices),
    };
  }, [selectedServices, pricingStrategy, customPrice, discountPercent, discountAmount]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", categoryId);
    formData.set("audience", audience);
    formData.set("status", status);
    formData.set("onlineBooking", String(onlineBooking));
    formData.set("inStoreBooking", String(inStoreBooking));
    formData.set("pricingStrategy", pricingStrategy);
    formData.set("customPrice", customPrice);
    formData.set("discountPercent", discountPercent);
    formData.set("discountAmount", discountAmount);
    includedIds.forEach((id) => formData.append("includedServiceIds", id));
    selectedEmployees.forEach((id) => formData.append("employeeIds", id));

    const result = pkg ? await updatePackage(pkg.id, formData) : await createPackage(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if ("service" in result && result.service) {
      onSuccess(result.service as CatalogServiceItem);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pkg-name" className={invoiceModalStyles.label}>Package name</Label>
          <Input id="pkg-name" name="name" required defaultValue={pkg?.name} className={dialogInput} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pkg-desc" className={invoiceModalStyles.label}>Description</Label>
          <Textarea id="pkg-desc" name="description" defaultValue={pkg?.description ?? ""} className={invoiceModalStyles.textarea} />
        </div>
        <div className="space-y-2">
          <Label className={invoiceModalStyles.label}>Audience</Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className={invoiceModalStyles.selectTrigger}><SelectValue /></SelectTrigger>
            <SelectContent>
              {SERVICE_AUDIENCES.map((a) => (
                <SelectItem key={a} value={a}>{AUDIENCE_LABELS[a]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className={invoiceModalStyles.label}>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className={invoiceModalStyles.selectTrigger}><SelectValue /></SelectTrigger>
            <SelectContent>
              {packageCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className={invoiceModalStyles.label}>Included services</Label>
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-dashboard-border p-3">
          {bookableServices.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={includedIds.includes(s.id)}
                onChange={(e) =>
                  setIncludedIds((prev) =>
                    e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                  )
                }
              />
              <span className="flex-1">{s.name}</span>
              <span className="text-dashboard-muted">{formatCurrency(s.price)}</span>
              <span className="text-dashboard-muted">{formatDuration(s.duration)}</span>
            </label>
          ))}
        </div>
        {selectedServices.length > 0 && (
          <div className="rounded-xl bg-violet-50/60 p-3 text-sm">
            {selectedServices.map((s) => (
              <div key={s.id} className="flex justify-between py-0.5">
                <span>{s.name}</span>
                <span>{formatCurrency(s.price)} · {formatDuration(s.duration)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div className="rounded-xl border border-dashboard-border bg-dashboard-bg/50 p-4 text-sm">
          <div className="flex justify-between"><span>Individual total</span><span>{formatCurrency(preview.itemsTotal)}</span></div>
          <div className="flex justify-between font-semibold"><span>Package price</span><span>{formatCurrency(preview.packagePrice)}</span></div>
          {preview.savings > 0 && (
            <div className="flex justify-between text-emerald-600"><span>Customer saves</span><span>{formatCurrency(preview.savings)}</span></div>
          )}
          <div className="flex justify-between text-dashboard-muted"><span>Duration</span><span>{formatDuration(preview.duration)}</span></div>
        </div>
      )}

      <div className="space-y-3">
        <Label className={invoiceModalStyles.label}>Pricing</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(PRICING_STRATEGY_LABELS) as PackagePricingStrategy[]).map((key) => (
            <label key={key} className="flex items-center gap-2 rounded-xl border border-dashboard-border px-3 py-2 text-sm">
              <input type="radio" name="pricingStrategyUi" checked={pricingStrategy === key} onChange={() => setPricingStrategy(key)} />
              {PRICING_STRATEGY_LABELS[key]}
            </label>
          ))}
        </div>
        {pricingStrategy === "CUSTOM_PRICE" && (
          <Input type="number" min={0} step="0.01" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} placeholder="Package price" className={dialogInput} />
        )}
        {pricingStrategy === "PERCENTAGE_DISCOUNT" && (
          <Input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="Discount %" className={dialogInput} />
        )}
        {pricingStrategy === "FIXED_DISCOUNT" && (
          <Input type="number" min={0} value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} placeholder="Discount amount (₹)" className={dialogInput} />
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={onlineBooking} onChange={(e) => setOnlineBooking(e.target.checked)} />Online booking</label>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={inStoreBooking} onChange={(e) => setInStoreBooking(e.target.checked)} />In-store booking</label>
      </div>

      {employees.length > 0 && (
        <div className="space-y-2">
          <Label className={invoiceModalStyles.label}>Staff eligibility (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {employees.map((emp) => (
              <button key={emp.id} type="button" onClick={() => setSelectedEmployees((prev) => prev.includes(emp.id) ? prev.filter((id) => id !== emp.id) : [...prev, emp.id])}
                className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", selectedEmployees.includes(emp.id) ? "border-violet-300 bg-violet-50 text-violet-700" : "border-dashboard-border text-dashboard-muted")}>
                {emp.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-dashboard-danger">{error}</p>}
      <div className={catalogFormFooterClassName}>
        <Button type="submit" disabled={loading || includedIds.length === 0} className={cn("w-full", invoiceModalStyles.primaryButton)}>
          {loading ? "Saving..." : pkg ? "Update package" : "Create package"}
        </Button>
      </div>
    </form>
  );
}

export function AddOnForm({
  addOn,
  categories,
  employees,
  parentServiceOptions,
  defaultCategoryId,
  onSuccess,
}: {
  addOn?: CatalogServiceItem;
  categories: CategoryOption[];
  employees: Employee[];
  parentServiceOptions: CatalogServiceItem[];
  defaultCategoryId?: string;
  onSuccess: (service?: CatalogServiceItem) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState(addOn?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? "");
  const [audience, setAudience] = useState(addOn?.audience ?? "UNISEX");
  const [status, setStatus] = useState(addOn?.status ?? "ACTIVE");
  const [onlineBooking, setOnlineBooking] = useState(addOn?.onlineBooking ?? true);
  const [inStoreBooking, setInStoreBooking] = useState(addOn?.inStoreBooking ?? true);
  const [parentIds, setParentIds] = useState<string[]>(
    addOn?.addOnParentLinks.map((l) => l.parentService.id) ?? []
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    addOn?.employees.map((e) => e.employee.id) ?? []
  );

  const addOnCategories = categories.filter(
    (c) => !c.categoryGroup || c.categoryGroup === "ADDONS" || c.categoryGroup === "SERVICES"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", categoryId);
    formData.set("audience", audience);
    formData.set("status", status);
    formData.set("onlineBooking", String(onlineBooking));
    formData.set("inStoreBooking", String(inStoreBooking));
    parentIds.forEach((id) => formData.append("parentServiceIds", id));
    selectedEmployees.forEach((id) => formData.append("employeeIds", id));

    const result = addOn ? await updateAddOn(addOn.id, formData) : await createAddOn(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if ("service" in result && result.service) {
      onSuccess(result.service as CatalogServiceItem);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="addon-name" className={invoiceModalStyles.label}>Add-on name</Label>
          <Input id="addon-name" name="name" required defaultValue={addOn?.name} className={dialogInput} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addon-duration" className={invoiceModalStyles.label}>Duration (min)</Label>
          <Input id="addon-duration" name="duration" type="number" min={5} required defaultValue={addOn?.duration ?? 10} className={dialogInput} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addon-price" className={invoiceModalStyles.label}>Price (₹)</Label>
          <Input id="addon-price" name="price" type="number" min={0} step="0.01" required defaultValue={addOn?.price ?? 0} className={dialogInput} />
        </div>
        <div className="space-y-2">
          <Label className={invoiceModalStyles.label}>Audience</Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className={invoiceModalStyles.selectTrigger}><SelectValue /></SelectTrigger>
            <SelectContent>
              {SERVICE_AUDIENCES.map((a) => (
                <SelectItem key={a} value={a}>{AUDIENCE_LABELS[a]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className={invoiceModalStyles.label}>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className={invoiceModalStyles.selectTrigger}><SelectValue /></SelectTrigger>
            <SelectContent>
              {addOnCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {parentServiceOptions.length > 0 && (
        <div className="space-y-2">
          <Label className={invoiceModalStyles.label}>Available with services</Label>
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-dashboard-border p-3">
            {parentServiceOptions.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <Checkbox checked={parentIds.includes(s.id)} onChange={(e) => setParentIds((prev) => e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id))} />
                {s.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-dashboard-danger">{error}</p>}
      <div className={catalogFormFooterClassName}>
        <Button type="submit" disabled={loading} className={cn("w-full", invoiceModalStyles.primaryButton)}>
          {loading ? "Saving..." : addOn ? "Update add-on" : "Add add-on"}
        </Button>
      </div>
    </form>
  );
}
