export type Module = { title: string; desc: string; group: string };

export const MODULE_GROUPS: { group: string; items: { title: string; desc: string }[] }[] = [
  {
    group: "Operations",
    items: [
      { title: "Dashboard", desc: "Real-time KPIs & branch performance." },
      { title: "Appointments", desc: "Smart booking & automated reminders." },
      { title: "Walk In", desc: "Instant check-in & queue entry." },
      { title: "Queue", desc: "Live wait-time board for the floor." },
      { title: "Multi Branch", desc: "Centralized multi-location control." },
    ],
  },
  {
    group: "Sales & Billing",
    items: [
      { title: "Billing", desc: "Invoices, split payments, discounts." },
      { title: "POS", desc: "Touch-friendly checkout built for salons." },
    ],
  },
  {
    group: "Client Management",
    items: [
      { title: "Customers", desc: "Full client profiles & visit history." },
      { title: "CRM", desc: "Segmentation, loyalty and rebooking." },
    ],
  },
  {
    group: "Inventory",
    items: [
      {
        title: "Inventory",
        desc: "Stock tracking, reorder alerts, multi-branch sync.",
      },
    ],
  },
  {
    group: "Catalog",
    items: [
      { title: "Services", desc: "Pricing & duration configuration." },
      { title: "Packages", desc: "Bundled seasonal deals." },
      { title: "Membership", desc: "Recurring plans & member perks." },
    ],
  },
  {
    group: "Team",
    items: [
      { title: "Staff", desc: "Roles, schedules and commissions." },
      { title: "Attendance", desc: "Clock-in/out & shift reports." },
      { title: "Payroll", desc: "Automated salary calculation." },
    ],
  },
  {
    group: "Growth",
    items: [
      { title: "Marketing", desc: "Campaigns, promos, birthday offers." },
      { title: "WhatsApp", desc: "Automated reminders & two-way chat." },
    ],
  },
  {
    group: "Finance",
    items: [
      { title: "Expenses", desc: "Vendor payments & margin tracking." },
      {
        title: "Reports",
        desc: "Exportable financial, staff and service reports.",
      },
      {
        title: "Analytics",
        desc: "Revenue, retention and peak-hour insights.",
      },
    ],
  },
  {
    group: "Admin",
    items: [
      {
        title: "Settings",
        desc: "Branding, taxes, notifications, integrations.",
      },
    ],
  },
];

export const ALL_MODULES = MODULE_GROUPS.flatMap((g) =>
  g.items.map((i) => ({ ...i, group: g.group })),
);

export const SALON_TYPES = [
  {
    name: "Hair Salon",
    desc: "Chair-side service history, colour formula notes and stylist commissions in one flow.",
  },
  {
    name: "Beauty Salon",
    desc: "Multi-service tickets, membership auto-apply and retail product upsells at checkout.",
  },
  {
    name: "Spa",
    desc: "Room scheduling, therapist rotation and package session tracking without spreadsheets.",
  },
  {
    name: "Skin Clinic",
    desc: "Treatment plans, consent forms and before/after documentation per client.",
  },
  {
    name: "Barber Shop",
    desc: "Fast walk-in queue, quick-tap POS and daily takings by chair.",
  },
  {
    name: "Nail Studio",
    desc: "Design catalogue, technician preferences and consumable usage per set.",
  },
  {
    name: "Makeup Studio",
    desc: "Look libraries, on-location bookings and artist kit inventory.",
  },
  {
    name: "Academy",
    desc: "Batches, student attendance, fee plans and certification tracking.",
  },
  {
    name: "Bridal Studio",
    desc: "Multi-day wedding itineraries, trials, advances and zero double-bookings.",
  },
  {
    name: "Tattoo Studio",
    desc: "Artist portfolios, deposit handling, aftercare notes and consent records.",
  },
];

