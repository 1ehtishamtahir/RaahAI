"use client";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import DomainSidebar from "./DomainSidebar";
import { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const isDashboard = pathname === "/dashboard";
  const domain = getDomain(pathname);

  // Dashboard: no sidebar at all (Citizen Command Center standalone)
  if (isDashboard) {
    return (
      <div className="min-h-screen bg-[#FBFDFC] flex flex-col">
        <TopHeader onMenu={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-6">
          <main>{children}</main>
        </div>
      </div>
    );
  }

  // Domain pages: show domain-specific sidebar
  if (domain) {
    return (
      <div className="min-h-screen bg-[#FBFDFC] flex">
        <div className="hidden lg:block w-[308px] shrink-0">
          <Suspense fallback={<div className="h-screen w-[308px] bg-white border-r border-border" />}>
            <DomainSidebar domain={domain} />
          </Suspense>
        </div>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="w-[308px] bg-white h-full overflow-y-auto">
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
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around py-2 text-xs">
            {[
              { href: "/dashboard", label: "Home" },
              { href: "/identity", label: "Identity" },
              { href: "/documents", label: "Docs" },
              { href: "/updates", label: "Updates" },
            ].map((item) => (
              <a key={item.href} href={item.href} className={cn("flex flex-col items-center", pathname === item.href || pathname.startsWith(item.href + "?") ? "text-raah-green font-medium" : "text-text-secondary")}>{item.label}</a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: global sidebar (Chat, History, Settings, etc.)
  return (
    <div className="min-h-screen bg-[#FBFDFC] flex">
      <div className="hidden lg:block w-[308px] shrink-0">
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-[308px] bg-white h-full overflow-y-auto">
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around py-2 text-xs">
            {[
              { href: "/", label: "Chat" },
              { href: "/ocr", label: "Scan" },
              { href: "/voice", label: "Voice" },
              { href: "/dashboard", label: "Home" },
            ].map((item) => (
              <a key={item.href} href={item.href} className={cn("flex flex-col items-center", pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? "text-raah-green font-medium" : "text-text-secondary")}>{item.label}</a>
            ))}
          </div>
      </div>
    </div>
  );
}
