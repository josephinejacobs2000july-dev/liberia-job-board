import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Liberia Job Board", template: "%s · Liberia Job Board" },
  description: "Find jobs across Liberia's 15 counties, or post a vacancy for free.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#13285e",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@112,600;112,700;112,800&family=Public+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <header className="mast">
          <div className="wrap">
            <Link href="/" className="brand">
              <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
                <rect width="34" height="34" rx="8" fill="#c8202f" />
                <path d="M17 6.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L7 13.7l7.1-.6z" fill="#fff" />
              </svg>
              <div>
                <strong>Liberia Job Board</strong>
                <span>Vacancies from NGOs, government and businesses across the 15 counties</span>
              </div>
            </Link>
            <Nav />
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer>
          <div className="wrap">
            <span>Never pay money to apply for a job. Report any employer who asks for a fee.</span>
            <Link href="/employer">Post a vacancy for free</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