export const FEATURES = [
  {
    title: "Reception That Impresses",
    desc: "Give every client a five-star welcome from the moment they walk in.",
    points: ["Digital check-in kiosk", "VIP client recognition", "Real-time queue display"],
    image:
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Modern salon reception and waiting lounge",
  },
  {
    title: "POS Built for Salons",
    desc: "Checkout flows designed for the speed and complexity of salon billing.",
    points: ["Split payments & tips", "Membership auto-apply", "Receipt via WhatsApp"],
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Customer paying at a point-of-sale checkout",
  },
  {
    title: "Inventory You Can Trust",
    desc: "Never run out of colour, products, or retail items mid-appointment.",
    points: ["Multi-branch stock sync", "Auto reorder alerts", "Usage tracking per service"],
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Beauty and cosmetic products arranged on shelves",
  },
  {
    title: "Stylist-First Workflow",
    desc: "Tools that keep stylists focused on clients, not paperwork.",
    points: ["Service history at chair-side", "Commission tracking", "Performance leaderboard"],
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Hair stylist working with a client in a salon chair",
  },
  {
    title: "Beauty Treatment Tracking",
    desc: "Document every treatment with photos, notes, and product usage.",
    points: ["Before/after gallery", "Allergy & skin type notes", "Treatment plan templates"],
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Client receiving a facial beauty treatment",
  },
  {
    title: "Spa & Wellness Management",
    desc: "Room scheduling, therapist rotation, and package redemption in one flow.",
    points: ["Room availability grid", "Package session tracking", "Therapist preferences"],
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Relaxing spa massage and wellness treatment room",
  },
  {
    title: "Full Spa Experience",
    desc: "Manage the complete spa journey from booking to post-visit follow-up.",
    points: ["Multi-service itineraries", "Gift voucher redemption", "Loyalty point accrual"],
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Luxury spa amenities and wellness atmosphere",
  },
  {
    title: "Client Consultation Hub",
    desc: "Turn every consultation into a personalized service recommendation.",
    points: ["AI style suggestions", "Digital consent forms", "Instant quote generation"],
    image:
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Stylist consulting with a client about a hair style",
  },
];

export const AI_CARDS = [
  {
    title: "Demand Forecasting",
    desc: "Predict busy hours and optimize staff scheduling.",
  },
  {
    title: "Smart Recommendations",
    desc: "AI-suggested services based on client history.",
  },
  {
    title: "Revenue Optimization",
    desc: "Identify upsell opportunities and pricing gaps.",
  },
  {
    title: "Inventory Intelligence",
    desc: "Auto-predict product reorder needs by usage patterns.",
  },
];

export const PLANS = [
  {
    name: "Starter",
    monthly: 599,
    annual: 509,
    desc: "Perfect for single-location salons getting started.",
    includes: [
      "Up to 3 staff members",
      "Appointments & smart calendar",
      "POS billing & digital receipts",
      "Basic CRM & client profiles",
      "WhatsApp booking reminders",
      "Daily sales reports",
      "Email support",
      "14-day free trial",
    ],
    cta: "Start Free Trial",
    to: "/signup" as const,
    popular: false,
  },
  {
    name: "Professional",
    monthly: 1499,
    annual: 1274,
    desc: "For growing salons that need the full ERP suite.",
    includes: [
      "Up to 15 staff members",
      "All 22 ERP modules included",
      "AI analytics & demand forecasting",
      "Marketing automation (SMS, email, WhatsApp)",
      "Inventory, PO & low-stock alerts",
      "Memberships, packages & loyalty",
      "Multi-payment POS & GST invoices",
      "Priority support & free migration",
    ],
    cta: "Start Free Trial",
    to: "/signup" as const,
    popular: true,
  },
  {
    name: "Business",
    monthly: 8999,
    annual: 7649,
    desc: "For multi-chair salons and small chains ready to scale.",
    includes: [
      "Up to 30 staff",
      "2 branch locations",
      "All Professional features",
      "Advanced reporting",
      "API access",
      "Phone & chat support",
    ],
    cta: "Start Free Trial",
    to: "/signup" as const,
    popular: false,
  },
  {
    name: "Enterprise",
    monthly: null,
    annual: null,
    desc: "Multi-branch chains with advanced customization needs.",
    includes: [
      "Unlimited staff & branches",
      "Custom integrations",
      "Dedicated account manager",
      "White-label options",
      "SLA guarantee",
      "On-site training",
    ],
    cta: "Book Demo",
    to: "/demo" as const,
    popular: false,
  },
];

