"use client";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { useState } from "react";
import { useLang } from "@/lib/LangContext";

export default function AppShell({ children, rightPanel }: { children: React.ReactNode; rightPanel?: React.ReactNode }) {
  const { lang } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBFDFC] flex">
      {/* Sidebar - desktop */}
      <div className="hidden lg:block w-[308px] shrink-0">
        <Sidebar />
      </div>
      {/* Mobile sidebar overlay */}
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
        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around py-2 text-xs">
          <a href="/" className="flex flex-col items-center text-raah-green">Chat</a>
          <a href="/ocr" className="flex flex-col items-center text-text-secondary">Scan</a>
          <a href="/voice" className="flex flex-col items-center text-text-secondary">Voice</a>
          <a href="/checklist" className="flex flex-col items-center text-text-secondary">More</a>
        </div>
      </div>
    </div>
  );
}
