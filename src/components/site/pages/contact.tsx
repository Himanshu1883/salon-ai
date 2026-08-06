"use client";

import { Reveal } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/Sections";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Shield,
  Zap,
  Award,
  MessageSquare,
  Send,
  Building2,
  Globe,
  Headphones,
  Calendar,
  Star,
} from "lucide-react";
import { useState } from "react";

const contactImg = "/gotix/contact-office.jpg";

const TITLE = "Contact Gotix — Talk to Our Team";
const DESC =
  "Get in touch with the Gotix team for demos, migration help, pricing questions or partnership enquiries.";

const FIELDS = [
  { name: "name", label: "Your name", type: "text", placeholder: "John Doe" },
  { name: "salon", label: "Salon name", type: "text", placeholder: "Luxe Hair Studio" },
  { name: "email", label: "Email", type: "email", placeholder: "john@luxe.com" },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+91 98765 43210" },
] as const;

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@gotix.ai",
    link: "mailto:hello@gotix.ai",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 90000 10050",
    link: "tel:+919000010050",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "4th Floor, Beauty Tech House, Indiranagar, Bengaluru 560038",
    link: "#",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon–Sat · 9:30 AM – 7:00 PM IST",
    link: "#",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
];

const SUPPORT_STATS = [
  { value: "2hrs", label: "Avg. Response Time", icon: Clock },
  { value: "24/7", label: "Support Available", icon: Headphones },
  { value: "98%", label: "Satisfaction Rate", icon: Star },
  { value: "4.9★", label: "Client Rating", icon: Award },
];

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    salon: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSent(false);
      setFormData({ name: "", salon: "", email: "", phone: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let's talk about your <em className="italic text-primary">salon.</em>
          </>
        }
        subtitle="Tell us how you work today and we'll show you exactly what changes on day one."
        image={contactImg}
        imageAlt="Boutique beauty salon storefront at golden hour"
      />

      {/* Quick Stats Section */}
      <section className="relative w-full overflow-hidden border-y border-border/60 bg-card/30 py-8 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SUPPORT_STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-xl bg-card/50 p-4 backdrop-blur-sm border border-border/50"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative w-full overflow-hidden py-24 lg:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="mx-auto grid w-full max-w-[1500px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column - Contact Form */}
          <Reveal>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-medium">Send us a message</h2>
                  <p className="text-sm text-muted-foreground">
                    Fill in the form and we'll get back to you within 2 hours.
                  </p>
                </div>
              </div>

              <form className="mt-8" onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  {FIELDS.map((f) => (
                    <label key={f.name} className={`block text-sm ${f.name === "message" ? "sm:col-span-2" : ""}`}>
                      <span className="font-medium text-foreground">{f.label}</span>
                      {f.name !== "message" ? (
                        <input
                          required
                          name={f.name}
                          type={f.type}
                          value={formData[f.name as keyof typeof formData] as string}
                          onChange={handleChange}
                          placeholder={f.placeholder}
                          className="mt-2 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm outline-hidden transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      ) : null}
                    </label>
                  ))}
                  <label className="block text-sm sm:col-span-2">
                    <span className="font-medium text-foreground">Message</span>
                    <textarea
                      required
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your salon and what you're looking for..."
                      className="mt-2 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm outline-hidden transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-medium text-primary-foreground transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
                >
                  {sent ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Message sent successfully!
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                {sent && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-green-500 flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Thanks — we'll be in touch within one business day.
                  </motion.p>
                )}
              </form>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border/50 pt-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Secure form</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">Fast response</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Expert team</span>
                </div>
              </div>
            </motion.div>
          </Reveal>

          {/* Right Column - Contact Info */}
          <Reveal delay={0.1}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Contact Cards */}
              {CONTACT_INFO.map((info, index) => (
                <motion.a
                  key={index}
                  href={info.link}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`group flex items-start gap-4 rounded-2xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 ${info.link !== "#" ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className={`rounded-xl bg-gradient-to-br ${info.color} p-2.5 ${info.iconColor} transition-colors group-hover:from-primary/20 group-hover:to-purple-500/20`}>
                    <info.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{info.label}</p>
                    <p className="font-medium text-foreground">{info.value}</p>
                  </div>
                  {info.link !== "#" && (
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  )}
                </motion.a>
              ))}

              {/* Map Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10">
                  {/* Map placeholder with branding */}
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-primary/10 p-4 text-primary">
                      <MapPin className="h-8 w-8" />
                    </div>
                    <p className="mt-3 font-display text-lg font-medium">Find us here</p>
                    <p className="text-sm text-muted-foreground">
                      4th Floor, Beauty Tech House, Indiranagar, Bengaluru 560038
                    </p>
                    <div className="mt-4 flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs text-primary">
                      <Globe className="h-3.5 w-3.5" />
                      <span>View on Google Maps →</span>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
                  <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/5 blur-2xl" />
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card/30 p-4 backdrop-blur-sm"
              >
                <span className="text-xs font-medium text-muted-foreground">Quick links:</span>
                <Link href="/faq" className="text-xs text-primary hover:underline">
                  FAQ
                </Link>
                <span className="text-xs text-border">|</span>
                <Link href="/demo" className="text-xs text-primary hover:underline">
                  Book Demo
                </Link>
                <span className="text-xs text-border">|</span>
                <Link href="/pricing" className="text-xs text-primary hover:underline">
                  Pricing
                </Link>
                <span className="text-xs text-border">|</span>
                <Link href="/support" className="text-xs text-primary hover:underline">
                  Support
                </Link>
              </motion.div>
            </motion.div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export default ContactPage;