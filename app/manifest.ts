import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MindWeather",
    short_name: "MindWeather",
    description: "Study for the brain you have today.",
    start_url: "/station",
    display: "standalone",
    background_color: "#0b0919",
    theme_color: "#0b0919",
    icons: [
      { src: "/app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
