import { z } from "zod";
import { BUSINESS_TYPES, DAYS_OF_WEEK } from "@/lib/onboarding";

const businessTypeValues = BUSINESS_TYPES.map((t) => t.value) as [
  string,
  ...string[],
];

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const dayHoursSchema = z.object({
  open: z.string(),
  close: z.string(),
  closed: z.boolean(),
});

const openingHoursSchema = z.object(
  Object.fromEntries(
    DAYS_OF_WEEK.map((day) => [day.key, dayHoursSchema])
  ) as Record<(typeof DAYS_OF_WEEK)[number]["key"], typeof dayHoursSchema>
);

export const onboardingStep1Schema = z.object({
  salonName: z.string().min(2, "Business name is required"),
  businessType: z.enum(businessTypeValues, {
    message: "Select a business type",
  }),
  businessPhone: z.string().min(10, "Business phone is required"),
  businessEmail: z
    .string()
    .email("Enter a valid business email")
    .optional()
    .or(z.literal("")),
  gstin: z
    .string()
    .regex(gstinRegex, "Enter a valid 15-character GSTIN")
    .optional()
    .or(z.literal("")),
  addressLine1: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

export const onboardingStep2Schema = z
  .object({
    ownerName: z.string().min(2, "Owner name is required"),
    email: z.string().email("Enter a valid login email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    ownerPhone: z.string().min(10, "Owner mobile is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const onboardingStep2FieldsSchema = z.object({
  ownerName: z.string().min(2, "Owner name is required"),
  email: z.string().email("Enter a valid login email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  ownerPhone: z.string().min(10, "Owner mobile is required"),
});

export const onboardingStep3Schema = z.object({
  totalSeats: z.coerce.number().min(1, "At least 1 seat required").max(50),
  expectedTeamSize: z.coerce.number().min(1, "At least 1 team member").max(100),
  openingHours: openingHoursSchema,
  currency: z.literal("INR"),
});

export const onboardingStep4Schema = z.object({
  selectedServiceIds: z.array(z.string()),
  skipServices: z.boolean(),
});

export const onboardingStep5Schema = z.object({
  acceptTerms: z.literal(true, {
    message: "You must accept the terms to continue",
  }),
});

export const onboardingSchema = onboardingStep1Schema
  .merge(onboardingStep2FieldsSchema)
  .merge(onboardingStep3Schema)
  .merge(onboardingStep4Schema)
  .merge(onboardingStep5Schema);

/** @deprecated Use onboardingSchema for new signups */
export const signupSchema = z.object({
  salonName: z.string().min(2, "Salon name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  email: z
    .string()
    .email("Invalid email")
    .transform((value) => value.toLowerCase().trim()),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .transform((value) => value.toLowerCase().trim()),
  password: z
    .string()
    .min(1, "Password is required")
    .transform((value) => value.trim()),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email")
    .transform((value) => value.toLowerCase().trim()),
  salonSlug: z.string().min(1, "Salon is required"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset link is invalid or expired"),
    salonSlug: z.string().min(1, "Salon is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateUserEmailSchema = z.object({
  newEmail: z
    .string()
    .email("Enter a valid email")
    .transform((value) => value.toLowerCase().trim()),
  currentPassword: z.string().min(1, "Current password is required"),
});

export const updateUserPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum(["owner", "stylist", "receptionist", "manager"]),
  specialties: z.string().optional(),
  status: z.enum(["active", "inactive", "on_break"]),
  serviceIds: z.array(z.string()).optional(),
});

export const employeeProfileSchema = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode")
    .optional()
    .or(z.literal("")),
  country: z.string().optional(),
  aadharNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhar must be 12 digits")
    .optional()
    .or(z.literal("")),
  panNumber: z
    .string()
    .optional()
    .transform((v) => (v ? v.toUpperCase() : v))
    .refine(
      (v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v),
      "Enter a valid PAN (e.g. ABCDE1234F)"
    ),
});

export const serviceCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  sortOrder: z.coerce.number().min(0).optional(),
  categoryGroup: z
    .enum(["SERVICES", "PACKAGES", "ADDONS"])
    .optional()
    .default("SERVICES"),
});

export const bulkCreateCategoriesSchema = z.object({
  names: z
    .array(z.string().min(2, "Category name must be at least 2 characters"))
    .min(1, "Add at least one category name"),
});

export const bulkServiceItemSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, "Minimum 5 minutes"),
  price: z.coerce.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
});

export const bulkCreateServicesSchema = z.object({
  services: z
    .array(bulkServiceItemSchema)
    .min(1, "Add at least one service"),
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, "Minimum 5 minutes"),
  price: z.coerce.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  employeeIds: z.array(z.string()).optional(),
  audience: z.enum(["MEN", "WOMEN", "UNISEX", "KIDS"]).optional().default("UNISEX"),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional().default("ACTIVE"),
  onlineBooking: z.coerce.boolean().optional().default(true),
  inStoreBooking: z.coerce.boolean().optional().default(true),
  addOnServiceIds: z.array(z.string()).optional(),
});

