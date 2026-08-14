import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";
import "./calendar.css";
import "./calm.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  metadataBase: new URL("https://mymindweather.study"),
  title: {
    default: "MindWeather — Study for the brain you have today",
    template: "%s · MindWeather",
  },
  description: "A calm, adaptive study environment that reshapes the plan around the capacity you have today.",
  applicationName: "MindWeather",
  authors: [{ name: "Simoné Govender" }],
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
    apple: `${basePath}/app-icon.svg`,
  },
};

export const viewport: Viewport = { themeColor: "#0b0919" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
