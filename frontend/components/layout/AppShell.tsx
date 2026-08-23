"use client";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import DomainSidebar from "./DomainSidebar";
import { useState, Suspense } from "react";
import { usePathname } from "next/navigation";

const DOMAIN_MAP: Record<string, string> = {
  "/identity": "identity",
  "/vehicle": "vehicle",
  "/challans": "challans",
  "/payments": "payments",
  "/fees": "payments",
  "/documents": "documents",
  "/ocr": "documents",
  "/opportunities": "opportunities",
  "/family": "family",
  "/updates": "updates",
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
            <a href="/dashboard" className="flex flex-col items-center text-text-secondary">Home</a>
            <a href="/identity" className="flex flex-col items-center text-text-secondary">Identity</a>
            <a href="/documents" className="flex flex-col items-center text-text-secondary">Docs</a>
            <a href="/updates" className="flex flex-col items-center text-text-secondary">Updates</a>
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
          <a href="/" className="flex flex-col items-center text-raah-green">Chat</a>
          <a href="/ocr" className="flex flex-col items-center text-text-secondary">Scan</a>
          <a href="/voice" className="flex flex-col items-center text-text-secondary">Voice</a>
          <a href="/dashboard" className="flex flex-col items-center text-text-secondary">Home</a>
        </div>
      </div>
    </div>
  );
}