export const packageSchema = z.object({
  name: z.string().min(2, "Package name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  audience: z.enum(["MEN", "WOMEN", "UNISEX", "KIDS"]).optional().default("UNISEX"),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional().default("ACTIVE"),
  onlineBooking: z.coerce.boolean().optional().default(true),
  inStoreBooking: z.coerce.boolean().optional().default(true),
  includedServiceIds: z
    .array(z.string())
    .min(1, "Select at least one service for the package"),
  pricingStrategy: z.enum([
    "STANDARD_TOTAL",
    "CUSTOM_PRICE",
    "PERCENTAGE_DISCOUNT",
    "FIXED_DISCOUNT",
  ]),
  customPrice: z.coerce.number().min(0).optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  discountAmount: z.coerce.number().min(0).optional(),
  employeeIds: z.array(z.string()).optional(),
});

export const addOnSchema = z.object({
  name: z.string().min(2, "Add-on name is required"),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, "Minimum 5 minutes"),
  price: z.coerce.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  audience: z.enum(["MEN", "WOMEN", "UNISEX", "KIDS"]).optional().default("UNISEX"),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional().default("ACTIVE"),
  onlineBooking: z.coerce.boolean().optional().default(true),
  inStoreBooking: z.coerce.boolean().optional().default(true),
  parentServiceIds: z.array(z.string()).optional(),
  employeeIds: z.array(z.string()).optional(),
});

export const bulkUpdateCatalogStatusSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
});

export const supplierSchema = z.object({
  name: z.string().min(2, "Supplier name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const checkInSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().optional(),
  serviceIds: z.array(z.string()).min(1, "Select at least one service"),
});

export const appointmentSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().optional(),
  serviceId: z.string().min(1, "Service is required"),
  employeeId: z.string().optional(),
  scheduledAt: z.string().min(1, "Date and time required"),
  notes: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const customSegmentSchema = z.object({
  name: z.string().min(2, "Segment name is required"),
  description: z.string().optional(),
});

export const seatsConfigSchema = z.object({
  totalSeats: z.coerce.number().min(1).max(50),
});

export const assignQueueSchema = z.object({
  queueEntryId: z.string(),
  employeeId: z.string().min(1, "Employee is required"),
  seatId: z.string().optional(),
});

export const ITEM_TYPES = [
  "SERVICE",
  "PRODUCT",
  "GIFT_CARD",
  "PACKAGE",
  "MEMBERSHIP",
  "FEE",
  "ADDON",
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
  serviceId: z.string().optional(),
  stockItemId: z.string().optional(),
  itemType: z.enum(ITEM_TYPES).optional(),
  employeeId: z.string().optional(),
});

export const specialSaleSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().optional(),
  description: z.string().min(2, "Description is required"),
  amount: z.coerce.number().min(0, "Amount must be 0 or more"),
  paymentMethod: z.enum(["cash", "card", "upi", "other"]),
  employeeId: z.string().min(1, "Assigned stylist is required"),
  saleDate: z.string().min(1, "Sale date is required"),
  itemType: z.enum(["GIFT_CARD", "PACKAGE", "MEMBERSHIP"]),
});

export const invoiceSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).default("draft"),
  employeeId: z.string().optional(),
  seatId: z.string().optional(),
  lineItems: z.array(invoiceLineItemSchema).min(1, "Add at least one line item"),
});

export const invoiceSchemaBasic = invoiceSchema.extend({
  employeeId: z.string().optional(),
});

export const PAYMENT_METHODS = ["cash", "card", "upi", "wallet", "other"] as const;

export const markPaidSchema = z.object({
  invoiceId: z.string(),
  paymentMethod: z.enum(PAYMENT_METHODS),
});

export const createInvoiceFromCheckInOptionsSchema = z.object({
  lineItems: z.array(invoiceLineItemSchema).min(1, "Add at least one line item").optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
});

export const manualSaleSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().optional(),
  serviceId: z.string().min(1, "Service is required"),
  amount: z.coerce.number().min(0, "Amount must be 0 or more"),
  paymentMethod: z.enum(["cash", "card", "upi", "other"]),
  employeeId: z.string().min(1, "Assigned stylist is required"),
  saleDate: z.string().min(1, "Sale date is required"),
});

export const aiSchedulingSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  serviceIds: z.array(z.string()).min(1, "Select at least one service"),
  dateFrom: z.string().min(1, "Start date required"),
  dateTo: z.string().optional(),
  preferredEmployeeId: z.string().optional(),
});

export const STOCK_CATEGORIES = [
  "shampoo",
  "color",
  "tools",
  "supplies",
  "other",
] as const;

export const stockCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
});

export const STOCK_UNITS = [
  "piece",
  "bottle",
  "box",
  "ml",
  "liter",
  "pack",
] as const;

export const stockItemSchema = z.object({
  name: z.string().min(2, "Item name is required"),
  sku: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  unit: z.enum(STOCK_UNITS),
  quantityOnHand: z.coerce.number().min(0, "Quantity must be 0 or more"),
  reorderLevel: z.preprocess(
    (val) => (val === "" || val == null ? undefined : val),
    z.coerce.number().min(0).optional()
  ),
  description: z.string().optional(),
});

export const stockPurchaseSchema = z.object({
  stockItemId: z.string().min(1, "Stock item is required"),
  quantityPurchased: z.coerce.number().min(1, "Quantity must be at least 1"),
  amount: z.coerce.number().min(0, "Amount must be 0 or more"),
  supplierName: z.string().optional(),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  notes: z.string().optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const shiftSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    date: z.string().min(1, "Date is required"),
    isWorking: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.isWorking) return true;
      return !!data.startTime && !!data.endTime;
    },
    { message: "Start and end time required when working" }
  );

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z
    .enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELED"])
    .optional(),
  dueDate: z.string().optional(),
  assignedEmployeeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});
