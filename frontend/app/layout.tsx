import "leaflet/dist/leaflet.css";
import type { Metadata } from "next";
import "./globals.css";

import { I18nProvider } from "../i18n/provider";

export const metadata: Metadata = {
  title: "SafeRoute AI",
  description: "AI-powered safe route prediction system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
