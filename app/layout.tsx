import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

// Neutral root shell. Deliberately brand-less and with no shared chrome: every
// visible store renders its own header/footer/theme from its StoreConfig, so the
// app never reveals that it serves multiple channels. Default metadata is empty so
// no platform name leaks; each store fully overrides title/description/icons.
export const metadata: Metadata = {
  // Resolves relative OG/icon URLs to absolute ones in production. Set
  // NEXT_PUBLIC_SITE_URL to the deployed domain; falls back to localhost in dev.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name='impact-site-verification' value='6b1c28d5-c1b8-48b2-9227-8fc56afce400' />
      </head>
      <Analytics />
      <body className="min-h-full">{children}
      </body>
    </html>
  );
}
