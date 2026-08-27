"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onboardingSignupAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Clock,
  Plus,
  Scissors,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import {
  BUSINESS_TYPES,
  createEmptyOnboardingService,
  createInitialOnboardingServices,
  DEFAULT_OPENING_HOURS,
  getBusinessTypeLabel,
  INDIAN_STATES,
  isCustomOnboardingService,
  ONBOARDING_STEPS,
  type DayHours,
  type OnboardingServiceItem,
  type OpeningHours,
} from "@/lib/onboarding";
import { formatCurrency } from "@/lib/currency";
import { BusinessHoursSection } from "@/components/onboarding/business-hours-section";
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
  onboardingStep5Schema,
} from "@/lib/validations";
import { cn } from "@/lib/utils";

type FormData = {
  salonName: string;
  businessType: string;
  businessPhone: string;
  businessEmail: string;
  gstin: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  ownerName: string;
  email: string;
  password: string;
  confirmPassword: string;
  ownerPhone: string;
  totalSeats: number;
  expectedTeamSize: number;
  openingHours: OpeningHours;
  currency: "INR";
  services: OnboardingServiceItem[];
  skipServices: boolean;
  acceptTerms: boolean;
};

const initialFormData: FormData = {
  salonName: "",
  businessType: "",
  businessPhone: "",
  businessEmail: "",
  gstin: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
  ownerName: "",
  email: "",
  password: "",
  confirmPassword: "",
  ownerPhone: "",
  totalSeats: 4,
  expectedTeamSize: 3,
  openingHours: DEFAULT_OPENING_HOURS,
  currency: "INR",
  services: createInitialOnboardingServices(),
  skipServices: false,
  acceptTerms: false,
};

