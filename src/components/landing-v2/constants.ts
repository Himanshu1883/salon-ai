import {
  LayoutDashboard,
  Calendar,
  UserPlus,
  ListOrdered,
  Receipt,
  CreditCard,
  Users,
  Heart,
  Package,
  Scissors,
  Gift,
  Crown,
  UserCog,
  Clock,
  Wallet,
  Megaphone,
  MessageCircle,
  PiggyBank,
  FileBarChart,
  BarChart3,
  Building2,
  Settings,
  Sparkles,
  Brain,
  TrendingUp,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

/** Build curated Unsplash URL with size & quality */
export function img(id: string, w = 1920) {
  return `https://images.unsplash.com/${id}?w=${w}&q=85&auto=format&fit=crop`;
}

/* ─── Curated luxury salon photography (verified Unsplash IDs) ─── */
export const IMAGES = {
  hero: img("photo-1521590832167-7bcbfaa6381f", 2400),
  bannerModern: img("photo-1633681926022-84c23e8cb2d6", 2400),
  bannerNails: img("photo-1706629503571-c165023a7792", 2400),
  bannerGrowth: img("photo-1633681138600-295fcd688876", 2400),
  hairStyling: img("photo-1695527081848-1e46c06e6458", 1600),
  hairColor: img("photo-1516975080664-ed2fc6a32937", 1600),
  hairWash: img("photo-1626379501846-0df4067b8bb9", 1600),
  hairCut: img("photo-1626383137804-ff908d2753a2", 1600),
  hairColoring: img("photo-1516975080664-ed2fc6a32937", 1600),
  makeup: img("photo-1515377905703-c4788e51af15", 1600),
  makeupArtist: img("photo-1695527081848-1e46c06e6458", 1600),
  bridal: img("photo-1512496015851-a90fb38ba796", 1600),
  spaMassage: img("photo-1540555700478-4be289fbecef", 1600),
  facial: img("photo-1512496015851-a90fb38ba796", 1600),
  nailArt: img("photo-1706629503571-c165023a7792", 1600),
  barber: img("photo-1600948836101-f9ffda59d250", 1600),
  salonChair: img("photo-1633681138600-295fcd688876", 1600),
  beautySalon: img("photo-1633681926019-03bd9325ec20", 1600),
  salonWorkspace: img("photo-1560066984-138dadb4c035", 1600),
  beautyProducts: img("photo-1633681926019-03bd9325ec20", 1600),
  spaInterior: img("photo-1631049307264-da0ec9d70304", 1600),
  spaRoom: img("photo-1540555700478-4be289fbecef", 1600),
  skinClinic: "/face.png",
  tattooStudio: "/tattoo.jpg",
  reception: img("photo-1633681926022-84c23e8cb2d6", 1600),
  waitingArea: img("photo-1633681138600-295fcd688876", 1600),
  owner1: img("photo-1573496359142-b8d87734a5a2", 800),
  owner2: img("photo-1556157382-97eda2d62296", 800),
  owner3: img("photo-1580489944761-15a19d654956", 800),
  owner4: img("photo-1573496359142-b8d87734a5a2", 800),
  footerBg: img("photo-1521590832167-7bcbfaa6381f", 2400),
  faqBg: img("photo-1633681138600-295fcd688876", 2400),
  pricingBg: img("photo-1706629503571-c165023a7792", 2400),
} as const;

export const BRAND = {
  name: "Salon AI",
  tagline: "Luxury Salon Management, Powered by Intelligence",
  emerald: "#059669",
  purple: "#7c3aed",
  roseGold: "#e8a598",
};

export const HERO = {
  eyebrow: "AI-Powered Salon ERP",
  headline: "Run your entire salon with",
  headlineEmphasis: "AI-powered precision.",
  subtitle:
    "Appointments, billing, inventory, and clients — one intelligent platform built for salons.",
  features: [
    "Appointments",
    "POS Billing",
    "Inventory",
    "CRM",
    "Marketing",
    "Membership",
    "WhatsApp",
    "Reports",
    "Analytics",
    "Multi-Branch",
  ],
  ctaPrimary: "Start Free Trial",
  ctaSecondary: "Book a Demo",
};

export const HERO_FLOATING_CARDS = [
  { id: "revenue", label: "Revenue", value: "₹2.4L", trend: "+12% this month", accent: "burgundy" as const },
  { id: "inventory", label: "Inventory", value: "124", trend: "Items in stock", accent: "sage" as const },
  { id: "clients", label: "Clients", value: "1,284", trend: "+18% MoM", accent: "gold" as const },
];

export const BANNERS = [
  {
    id: "modern",
    image: IMAGES.bannerModern,
    text: "Built for Modern Salon Businesses.",
    alt: "Modern luxury salon interior with styling stations",
  },
  {
    id: "appointments",
    image: IMAGES.bannerNails,
    text: "Manage Every Appointment Without Missing a Customer.",
    alt: "Luxury nail salon with marble interior and styling stations",
  },
  {
    id: "growth",
    image: IMAGES.bannerGrowth,
    text: "Scale Your Salon Brand With Enterprise Intelligence.",
    alt: "Premium hair salon with styling chairs and mirrors",
  },
];

export type ErpModule = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  image: string;
  alt: string;
};

