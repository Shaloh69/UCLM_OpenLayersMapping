import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import AFKModal from "@/components/AFKModal";
import { Providers } from "./providers";

import LoadingAnimation from "@/components/loader";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow zoom for accessibility compliance with WCAG 2.1
  // Users with vision impairments may need to zoom
  maximumScale: 5,
  userScalable: true,
  // Ensure viewport-fit=cover for safe area support on notched devices
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-homebg font-sans antialiased bg-cover bg-no-repeat",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <AFKModal />
            <LoadingAnimation />
            <main className="container mx-auto max-w-7xl flex-grow">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
