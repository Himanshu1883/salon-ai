import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Box,
  Brain,
  Building2,
  Calendar,
  CalendarCheck,
  CreditCard,
  Crown,
  DollarSign,
  FileText,
  Gift,
  Heart,
  LayoutDashboard,
  LineChart,
  Mail,
  Megaphone,
  MessageCircle,
  Package,
  Receipt,
  Scissors,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "Modules", href: "#modules" },
  { label: "Preview", href: "#preview" },
  { label: "Features", href: "#features" },
  { label: "AI", href: "#ai" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

export const HERO_FEATURES = [
  "Appointments",
  "Billing",
  "POS",
  "Inventory",
  "CRM",
  "Marketing",
  "WhatsApp",
  "Membership",
  "Staff",
  "Reports",
  "Analytics",
  "Multi Branch Management",
] as const;

export const FLOATING_CARDS = [
  { label: "Today's Revenue", value: "₹48,250", icon: DollarSign, color: "from-violet-500 to-purple-600" },
  { label: "Appointments", value: "24 today", icon: CalendarCheck, color: "from-emerald-500 to-teal-600" },
  { label: "WhatsApp Reminder", value: "12 sent", icon: MessageCircle, color: "from-green-500 to-emerald-600" },
  { label: "Today's Sales", value: "₹32,180", icon: ShoppingCart, color: "from-blue-500 to-indigo-600" },
  { label: "Inventory Alert", value: "3 low stock", icon: Box, color: "from-orange-500 to-amber-600" },
  { label: "Customer Growth", value: "+18%", icon: TrendingUp, color: "from-pink-500 to-rose-600" },
  { label: "Analytics", value: "Live", icon: BarChart3, color: "from-violet-500 to-fuchsia-600" },
  { label: "Membership Sales", value: "₹8,400", icon: Crown, color: "from-yellow-500 to-amber-600" },
  { label: "Pending Payments", value: "₹5,200", icon: Wallet, color: "from-red-500 to-orange-600" },
  { label: "Branch Performance", value: "3 branches", icon: Building2, color: "from-cyan-500 to-blue-600" },
  { label: "Realtime Notification", value: "New booking", icon: Bell, color: "from-purple-500 to-violet-600" },
] as const;

export const CUSTOMER_LOGOS = [
  "Luxe Hair Co.",
  "Glow Spa",
  "Urban Barber",
  "Elite Nails",
  "Studio 9",
  "Zen Wellness",
] as const;

export type ModuleItem = {
  name: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
};

export const ERP_MODULES: ModuleItem[] = [
  { name: "Dashboard", description: "Real-time KPIs and business overview at a glance.", icon: LayoutDashboard, gradient: "from-violet-500 to-purple-600" },
  { name: "Appointments", description: "Smart scheduling, reminders, and calendar management.", icon: Calendar, gradient: "from-emerald-500 to-teal-600" },
  { name: "Walk In", description: "Instant check-in and queue for walk-in customers.", icon: UserCheck, gradient: "from-blue-500 to-cyan-600" },
  { name: "Queue Management", description: "Digital queue boards and wait-time optimization.", icon: Activity, gradient: "from-orange-500 to-amber-600" },
  { name: "Customers", description: "Complete customer profiles and visit history.", icon: Users, gradient: "from-pink-500 to-rose-600" },
  { name: "CRM", description: "Segments, follow-ups, and retention workflows.", icon: Heart, gradient: "from-fuchsia-500 to-pink-600" },
  { name: "Billing", description: "Invoices, taxes, discounts, and payment tracking.", icon: Receipt, gradient: "from-violet-600 to-indigo-600" },
  { name: "POS", description: "Fast checkout with split payments and receipts.", icon: CreditCard, gradient: "from-green-500 to-emerald-600" },
  { name: "Sales", description: "Daily sales, packages, and revenue breakdowns.", icon: ShoppingCart, gradient: "from-sky-500 to-blue-600" },
  { name: "Inventory", description: "Stock levels, consumption, and purchase orders.", icon: Package, gradient: "from-amber-500 to-orange-600" },
  { name: "Services", description: "Service catalog with pricing and duration.", icon: Scissors, gradient: "from-purple-500 to-violet-600" },
  { name: "Packages", description: "Bundled services and combo offers.", icon: Gift, gradient: "from-teal-500 to-emerald-600" },
  { name: "Membership", description: "Recurring plans, credits, and renewals.", icon: Crown, gradient: "from-yellow-500 to-amber-600" },
  { name: "Staff Management", description: "Roles, schedules, and performance tracking.", icon: Users, gradient: "from-indigo-500 to-violet-600" },
  { name: "Attendance", description: "Clock-in/out with biometric integration.", icon: CalendarCheck, gradient: "from-lime-500 to-green-600" },
  { name: "Payroll", description: "Commissions, pay runs, and salary reports.", icon: Wallet, gradient: "from-emerald-600 to-teal-600" },
  { name: "Marketing", description: "Campaigns, offers, and customer outreach.", icon: Megaphone, gradient: "from-rose-500 to-pink-600" },
  { name: "WhatsApp", description: "Automated reminders and two-way messaging.", icon: MessageCircle, gradient: "from-green-500 to-emerald-600" },
  { name: "Campaigns", description: "SMS, email, and WhatsApp blast campaigns.", icon: Mail, gradient: "from-blue-600 to-indigo-600" },
  { name: "Expenses", description: "Track salon expenses and vendor payments.", icon: FileText, gradient: "from-stone-500 to-gray-600" },
  { name: "Reports", description: "50+ pre-built reports for every metric.", icon: BarChart3, gradient: "from-violet-500 to-purple-600" },
  { name: "Analytics", description: "Deep insights with trend analysis.", icon: LineChart, gradient: "from-cyan-500 to-blue-600" },
  { name: "Multi Branch", description: "Centralized control across all locations.", icon: Building2, gradient: "from-purple-600 to-fuchsia-600" },
  { name: "Roles & Permissions", description: "Granular access control for every user.", icon: Shield, gradient: "from-slate-500 to-gray-600" },
  { name: "Settings", description: "Salon profile, taxes, and integrations.", icon: Settings, gradient: "from-neutral-500 to-stone-600" },
  { name: "AI Assistant", description: "Natural language queries and smart actions.", icon: Bot, gradient: "from-violet-500 via-purple-500 to-emerald-500" },
];

export const PREVIEW_TABS = [
  "Dashboard",
  "Appointment",
  "Billing",
  "Inventory",
  "CRM",
  "Marketing",
  "Analytics",
] as const;

export type PreviewTab = (typeof PREVIEW_TABS)[number];

export const COMPARISON = {
  traditional: {
    title: "Traditional Salon Software",
    items: [
      "Disconnected tools for booking, billing, and inventory",
      "Manual reports that take hours to compile",
      "No WhatsApp automation or smart reminders",
      "Limited multi-branch visibility",
      "Reactive decisions without AI insights",
      "Expensive custom integrations",
    ],
  },
  salonAi: {
    title: "Salon AI ERP",
    items: [
      "Unified platform with 26+ integrated modules",
      "Real-time dashboards and one-click reports",
      "Built-in WhatsApp, SMS, and email campaigns",
      "Centralized multi-branch command center",
      "AI-powered predictions and recommendations",
      "Enterprise-ready with role-based access",
    ],
  },
} as const;

export const BUSINESS_TYPES = [
  { name: "Hair Salon", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop" },
  { name: "Beauty Salon", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop" },
  { name: "Spa", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop" },
  { name: "Clinic", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop" },
  { name: "Nail Studio", image: "https://images.unsplash.com/photo-1604654896290-d9e8b4b5c8c0?w=600&h=400&fit=crop" },
  { name: "Barber Shop", image: "https://images.unsplash.com/photo-1503951914875-162162056329?w=600&h=400&fit=crop" },
  { name: "Makeup Studio", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop" },
  { name: "Academy", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop" },
  { name: "Franchise", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop" },
] as const;

export const FEATURES = [
  { title: "Online Booking", description: "24/7 appointment scheduling with automated confirmations.", icon: Calendar },
  { title: "POS Billing", description: "Lightning-fast checkout with split payments and receipts.", icon: CreditCard },
  { title: "Inventory Control", description: "Real-time stock tracking with low-stock alerts.", icon: Package },
  { title: "CRM & Segments", description: "Customer profiles, tags, and targeted campaigns.", icon: Users },
  { title: "WhatsApp Automation", description: "Reminders, follow-ups, and two-way messaging.", icon: MessageCircle },
  { title: "Multi-Branch", description: "Manage all locations from a single dashboard.", icon: Building2 },
  { title: "Staff & Payroll", description: "Attendance, commissions, and pay run automation.", icon: Wallet },
  { title: "Membership Plans", description: "Recurring revenue with credits and renewals.", icon: Crown },
  { title: "Marketing Campaigns", description: "SMS, email, and WhatsApp blast campaigns.", icon: Megaphone },
  { title: "Advanced Reports", description: "50+ reports covering every business metric.", icon: BarChart3 },
  { title: "AI Analytics", description: "Predictive insights and smart recommendations.", icon: Brain },
  { title: "Role Permissions", description: "Granular access control for every team member.", icon: Shield },
] as const;

export const AI_FEATURES = [
  { title: "AI Reports", description: "Generate comprehensive reports with natural language queries.", icon: FileText },
  { title: "AI Business Insights", description: "Discover trends and opportunities hidden in your data.", icon: Sparkles },
  { title: "Revenue Prediction", description: "Forecast revenue with machine learning models.", icon: TrendingUp },
  { title: "Inventory Prediction", description: "Predict stock needs before you run out.", icon: Box },
  { title: "Staff Performance", description: "AI-scored performance metrics and coaching tips.", icon: UserCheck },
  { title: "Customer Behaviour", description: "Understand patterns and predict churn risk.", icon: Users },
  { title: "Smart Reminder", description: "Optimal timing for appointment reminders.", icon: Bell },
  { title: "AI Marketing", description: "Personalized campaign suggestions that convert.", icon: Zap },
] as const;

export const STATS = [
  { value: 1000, suffix: "+", label: "Salons" },
  { value: 20, suffix: "+", label: "Modules" },
  { value: 99.99, suffix: "%", label: "Uptime", decimals: 2 },
  { value: 10, suffix: " Million+", label: "Invoices", multiplier: 1000000 },
  { value: 5, suffix: " Million+", label: "Appointments", multiplier: 1000000 },
] as const;

export const TESTIMONIALS = [
  {
    quote: "Salon AI transformed our 4-branch operation. We went from spreadsheets to a unified ERP in one week.",
    name: "Priya Sharma",
    role: "CEO, Luxe Hair Co.",
    rating: 5,
  },
  {
    quote: "The AI insights alone paid for the subscription. We increased revenue by 23% in the first quarter.",
    name: "Raj Patel",
    role: "Owner, Urban Barber Chain",
    rating: 5,
  },
  {
    quote: "WhatsApp automation reduced no-shows by 40%. Our front desk team finally has time to focus on guests.",
    name: "Anita Desai",
    role: "Director, Glow Spa Group",
    rating: 5,
  },
] as const;

export const PRICING_PLANS = [
  {
    name: "Basic",
    price: "₹999",
    period: "/month",
    description: "Essential tools for single-location salons.",
    features: [
      "Appointments & Walk-in",
      "POS Billing",
      "Customer Management",
      "Basic Reports",
      "WhatsApp Reminders",
      "1 Branch",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "₹2,499",
    period: "/month",
    description: "Full ERP suite for growing salon businesses.",
    features: [
      "All Basic features",
      "Inventory & CRM",
      "Marketing Campaigns",
      "Staff & Payroll",
      "Advanced Analytics",
      "Up to 3 Branches",
      "AI Insights",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored solutions for franchises and chains.",
    features: [
      "All Professional features",
      "Unlimited Branches",
      "Custom Integrations",
      "Dedicated Account Manager",
      "SLA & Priority Support",
      "Advanced AI Suite",
      "White-label Options",
    ],
    cta: "Book Demo",
    highlighted: false,
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "What is Salon AI ERP?",
    answer: "Salon AI is an enterprise-grade salon management platform that combines 26+ modules — appointments, billing, POS, inventory, CRM, marketing, staff management, and AI analytics — into one unified system.",
  },
  {
    question: "How long does setup take?",
    answer: "Most salons are fully operational within 24–48 hours. Our onboarding team handles data migration, staff training, and configuration at no extra cost.",
  },
  {
    question: "Does it support multiple branches?",
    answer: "Yes. Professional plans support up to 3 branches, and Enterprise plans offer unlimited locations with centralized reporting and role-based access per branch.",
  },
  {
    question: "Is WhatsApp integration included?",
    answer: "WhatsApp reminders and two-way messaging are built into every plan. Marketing campaigns via WhatsApp are available on Professional and Enterprise tiers.",
  },
  {
    question: "Can I try before I buy?",
    answer: "Absolutely. Start a 14-day free trial with full access to all Professional features. No credit card required.",
  },
  {
    question: "What about data security?",
    answer: "We use bank-grade encryption, daily backups, and 99.99% uptime SLA. Your data is stored in secure, ISO-certified data centers.",
  },
] as const;

export const FOOTER_LINKS = {
  product: [
    { label: "Modules", href: "#modules" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "AI", href: "#ai" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Security", href: "#" },
  ],
} as const;
