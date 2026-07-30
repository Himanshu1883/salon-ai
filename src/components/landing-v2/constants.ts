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

/* ─── Curated luxury salon photography (25 unique photos) ─── */
export const IMAGES = {
  hero: img("photo-1560066984-138d9834c058", 2400),
  bannerModern: img("photo-1633681926022-84c23e8cb8d6", 2400),
  bannerNails: img("photo-1604654896290-df63fb53671", 2400),
  hairStyling: img("photo-1522337360788-8eee13f43537", 1600),
  hairColor: img("photo-1516975080664-ed2fc6a32937", 1600),
  hairWash: img("photo-1595476109620-6759778ee7aa", 1600),
  hairCut: img("photo-1515378799646-29797c97a861", 1600),
  hairColoring: img("photo-1595475207223-428b62b9619a", 1600),
  makeup: img("photo-1515377905703-c4788e51af15", 1600),
  makeupArtist: img("photo-1522335789202-aabd1fc54bc9", 1600),
  bridal: img("photo-1605497788044-5a32c707b76", 1600),
  spaMassage: img("photo-1519415510338-8ea38583302f", 1600),
  facial: img("photo-1512496015851-a90fb38ba796", 1600),
  nailArt: img("photo-1487412947627-51931370a3b7", 1600),
  barber: img("photo-1503951914875-452162b0f3f0", 1600),
  salonChair: img("photo-1521590832164-b7fa111a8572", 1600),
  beautySalon: img("photo-1562322560-ab82cd340997", 1600),
  salonWorkspace: img("photo-1634449571103-7c21e446e206", 1600),
  beautyProducts: img("photo-1596755389378-c31e798baad", 1600),
  spaInterior: img("photo-1631049307264-da0ec9d70304", 1600),
  spaRoom: img("photo-1540555700478-4be289fbecef", 1600),
  skinClinic: img("photo-1610992015732-2449b76340bd", 1600),
  tattooStudio: img("photo-1519823551278-64ac92734fb8", 1600),
  reception: img("photo-1522338150512-f5f1a792b9b6", 1600),
  waitingArea: img("photo-1560066984-138d9834c058", 1600),
  owner1: img("photo-1573496359142-b8d87734a5a2", 800),
  owner2: img("photo-1556157382-97eda2d62296", 800),
  owner3: img("photo-1580489944761-15a19d654956", 800),
  owner4: img("photo-1594744803329-58e4b7ab98b8", 800),
  footerBg: img("photo-1633681926022-84c23e8cb8d6", 2400),
  faqBg: img("photo-1562322560-ab82cd340997", 2400),
  pricingBg: img("photo-1521590832164-b7fa111a8572", 2400),
} as const;

export const BRAND = {
  name: "Salon AI",
  tagline: "Luxury Salon Management, Powered by Intelligence",
  emerald: "#059669",
  purple: "#7c3aed",
  roseGold: "#e8a598",
};

export const HERO = {
  heading: "Run Your Entire Salon With AI Powered ERP",
  subtitle: "Everything your salon needs in one intelligent platform.",
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
    "Multi Branch",
  ],
  ctaPrimary: "Start Free Trial",
  ctaSecondary: "Book Demo",
};

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
    alt: "Luxury nail salon with professional nail art setup",
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
  { id: "hair", name: "Hair Salon", image: IMAGES.hairStyling, alt: "Luxury hair salon styling session" },
  { id: "beauty", name: "Beauty Salon", image: IMAGES.makeup, alt: "Beauty salon makeup service" },
  { id: "spa", name: "Spa", image: IMAGES.spaMassage, alt: "Luxury spa therapy room" },
  { id: "skin", name: "Skin Clinic", image: IMAGES.skinClinic, alt: "Professional skin clinic treatment" },
  { id: "barber", name: "Barber Shop", image: IMAGES.barber, alt: "Premium barber shop interior" },
  { id: "nail", name: "Nail Studio", image: IMAGES.nailArt, alt: "Nail art studio with manicure setup" },
  { id: "makeup", name: "Makeup Studio", image: IMAGES.makeupArtist, alt: "Professional makeup studio" },
  { id: "academy", name: "Academy", image: IMAGES.hairColor, alt: "Salon academy training session" },
  { id: "bridal", name: "Bridal Studio", image: IMAGES.bridal, alt: "Bridal makeup studio preparation" },
  { id: "tattoo", name: "Tattoo Studio", image: IMAGES.tattooStudio, alt: "Professional tattoo studio" },
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

export const FOOTER_LINKS = {
  product: ["Features", "Pricing", "Modules", "AI Analytics", "Integrations"],
  company: ["About", "Careers", "Blog", "Press", "Contact"],
  support: ["Help Center", "Documentation", "API", "Status", "Community"],
  legal: ["Privacy", "Terms", "Security", "GDPR"],
};

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
  { href: "#modules", label: "Modules" },
  { href: "#preview", label: "Platform" },
  { href: "#salon-types", label: "Salon Types" },
  { href: "#features", label: "Features" },
  { href: "#ai", label: "AI" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];
