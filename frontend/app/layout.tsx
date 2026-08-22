import "../styles/globals.css";
import type { Metadata } from "next";
import { LangProvider } from "@/lib/LangContext";

export const metadata: Metadata = {
  title: "RaahAI — Your Smart Guide to Government Services",
  description: "AI-powered assistant for Pakistani government services: Passport, CNIC, Business Registration. Urdu & English.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;600&family=Noto+Sans:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
