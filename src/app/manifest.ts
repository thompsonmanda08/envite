import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "e-nvite — Elegant Digital Invitations",
    short_name: "e-nvite",
    description:
      "Compose distinguished invitations and orchestrate guest RSVPs with intention.",
    id: "/?source=pwa",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait",
    theme_color: "#fafafa",
    background_color: "#fafafa",
    categories: ["productivity", "lifestyle", "social"],
    lang: "en",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Compose event",
        short_name: "New event",
        description: "Begin composing a new gathering",
        url: "/dashboard/events/new",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Open atelier",
        short_name: "Atelier",
        description: "Jump to the dashboard",
        url: "/dashboard",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