export const ERP_MODULES: ErpModule[] = [
  { id: "dashboard", title: "Dashboard", description: "Real-time salon KPIs, revenue trends, and branch performance at a glance.", icon: LayoutDashboard, image: IMAGES.salonWorkspace, alt: "Salon owner reviewing dashboard metrics" },
  { id: "appointments", title: "Appointments", description: "Smart booking, reminders, and calendar management for every stylist.", icon: Calendar, image: IMAGES.hairStyling, alt: "Stylist managing salon appointments" },
  { id: "walk-in", title: "Walk In", description: "Instant check-in for walk-in clients with automatic queue assignment.", icon: UserPlus, image: IMAGES.reception, alt: "Salon reception desk greeting clients" },
  { id: "queue", title: "Queue", description: "Live queue board with estimated wait times and stylist availability.", icon: ListOrdered, image: IMAGES.waitingArea, alt: "Salon waiting area with comfortable seating" },
  { id: "billing", title: "Billing", description: "Generate invoices, split payments, and apply discounts effortlessly.", icon: Receipt, image: IMAGES.beautyProducts, alt: "Salon billing counter with beauty products" },
  { id: "pos", title: "POS", description: "Touch-friendly point of sale built for busy salon counters.", icon: CreditCard, image: IMAGES.salonChair, alt: "POS counter at luxury salon" },
  { id: "customers", title: "Customers", description: "Complete client profiles with visit history and preferences.", icon: Users, image: IMAGES.facial, alt: "Customer receiving facial treatment" },
  { id: "crm", title: "CRM", description: "Segment clients, track loyalty, and nurture repeat bookings.", icon: Heart, image: IMAGES.makeup, alt: "Makeup consultation with client" },
  { id: "inventory", title: "Inventory", description: "Track products, set reorder alerts, and manage stock across branches.", icon: Package, image: IMAGES.beautyProducts, alt: "Salon inventory storage room" },
  { id: "services", title: "Services", description: "Configure services, pricing tiers, and duration by category.", icon: Scissors, image: IMAGES.hairCut, alt: "Professional hair cutting service" },
  { id: "packages", title: "Packages", description: "Bundle services into seasonal packages and combo deals.", icon: Gift, image: IMAGES.spaMassage, alt: "Spa package treatment room" },
  { id: "membership", title: "Membership", description: "Recurring membership plans with auto-renewal and perks.", icon: Crown, image: IMAGES.spaInterior, alt: "VIP spa membership lounge" },
  { id: "staff", title: "Staff", description: "Manage roles, schedules, commissions, and performance.", icon: UserCog, image: IMAGES.hairColor, alt: "Salon staff performing hair coloring" },
  { id: "attendance", title: "Attendance", description: "Clock-in/out tracking with shift reports and overtime alerts.", icon: Clock, image: IMAGES.barber, alt: "Barber shop staff at work" },
  { id: "payroll", title: "Payroll", description: "Automated salary calculations based on services and commissions.", icon: Wallet, image: IMAGES.beautySalon, alt: "Salon team meeting" },
  { id: "marketing", title: "Marketing", description: "Campaigns, promotions, and birthday offers that drive rebookings.", icon: Megaphone, image: IMAGES.bridal, alt: "Bridal makeup marketing showcase" },
  { id: "whatsapp", title: "WhatsApp", description: "Automated reminders, confirmations, and two-way client chat.", icon: MessageCircle, image: IMAGES.makeupArtist, alt: "Stylist communicating with client" },
  { id: "expenses", title: "Expenses", description: "Track salon expenses, vendor payments, and profit margins.", icon: PiggyBank, image: IMAGES.salonWorkspace, alt: "Salon back office expense tracking" },
  { id: "reports", title: "Reports", description: "Detailed financial, staff, and service reports exportable to PDF.", icon: FileBarChart, image: IMAGES.hairWash, alt: "Salon manager reviewing reports" },
  { id: "analytics", title: "Analytics", description: "Deep insights into revenue, retention, and peak hours.", icon: BarChart3, image: IMAGES.hairColoring, alt: "Analytics-driven salon growth" },
  { id: "multi-branch", title: "Multi Branch", description: "Centralized control across all salon locations from one dashboard.", icon: Building2, image: IMAGES.bannerModern, alt: "Multi-branch luxury salon chain" },
  { id: "settings", title: "Settings", description: "Customize branding, taxes, notifications, and integrations.", icon: Settings, image: IMAGES.nailArt, alt: "Salon settings and configuration" },
];

