import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import "./calendar.css";

export const metadata: Metadata = {
  title: {
    default: "MindWeather — Study for the brain you have today",
    template: "%s · MindWeather",
  },
  description: "A calm, adaptive study environment that reshapes the plan around the capacity you have today.",
  applicationName: "MindWeather",
  themeColor: "#0b0919",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/app-icon.svg",
  },
};

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
