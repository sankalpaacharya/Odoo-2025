import type { Metadata } from "next";
import "@fontsource/inter";
import "../index.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Odoo-2025",
  description: "Odoo-2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