export type PreviewTab = {
  id: string;
  label: string;
  title: string;
  description: string;
};

export const PREVIEW_TABS: PreviewTab[] = [
  { id: "dashboard", label: "Dashboard", title: "Command Center", description: "See revenue, appointments, and inventory in one unified view." },
  { id: "appointment", label: "Appointment", title: "Smart Scheduling", description: "Drag-and-drop calendar with conflict detection and auto-reminders." },
  { id: "billing", label: "Billing", title: "Fast Checkout", description: "Split bills, apply memberships, and print receipts in seconds." },
  { id: "crm", label: "CRM", title: "Client Relationships", description: "360° client profiles with visit history and personalized offers." },
  { id: "inventory", label: "Inventory", title: "Stock Control", description: "Real-time stock levels with low-inventory alerts and PO tracking." },
  { id: "marketing", label: "Marketing", title: "Grow Your Salon", description: "Campaign builder with SMS, email, and WhatsApp automation." },
  { id: "reports", label: "Reports", title: "Business Reports", description: "Export-ready reports for accounting, staff, and service analysis." },
  { id: "analytics", label: "Analytics", title: "AI Analytics", description: "Predictive insights on demand, churn, and revenue optimization." },
];

export type SalonType = {
  id: string;
  name: string;
  image: string;
  alt: string;
};

export const SALON_TYPES: SalonType[] = [
  { id: "hair", name: "Hair Salon", image: IMAGES.hairStyling, alt: "Hair salon styling stations and mirrors" },
  { id: "beauty", name: "Beauty Salon", image: IMAGES.makeup, alt: "Beauty salon makeup and styling service" },
  { id: "spa", name: "Spa", image: IMAGES.spaMassage, alt: "Luxury spa therapy and wellness room" },
  { id: "skin", name: "Skin Clinic", image: IMAGES.skinClinic, alt: "Skin clinic facial treatment room with aesthetic bed" },
  { id: "barber", name: "Barber Shop", image: IMAGES.barber, alt: "Barber shop interior with styling chairs" },
  { id: "nail", name: "Nail Studio", image: IMAGES.nailArt, alt: "Nail studio manicure and nail art setup" },
  { id: "makeup", name: "Makeup Studio", image: IMAGES.makeupArtist, alt: "Professional makeup studio workspace" },
  { id: "academy", name: "Academy", image: IMAGES.hairColor, alt: "Salon academy hair color training class" },
  { id: "bridal", name: "Bridal Studio", image: IMAGES.bridal, alt: "Bridal studio makeup and preparation" },
  { id: "tattoo", name: "Tattoo Studio", image: IMAGES.tattooStudio, alt: "Premium tattoo studio interior with treatment chairs" },
];

export type FeatureBlock = {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  image: string;
  alt: string;
};

