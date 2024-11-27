import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Fullstack Task Manager",
  description:
    "Task creation, editing, categorization, real-time updates, and collaboration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>
        <div className="min-h-screen">
          <header className="border-b border-[var(--line)] bg-black/20 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div>
                <p className="font-display text-xl tracking-tight text-white">
                  Fullstack Task Manager
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Next.js · React · FastAPI
                </p>
              </div>
              <nav className="flex gap-4 text-sm text-[var(--muted)]">
                <a className="hover:text-white" href="/">
                  Board
                </a>
                <a className="hover:text-white" href="/api/docs" target="_blank" rel="noreferrer">
                  API Docs
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
