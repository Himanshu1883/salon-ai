export const MEMBERSHIP_PRIMARY = "#22C55E";
export const MEMBERSHIP_GOLD = "#D4AF37";

export const MEMBERSHIP_NAV = [
  { href: "/memberships", label: "Dashboard", exact: true },
  { href: "/memberships/plans", label: "Plans" },
  { href: "/memberships/sell", label: "Sell" },
  { href: "/memberships/active", label: "Active" },
  { href: "/memberships/wallet", label: "Wallet" },
  { href: "/memberships/loyalty", label: "Loyalty" },
  { href: "/memberships/gift-cards", label: "Gift Cards" },
  { href: "/memberships/family", label: "Family" },
  { href: "/memberships/usage", label: "Usage" },
  { href: "/memberships/renewals", label: "Renewals" },
  { href: "/memberships/transactions", label: "Transactions" },
  { href: "/memberships/offers", label: "Offers" },
  { href: "/memberships/reports", label: "Reports" },
  { href: "/memberships/settings", label: "Settings" },
] as const;

export const PLAN_TYPE_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  HALF_YEARLY: "Half Yearly",
  YEARLY: "Yearly",
  CUSTOM: "Custom",
};

export const PLAN_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  ARCHIVED: "Archived",
};

export const MEMBERSHIP_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  SUSPENDED: "Suspended",
  PENDING: "Pending",
};

export const BENEFIT_TYPE_LABELS: Record<string, string> = {
  DISCOUNT_PERCENT: "Discount %",
  DISCOUNT_FIXED: "Fixed Discount",
  FREE_SERVICE: "Free Service",
  PRIORITY_BOOKING: "Priority Booking",
  WALLET_BONUS: "Wallet Bonus",
  LOYALTY_MULTIPLIER: "Loyalty Multiplier",
  OTHER: "Other",
};
