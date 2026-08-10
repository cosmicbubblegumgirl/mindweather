import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return {
    name: "MindWeather",
    short_name: "MindWeather",
    description: "Study for the brain you have today.",
    start_url: `${basePath}/station/`,
    display: "standalone",
    background_color: "#0b0919",
    theme_color: "#0b0919",
    icons: [
      { src: `${basePath}/app-icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: `${basePath}/app-icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
