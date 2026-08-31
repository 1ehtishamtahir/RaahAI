"use client";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import DomainSidebar from "./DomainSidebar";
import { useState, Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

const PUBLIC_PATHS = ["/login", "/register"];

const DOMAIN_MAP: Record<string, string> = {
  "/identity": "identity",
  "/vehicle": "vehicle",
  "/challans": "challans",
  "/payments": "payments",
  "/fees": "payments",
  "/documents": "documents",
  "/ocr": "documents",
  "/alerts": "documents",
  "/opportunities": "opportunities",
  "/family": "family",
  "/updates": "updates",
  "/eligibility": "identity",
  "/offices": "identity",
};

function getDomain(pathname: string): string | null {
  for (const [prefix, domain] of Object.entries(DOMAIN_MAP)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return domain;
  }
  return null;
}

export default function AppShell({ children, rightPanel }: { children: React.ReactNode; rightPanel?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isDashboard = pathname === "/dashboard";
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const domain = getDomain(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.push("/login");
    }
  }, [user, loading, isPublic, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFDFC] dark:bg-[#0c1510] flex items-center justify-center">
        <div className="text-sm text-text-muted animate-pulse">Loading RaahAI...</div>
      </div>
    );
  }

  if (!user && !isPublic) {
    return (
      <div className="min-h-screen bg-[#FBFDFC] dark:bg-[#0c1510] flex items-center justify-center">
        <div className="text-sm text-text-muted">Redirecting to login...</div>
      </div>
    );
  }

  // Dashboard: full-width layout with optional right panel
  if (isDashboard) {
    return (
      <div className="min-h-screen bg-[#FBFDFC] dark:bg-[#0c1510] flex flex-col">
        <TopHeader onMenu={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex gap-6 p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
          <main className="flex-1 min-w-0">{children}</main>
          {rightPanel && (
            <aside className="hidden xl:block w-[410px] shrink-0 space-y-4">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    );
  }

  // Domain pages: show domain-specific sidebar
  if (domain) {
    return (
      <div className="min-h-screen bg-[#FBFDFC] dark:bg-[#0c1510] flex">
        <div className="hidden lg:block w-[308px] shrink-0">
          <Suspense fallback={<div className="h-screen w-[308px] bg-white dark:bg-[#111d15] border-r border-border" />}>
            <DomainSidebar domain={domain} />
          </Suspense>
        </div>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="w-[308px] bg-white dark:bg-[#111d15] h-full overflow-y-auto">
              <Suspense fallback={null}>
                <DomainSidebar domain={domain} />
              </Suspense>
            </div>
            <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col">
          <TopHeader onMenu={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex gap-6 p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
            <main className="flex-1 min-w-0">{children}</main>
            {rightPanel && (
              <aside className="hidden xl:block w-[410px] shrink-0 space-y-4">
                {rightPanel}
              </aside>
            )}
          </div>
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111d15] border-t border-border dark:border-[#2a4a35] flex justify-around py-2 text-xs">
            {[
              { href: "/dashboard", label: "Home" },
              { href: "/identity", label: "Identity" },
              { href: "/documents", label: "Docs" },
              { href: "/updates", label: "Updates" },
            ].map((item) => (
              <a key={item.href} href={item.href} className={cn("flex flex-col items-center", pathname === item.href || pathname.startsWith(item.href + "?") ? "text-raah-green font-medium" : "text-text-secondary dark:text-text-muted")}>{item.label}</a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: global sidebar (Chat, History, Settings, etc.)
  return (
    <div className="min-h-screen bg-[#FBFDFC] dark:bg-[#0c1510] flex">
      <div className="hidden lg:block w-[308px] shrink-0">
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-[308px] bg-white dark:bg-[#111d15] h-full overflow-y-auto">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader onMenu={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex gap-6 p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
          <main className="flex-1 min-w-0">{children}</main>
          {rightPanel && (
            <aside className="hidden xl:block w-[410px] shrink-0 space-y-4">
              {rightPanel}
            </aside>
          )}
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111d15] border-t border-border dark:border-[#2a4a35] flex justify-around py-2 text-xs">
            {[
              { href: "/", label: "Chat" },
              { href: "/ocr", label: "Scan" },
              { href: "/voice", label: "Voice" },
              { href: "/dashboard", label: "Home" },
            ].map((item) => (
              <a key={item.href} href={item.href} className={cn("flex flex-col items-center", pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? "text-raah-green font-medium" : "text-text-secondary dark:text-text-muted")}>{item.label}</a>
            ))}
          </div>
      </div>
    </div>
  );
}