const stepIcons = [Building2, User, Clock, Scissors, Sparkles];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {ONBOARDING_STEPS.map((step, index) => {
          const Icon = stepIcons[index];
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isComplete && "border-violet-600 bg-violet-600 text-white",
                    isCurrent && "border-violet-600 bg-violet-50 text-violet-700",
                    !isComplete && !isCurrent && "border-stone-200 bg-white text-stone-400"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-center text-xs font-medium sm:block",
                    isCurrent ? "text-violet-700" : "text-stone-500"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < ONBOARDING_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1",
                    currentStep > step.id ? "bg-violet-600" : "bg-stone-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-violet-600 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function BusinessBasicsStep({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="salonName">Business / salon name *</Label>
        <Input
          id="salonName"
          value={data.salonName}
          onChange={(e) => onChange({ salonName: e.target.value })}
          placeholder="Luxe Hair Studio"
        />
        {errors.salonName && (
          <p className="text-sm text-red-600">{errors.salonName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Business type *</Label>
        <Select
          value={data.businessType}
          onValueChange={(value) => onChange({ businessType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.businessType && (
          <p className="text-sm text-red-600">{errors.businessType}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="businessPhone">Business phone *</Label>
          <Input
            id="businessPhone"
            type="tel"
            value={data.businessPhone}
            onChange={(e) => onChange({ businessPhone: e.target.value })}
            placeholder="+91 98765 43210"
          />
          {errors.businessPhone && (
            <p className="text-sm text-red-600">{errors.businessPhone}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessEmail">Business email</Label>
          <Input
            id="businessEmail"
            type="email"
            value={data.businessEmail}
            onChange={(e) => onChange({ businessEmail: e.target.value })}
            placeholder="hello@yourbusiness.com"
          />
          {errors.businessEmail && (
            <p className="text-sm text-red-600">{errors.businessEmail}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gstin">GSTIN (optional)</Label>
        <Input
          id="gstin"
          value={data.gstin}
          onChange={(e) => onChange({ gstin: e.target.value.toUpperCase() })}
          placeholder="22AAAAA0000A1Z5"
          maxLength={15}
        />
        {errors.gstin && <p className="text-sm text-red-600">{errors.gstin}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Street address *</Label>
        <Input
          id="addressLine1"
          value={data.addressLine1}
          onChange={(e) => onChange({ addressLine1: e.target.value })}
          placeholder="123 MG Road, Koramangala"
        />
        {errors.addressLine1 && (
          <p className="text-sm text-red-600">{errors.addressLine1}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Bengaluru"
          />
          {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
        </div>
        <div className="space-y-2">
          <Label>State *</Label>
          <Select
            value={data.state}
            onValueChange={(value) => onChange({ state: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            value={data.pincode}
            onChange={(e) => onChange({ pincode: e.target.value })}
            placeholder="560034"
            maxLength={6}
          />
          {errors.pincode && (
            <p className="text-sm text-red-600">{errors.pincode}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function OwnerAccountStep({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">
        This account will be the salon owner login for Go Tix.
      </p>
      <div className="space-y-2">
        <Label htmlFor="ownerName">Owner full name *</Label>
        <Input
          id="ownerName"
          value={data.ownerName}
          onChange={(e) => onChange({ ownerName: e.target.value })}
          placeholder="Priya Sharma"
        />
        {errors.ownerName && (
          <p className="text-sm text-red-600">{errors.ownerName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Owner email (login) *</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="owner@yourbusiness.com"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={data.password}
            onChange={(e) => onChange({ password: e.target.value })}
            minLength={6}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={data.confirmPassword}
            onChange={(e) => onChange({ confirmPassword: e.target.value })}
            minLength={6}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ownerPhone">Owner mobile *</Label>
        <Input
          id="ownerPhone"
          type="tel"
          value={data.ownerPhone}
          onChange={(e) => onChange({ ownerPhone: e.target.value })}
          placeholder="+91 98765 43210"
        />
        {errors.ownerPhone && (
          <p className="text-sm text-red-600">{errors.ownerPhone}</p>
        )}
      </div>
    </div>
  );
}

function ManualNumericInput({
  id,
  value,
  min,
  max,
  onChange,
  className,
}: {
  id?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={text}
      onChange={(e) => {
        const raw = e.target.value.replace(/\D/g, "");
        setText(raw);
        if (raw !== "") {
          const parsed = parseInt(raw, 10);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }
      }}
      onBlur={() => {
        const raw = text.replace(/\D/g, "");
        if (raw === "") {
          setText(String(min));
          onChange(min);
          return;
        }
        let parsed = parseInt(raw, 10);
        if (Number.isNaN(parsed) || parsed < min) parsed = min;
        if (parsed > max) parsed = max;
        setText(String(parsed));
        onChange(parsed);
      }}
      className={className}
    />
  );
}

function PositiveIntegerInput({
  id,
  value,
  min,
  max,
  onChange,
  error,
}: {
  id: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  return (
    <>
      <ManualNumericInput
        id={id}
        value={value}
        min={min}
        max={max}
        onChange={onChange}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </>
  );
}

function SalonSetupStep({
  data,
  errors,
  onChange,
  onHoursChange,
}: {
  data: FormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<FormData>) => void;
  onHoursChange: (day: keyof OpeningHours, hours: Partial<DayHours>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="totalSeats">Number of seats / workstations *</Label>
          <PositiveIntegerInput
            id="totalSeats"
            value={data.totalSeats}
            min={1}
            max={50}
            onChange={(totalSeats) => onChange({ totalSeats })}
            error={errors.totalSeats}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedTeamSize">Expected team members *</Label>
          <PositiveIntegerInput
            id="expectedTeamSize"
            value={data.expectedTeamSize}
            min={1}
            max={100}
            onChange={(expectedTeamSize) => onChange({ expectedTeamSize })}
            error={errors.expectedTeamSize}
          />
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
        <p className="text-sm font-medium text-stone-700">Currency</p>
        <p className="mt-1 text-sm text-stone-500">
          Indian Rupee (INR) — all prices will be shown in ₹
        </p>
      </div>

      <BusinessHoursSection
        openingHours={data.openingHours}
        onHoursChange={onHoursChange}
      />
    </div>
  );
}

function StarterServicesStep({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<FormData>) => void;
}) {
  function updateService(
    serviceId: string,
    updates: Partial<OnboardingServiceItem>
  ) {
    onChange({
      skipServices: false,
      services: data.services.map((service) =>
        service.id === serviceId ? { ...service, ...updates } : service
      ),
    });
  }

  function toggleService(serviceId: string) {
    if (data.skipServices) {
      onChange({
        skipServices: false,
        services: data.services.map((service) => ({
          ...service,
          selected: service.id === serviceId,
        })),
      });
      return;
    }

    onChange({
      skipServices: false,
      services: data.services.map((service) =>
        service.id === serviceId
          ? { ...service, selected: !service.selected }
          : service
      ),
    });
  }

  function addService() {
    onChange({
      skipServices: false,
      services: [...data.services, createEmptyOnboardingService()],
    });
  }

  function removeService(serviceId: string) {
    onChange({
      services: data.services.filter((service) => service.id !== serviceId),
    });
  }

  function skipServices() {
    onChange({
      skipServices: true,
      services: data.services.map((service) => ({
        ...service,
        selected: false,
      })),
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">
        Pick common services to get started quickly. Edit names and prices, or
        add your own services below.
      </p>

      {errors.services && (
        <p className="text-sm text-red-600">{errors.services}</p>
      )}

      <div className="space-y-2">
        {data.services.map((service) => {
          const selected = !data.skipServices && service.selected;
          return (
            <div
              key={service.id}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-lg border p-4 transition-colors sm:flex-nowrap",
                selected
                  ? "border-violet-300 bg-violet-50"
                  : "border-stone-200"
              )}
            >
              <Checkbox
                checked={selected}
                onChange={() => toggleService(service.id)}
              />

              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                <Input
                  value={service.name}
                  placeholder="Service name"
                  onChange={(e) =>
                    updateService(service.id, { name: e.target.value })
                  }
                  className="h-9 bg-white"
                />

                <div className="flex items-center gap-2">
                  <ManualNumericInput
                    value={service.duration}
                    min={5}
                    max={480}
                    onChange={(duration) =>
                      updateService(service.id, { duration })
                    }
                    className="h-9 w-20 bg-white"
                  />
                  <span className="text-xs text-stone-500">min</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-500">₹</span>
                  <ManualNumericInput
                    value={service.price}
                    min={1}
                    max={999999}
                    onChange={(price) => updateService(service.id, { price })}
                    className="h-9 w-28 bg-white font-semibold text-violet-700"
                  />
                </div>
              </div>

              {isCustomOnboardingService(service.id) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-stone-400 hover:text-red-600"
                  onClick={() => removeService(service.id)}
                  aria-label="Remove service"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        onClick={addService}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add service
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={skipServices}
      >
        I&apos;ll add services later
      </Button>
    </div>
  );
}

function ReviewStep({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<FormData>) => void;
}) {
  const selectedServices = data.skipServices
    ? []
    : data.services.filter((service) => service.selected);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-stone-200 p-4">
          <h3 className="text-sm font-semibold text-stone-900">Business</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-stone-500">Name</dt>
              <dd className="font-medium">{data.salonName}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Type</dt>
              <dd>{getBusinessTypeLabel(data.businessType)}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Phone</dt>
              <dd>{data.businessPhone}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Address</dt>
              <dd>
                {data.addressLine1}, {data.city}, {data.state} {data.pincode}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-stone-200 p-4">
          <h3 className="text-sm font-semibold text-stone-900">Owner account</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-stone-500">Name</dt>
              <dd className="font-medium">{data.ownerName}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Login email</dt>
              <dd>{data.email}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Mobile</dt>
              <dd>{data.ownerPhone}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-stone-200 p-4">
          <h3 className="text-sm font-semibold text-stone-900">Salon setup</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-stone-500">Seats</dt>
              <dd>{data.totalSeats} workstations</dd>
            </div>
            <div>
              <dt className="text-stone-500">Team size</dt>
              <dd>{data.expectedTeamSize} members expected</dd>
            </div>
            <div>
              <dt className="text-stone-500">Currency</dt>
              <dd>INR (₹)</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-stone-200 p-4">
          <h3 className="text-sm font-semibold text-stone-900">Services</h3>
          {selectedServices.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">
              No starter services — you&apos;ll add them later
            </p>
          ) : (
            <ul className="mt-3 space-y-1 text-sm">
              {selectedServices.map((service) => (
                <li key={service.id} className="flex justify-between gap-4">
                  <span>
                    {service.name}{" "}
                    <span className="text-stone-400">({service.duration} min)</span>
                  </span>
                  <span className="font-medium">
                    {formatCurrency(service.price)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-stone-200 p-4">
        <Checkbox
          checked={data.acceptTerms}
          onChange={(e) => onChange({ acceptTerms: e.target.checked })}
          className="mt-0.5"
        />
        <span className="text-sm text-stone-600">
          I agree to Go Tix&apos;s Terms of Service and Privacy Policy, and
          confirm that the business information provided is accurate.
        </span>
      </label>
      {errors.acceptTerms && (
        <p className="text-sm text-red-600">{errors.acceptTerms}</p>
      )}
    </div>
  );
}

function getStepErrors(step: number, data: FormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    const result = onboardingStep1Schema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !errors[key]) errors[key] = issue.message;
      }
    }
  }

  if (step === 2) {
    const result = onboardingStep2Schema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !errors[key]) errors[key] = issue.message;
      }
    }
  }

  if (step === 3) {
    const result = onboardingStep3Schema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !errors[key]) errors[key] = issue.message;
      }
    }
  }

  if (step === 4) {
    const result = onboardingStep4Schema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !errors[key]) errors[key] = issue.message;
      }
    }
  }

  if (step === 5) {
    const result = onboardingStep5Schema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !errors[key]) errors[key] = issue.message;
      }
    }
  }

  return errors;
}

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateForm(updates: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  }

  function updateHours(day: keyof OpeningHours, hours: Partial<DayHours>) {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], ...hours },
      },
    }));
  }

  function handleNext() {
    const stepErrors = getStepErrors(step, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setStep((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length));
  }

  function handleBack() {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit() {
    const stepErrors = getStepErrors(5, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      const result = await onboardingSignupAction(formData);

      if (result.error) {
        setSubmitError(result.error);
        return;
      }

      const welcomeName = encodeURIComponent(
        result.salonName ?? formData.salonName
      );
      const dashboardPath = result.salonSlug
        ? `/${result.salonSlug}/dashboard?welcome=1&name=${welcomeName}`
        : `/dashboard?welcome=1&name=${welcomeName}`;

      if (result.signedIn === false) {
        window.location.assign(
          result.salonSlug ? `/${result.salonSlug}/login` : "/"
        );
        return;
      }

      window.location.assign(dashboardPath);
    } catch {
      setSubmitError(
        "Something went wrong creating your salon. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const currentStepMeta = ONBOARDING_STEPS[step - 1];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 to-stone-50 p-4 sm:p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Set up your salon</CardTitle>
          <CardDescription>
            Step {step} of {ONBOARDING_STEPS.length}: {currentStepMeta.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StepIndicator currentStep={step} />

          {step === 1 && (
            <BusinessBasicsStep
              data={formData}
              errors={errors}
              onChange={updateForm}
            />
          )}
          {step === 2 && (
            <OwnerAccountStep
              data={formData}
              errors={errors}
              onChange={updateForm}
            />
          )}
          {step === 3 && (
            <SalonSetupStep
              data={formData}
              errors={errors}
              onChange={updateForm}
              onHoursChange={updateHours}
            />
          )}
          {step === 4 && (
            <StarterServicesStep
              data={formData}
              errors={errors}
              onChange={updateForm}
            />
          )}
          {step === 5 && (
            <ReviewStep data={formData} errors={errors} onChange={updateForm} />
          )}

          {submitError && (
            <p className="mt-4 text-sm text-red-600">{submitError}</p>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step < ONBOARDING_STEPS.length ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating your salon..." : "Create my salon"}
              </Button>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account? Use your salon&apos;s login link, for example{" "}
            <span className="font-medium text-violet-600">yoursalon.com/your-salon-name/login</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
