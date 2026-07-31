export const BUSINESS_TYPES = [
  { value: "salon", label: "Salon" },
  { value: "spa", label: "Spa" },
  { value: "barbershop", label: "Barbershop" },
  { value: "beauty_clinic", label: "Beauty clinic" },
  { value: "other", label: "Other" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Puducherry",
] as const;

export const DAYS_OF_WEEK = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
] as const;

export type DayKey = (typeof DAYS_OF_WEEK)[number]["key"];

export type DayHours = {
  open: string;
  close: string;
  closed: boolean;
};

export type OpeningHours = Record<DayKey, DayHours>;

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { open: "10:00", close: "19:00", closed: false },
  tuesday: { open: "10:00", close: "19:00", closed: false },
  wednesday: { open: "10:00", close: "19:00", closed: false },
  thursday: { open: "10:00", close: "19:00", closed: false },
  friday: { open: "10:00", close: "19:00", closed: false },
  saturday: { open: "10:00", close: "19:00", closed: false },
  sunday: { open: "10:00", close: "19:00", closed: true },
};

export const STARTER_SERVICES = [
  { id: "mens-haircut", name: "Men's Haircut", duration: 30, price: 400 },
  { id: "womens-haircut", name: "Women's Haircut", duration: 45, price: 800 },
  { id: "hair-color", name: "Hair Color", duration: 120, price: 3500 },
  { id: "highlights", name: "Highlights", duration: 90, price: 2800 },
  { id: "blowout", name: "Blowout", duration: 30, price: 600 },
  { id: "deep-conditioning", name: "Deep Conditioning", duration: 45, price: 900 },
  { id: "eyebrow-shaping", name: "Eyebrow Shaping", duration: 20, price: 350 },
] as const;

export const ONBOARDING_STEPS = [
  { id: 1, title: "Business basics" },
  { id: 2, title: "Owner account" },
  { id: 3, title: "Salon setup" },
  { id: 4, title: "Starter services" },
  { id: 5, title: "Review & launch" },
] as const;

export function formatBusinessAddress(data: {
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
}): string {
  return `${data.addressLine1}, ${data.city}, ${data.state} ${data.pincode}`;
}

export function getBusinessTypeLabel(value: string): string {
  return BUSINESS_TYPES.find((t) => t.value === value)?.label ?? value;
}
