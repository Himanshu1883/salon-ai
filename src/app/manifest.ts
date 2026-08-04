import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Go Tix — Salon ERP",
    short_name: "Go Tix",
    description:
      "Appointments, billing, clients, inventory, and staff management for salons.",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAFBFF",
    theme_color: "#7C3AED",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/log.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-mark.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