export const FEATURE_BLOCKS: FeatureBlock[] = [
  {
    id: "reception",
    title: "Reception That Impresses",
    description: "Give every client a five-star welcome from the moment they walk in.",
    bullets: ["Digital check-in kiosk", "VIP client recognition", "Real-time queue display"],
    image: IMAGES.reception,
    alt: "Luxury salon reception desk",
  },
  {
    id: "pos",
    title: "POS Built for Salons",
    description: "Checkout flows designed for the speed and complexity of salon billing.",
    bullets: ["Split payments & tips", "Membership auto-apply", "Receipt via WhatsApp"],
    image: IMAGES.salonChair,
    alt: "Salon POS counter checkout",
  },
  {
    id: "inventory",
    title: "Inventory You Can Trust",
    description: "Never run out of color, products, or retail items mid-appointment.",
    bullets: ["Multi-branch stock sync", "Auto reorder alerts", "Usage tracking per service"],
    image: IMAGES.beautyProducts,
    alt: "Salon inventory and product storage",
  },
  {
    id: "hair-cutting",
    title: "Stylist-First Workflow",
    description: "Tools that keep stylists focused on clients, not paperwork.",
    bullets: ["Service history at chair-side", "Commission tracking", "Performance leaderboard"],
    image: IMAGES.hairCut,
    alt: "Professional hair cutting in salon",
  },
  {
    id: "beauty-treatment",
    title: "Beauty Treatment Tracking",
    description: "Document every treatment with photos, notes, and product usage.",
    bullets: ["Before/after gallery", "Allergy & skin type notes", "Treatment plan templates"],
    image: IMAGES.facial,
    alt: "Beauty facial treatment session",
  },
  {
    id: "massage",
    title: "Spa & Wellness Management",
    description: "Room scheduling, therapist rotation, and package redemption in one flow.",
    bullets: ["Room availability grid", "Package session tracking", "Therapist preferences"],
    image: IMAGES.spaRoom,
    alt: "Luxury massage and spa room",
  },
  {
    id: "spa",
    title: "Full Spa Experience",
    description: "Manage the complete spa journey from booking to post-visit follow-up.",
    bullets: ["Multi-service itineraries", "Gift voucher redemption", "Loyalty point accrual"],
    image: IMAGES.spaInterior,
    alt: "Premium spa interior design",
  },
  {
    id: "consultation",
    title: "Client Consultation Hub",
    description: "Turn every consultation into a personalized service recommendation.",
    bullets: ["AI style suggestions", "Digital consent forms", "Instant quote generation"],
    image: IMAGES.hairColoring,
    alt: "Hair color consultation with client",
  },
];

export const AI_SECTION = {
  heading: "AI That Understands Your Salon",
  subtitle: "Predictive analytics, smart scheduling, and automated insights that help you grow revenue while delivering exceptional client experiences.",
  features: [
    { icon: Brain, title: "Demand Forecasting", desc: "Predict busy hours and optimize staff scheduling." },
    { icon: Sparkles, title: "Smart Recommendations", desc: "AI-suggested services based on client history." },
    { icon: TrendingUp, title: "Revenue Optimization", desc: "Identify upsell opportunities and pricing gaps." },
    { icon: ShoppingBag, title: "Inventory Intelligence", desc: "Auto-predict product reorder needs by usage patterns." },
  ],
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  salon: string;
  quote: string;
  rating: number;
  image: string;
  alt: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    role: "Owner",
    salon: "Luxe Hair Studio, Mumbai",
    quote: "Salon AI transformed how we manage 3 branches. Revenue is up 40% and our clients love the WhatsApp reminders.",
    rating: 5,
    image: IMAGES.owner1,
    alt: "Priya Sharma salon owner portrait",
  },
  {
    id: "2",
    name: "Raj Malhotra",
    role: "Director",
    salon: "The Groom Room, Delhi",
    quote: "The POS and inventory modules alone saved us 15 hours a week. Best investment for our barber chain.",
    rating: 5,
    image: IMAGES.owner2,
    alt: "Raj Malhotra barber shop director",
  },
  {
    id: "3",
    name: "Ananya Reddy",
    role: "Founder",
    salon: "Glow Spa & Wellness, Bangalore",
    quote: "From appointments to payroll — everything just works. The AI analytics helped us identify our most profitable services.",
    rating: 5,
    image: IMAGES.owner3,
    alt: "Ananya Reddy spa founder portrait",
  },
  {
    id: "4",
    name: "Meera Kapoor",
    role: "CEO",
    salon: "Bridal Bliss Studio, Jaipur",
    quote: "Managing bridal bookings used to be chaos. Now our team handles 200+ weddings a season with zero double-bookings.",
    rating: 5,
    image: IMAGES.owner4,
    alt: "Meera Kapoor bridal studio CEO",
  },
];

