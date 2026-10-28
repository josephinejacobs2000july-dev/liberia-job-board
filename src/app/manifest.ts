import type { MetadataRoute } from "next";

// Lets phones install the job board like an app (Add to Home screen).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Liberia Job Board",
    short_name: "LR Jobs",
    description: "Find jobs across Liberia's 15 counties, or post a vacancy for free.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#13285e",
    theme_color: "#13285e",
    lang: "en",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Find a job", url: "/", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Post a vacancy", url: "/employer/jobs/new", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