export const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Owner, Luxe Hair Studio, Mumbai",
    quote:
      "Gotix transformed how we manage 3 branches. Revenue is up 40% and our clients love the WhatsApp reminders.",
  },
  {
    name: "Raj Malhotra",
    role: "Director, The Groom Room, Delhi",
    quote:
      "The POS and inventory modules alone saved us 15 hours a week. Best investment for our barber chain.",
  },
  {
    name: "Ananya Reddy",
    role: "Founder, Glow Spa & Wellness, Bangalore",
    quote:
      "From appointments to payroll — everything just works. The AI analytics helped us identify our most profitable services.",
  },
  {
    name: "Meera Kapoor",
    role: "CEO, Bridal Bliss Studio, Jaipur",
    quote:
      "Managing bridal bookings used to be chaos. Now our team handles 200+ weddings a season with zero double-bookings.",
  },
];

export const FAQS = [
  {
    q: "How quickly can I set up Gotix?",
    a: "Most salons are fully operational within 24 hours. Our onboarding team imports your services, staff, and client data for you.",
  },
  {
    q: "Does it work for multi-branch salons?",
    a: "Yes. Manage unlimited branches from a single dashboard with centralized reporting, inventory sync, and staff management.",
  },
  {
    q: "Can I migrate from my current software?",
    a: "Absolutely. We offer free data migration from Fresha, Booksy, Zoho, and Excel spreadsheets with zero downtime.",
  },
  {
    q: "Is WhatsApp integration included?",
    a: "WhatsApp reminders, confirmations, and marketing messages are included in Professional and Enterprise plans.",
  },
  {
    q: "Do you offer a free trial?",
    a: "Yes — 14-day free trial with full access to all modules. No credit card required.",
  },
  {
    q: "What payment methods does the POS support?",
    a: "Cash, card, UPI, wallets, split payments, and membership credits — all with automatic receipt generation.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes, upgrade or downgrade at any time from your billing settings. Changes are prorated automatically.",
  },
  {
    q: "Is there a setup fee?",
    a: "No setup fee. Onboarding, data migration, and staff training are included with every paid plan.",
  },
];

export const STATS = [
  { value: 1000, suffix: "+", label: "Salons" },
  { value: 50, suffix: "K+", label: "Appointments" },
  { value: 99.9, suffix: "%", label: "Uptime", decimals: 1 },
  { value: 24, suffix: "/7", label: "Support" },
];

export const PLATFORM_TABS = [
  {
    key: "Dashboard",
    title: "Command Center",
    desc: "See revenue, appointments, and inventory in one unified view.",
  },
  {
    key: "Appointment",
    title: "Smart Scheduling",
    desc: "Drag-and-drop calendar with conflict detection and auto-reminders.",
  },
  {
    key: "Billing",
    title: "Fast Checkout",
    desc: "Split bills, apply memberships, and print receipts in seconds.",
  },
  {
    key: "CRM",
    title: "Client Relationships",
    desc: "360° client profiles with visit history and personalized offers.",
  },
  {
    key: "Inventory",
    title: "Stock Control",
    desc: "Real-time stock levels with low-inventory alerts and PO tracking.",
  },
  {
    key: "Marketing",
    title: "Grow Your Salon",
    desc: "Campaign builder with SMS, email, and WhatsApp automation.",
  },
  {
    key: "Reports",
    title: "Business Reports",
    desc: "Export-ready reports for accounting, staff, and service analysis.",
  },
  {
    key: "Analytics",
    title: "AI Analytics",
    desc: "Predictive insights on demand, churn, and revenue optimization.",
  },
];