export const GOOGLE_REVIEWS = {
  rating: 4.9,
  count: 847,
  highlights: [
    "Best salon software in India",
    "Incredible support team",
    "Worth every rupee",
  ],
};

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "₹1,999",
    period: "/month",
    description: "Perfect for single-location salons getting started.",
    features: ["Up to 3 staff", "Appointments & Billing", "Basic CRM", "WhatsApp reminders", "Email support"],
    cta: "Start Free Trial",
  },
  {
    id: "professional",
    name: "Professional",
    price: "₹4,999",
    period: "/month",
    description: "For growing salons that need the full ERP suite.",
    features: ["Up to 15 staff", "All 22 ERP modules", "AI Analytics", "Marketing automation", "Inventory & POS", "Priority support"],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    id: "business",
    name: "Business",
    price: "₹8,999",
    period: "/month",
    description: "For multi-chair salons and small chains ready to scale.",
    features: ["Up to 30 staff", "2 branch locations", "All Professional features", "Advanced reporting", "API access", "Phone & chat support"],
    cta: "Start Free Trial",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Multi-branch chains with advanced customization needs.",
    features: ["Unlimited staff & branches", "Custom integrations", "Dedicated account manager", "White-label options", "SLA guarantee", "On-site training"],
    cta: "Book Demo",
  },
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  { question: "How quickly can I set up Salon AI?", answer: "Most salons are fully operational within 24 hours. Our onboarding team imports your services, staff, and client data for you." },
  { question: "Does it work for multi-branch salons?", answer: "Yes. Manage unlimited branches from a single dashboard with centralized reporting, inventory sync, and staff management." },
  { question: "Can I migrate from my current software?", answer: "Absolutely. We offer free data migration from Fresha, Booksy, Zoho, and Excel spreadsheets with zero downtime." },
  { question: "Is WhatsApp integration included?", answer: "WhatsApp reminders, confirmations, and marketing messages are included in Professional and Enterprise plans." },
  { question: "Do you offer a free trial?", answer: "Yes — 14-day free trial with full access to all modules. No credit card required." },
  { question: "What payment methods does the POS support?", answer: "Cash, card, UPI, wallets, split payments, and membership credits — all with automatic receipt generation." },
];

export type FooterLink = { label: string; href: string };

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Modules", href: "/#modules" },
      { label: "AI Analytics", href: "/#ai" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Documentation", href: "/documentation" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "mailto:support@salonai.com" },
    ],
  },
];

/** @deprecated Use FOOTER_COLUMNS */
export const FOOTER_LINKS = {
  product: FOOTER_COLUMNS[0].links.map((l) => l.label),
  company: FOOTER_COLUMNS[1].links.map((l) => l.label),
};

export const FOOTER_STATS = [
  { value: 1000, suffix: "+", label: "Salons" },
  { value: 50, suffix: "K+", label: "Appointments" },
  { value: 99.9, suffix: "%", label: "Uptime", decimals: 1 },
  { value: null, display: "24/7", label: "Support" },
] as const;

/** Only include entries with real URLs — empty until social profiles exist. */
export const FOOTER_SOCIAL: {
  label: string;
  href: string;
  icon: "linkedin" | "instagram" | "twitter" | "facebook";
}[] = [];

export const FLOATING_CARDS = [
  { id: "revenue", label: "Revenue", value: "₹2.4L", trend: "+12%", color: "emerald" },
  { id: "appointments", label: "Appointments", value: "48", trend: "Today", color: "purple" },
  { id: "inventory", label: "Inventory", value: "124", trend: "Items", color: "rose" },
  { id: "whatsapp", label: "WhatsApp", value: "32", trend: "Sent", color: "emerald" },
  { id: "growth", label: "Customer Growth", value: "+18%", trend: "MoM", color: "purple" },
  { id: "sales", label: "Today's Sales", value: "₹86K", trend: "+8%", color: "rose" },
  { id: "branch", label: "Branch Performance", value: "3/3", trend: "Active", color: "emerald" },
  { id: "ai", label: "AI Insights", value: "7", trend: "New", color: "purple" },
] as const;

export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/integrations", label: "Integrations" },
  { href: "/documentation", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
];
