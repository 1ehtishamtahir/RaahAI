"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Shield, Car, AlertTriangle, CreditCard, FileText, GraduationCap, Users, Radar, ScanLine, ListChecks, Wallet, Building2, Calculator, ClipboardCheck, ArrowLeft, Globe, Baby, Heart, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/LangContext";

const DOMAIN_CONFIG: Record<string, { title_en: string; title_ur: string; icon: any; items: { href: string; label: string; icon: any; children?: { href: string; label: string }[] }[] }> = {
  identity: {
    title_en: "Identity",
    title_ur: "شناخت",
    icon: Shield,
    items: [
      { href: "/identity", label: "Overview", icon: LayoutDashboard },
      { href: "/identity?svc=cnic", label: "CNIC", icon: Shield, children: [
        { href: "/identity?svc=cnic&sub=new", label: "New CNIC" },
        { href: "/identity?svc=cnic&sub=renewal", label: "CNIC Renewal" },
        { href: "/identity?svc=cnic&sub=modification", label: "CNIC Modification" },
        { href: "/identity?svc=cnic&sub=status", label: "Track Status" },
      ]},
      { href: "/identity?svc=passport", label: "Passport", icon: Shield, children: [
        { href: "/identity?svc=passport&sub=new", label: "New Passport" },
        { href: "/identity?svc=passport&sub=renewal", label: "Passport Renewal" },
        { href: "/identity?svc=passport&sub=status", label: "Track Status" },
      ]},
      { href: "/identity?svc=frc", label: "FRC", icon: FileText },
      { href: "/identity?svc=birth_registration", label: "Birth Registration", icon: Baby },
      { href: "/identity?svc=marriage_registration", label: "Marriage Registration", icon: Heart },
      { href: "/identity?svc=death_registration", label: "Death Registration", icon: Skull },
    ],
  },
  vehicle: {
    title_en: "Vehicle",
    title_ur: "گاڑی",
    icon: Car,
    items: [
      { href: "/vehicle", label: "Overview", icon: LayoutDashboard },
      { href: "/vehicle?svc=registration", label: "Vehicle Registration", icon: Car },
      { href: "/vehicle?svc=transfer", label: "Ownership Transfer", icon: Car },
      { href: "/vehicle?svc=token_tax", label: "Token Tax", icon: Calculator },
    ],
  },
  challans: {
    title_en: "Challans",
    title_ur: "چالان",
    icon: AlertTriangle,
    items: [
      { href: "/challans", label: "Challan Details", icon: FileText },
    ],
  },
  payments: {
    title_en: "Gov Payments",
    title_ur: "سرکاری ادائیگیاں",
    icon: CreditCard,
    items: [
      { href: "/payments?type=Fee", label: "Fees", icon: CreditCard },
      { href: "/payments?type=Tax", label: "Taxes", icon: Calculator },
      { href: "/payments", label: "Payment Timeline", icon: CreditCard },
      { href: "/fees", label: "Fee Calculator", icon: Calculator },
    ],
  },
  documents: {
    title_en: "Documents",
    title_ur: "دستاویزات",
    icon: FileText,
    items: [
      { href: "/ocr", label: "Document Scanner", icon: ScanLine },
      { href: "/documents", label: "Document Explainer", icon: FileText },
      { href: "/alerts", label: "My Documents (Wallet)", icon: Wallet },
      { href: "/checklist", label: "Dynamic Checklist", icon: ListChecks },
    ],
  },
  opportunities: {
    title_en: "Opportunities",
    title_ur: "مواقع",
    icon: GraduationCap,
    items: [
      { href: "/opportunities?cat=Scholarships", label: "Scholarships", icon: GraduationCap },
      { href: "/opportunities?cat=Student Programs", label: "Student Programs", icon: GraduationCap },
      { href: "/opportunities?cat=Youth Programs", label: "Youth Programs", icon: GraduationCap },
    ],
  },
  family: {
    title_en: "Family Programs",
    title_ur: "فیملی پروگرام",
    icon: Users,
    items: [
      { href: "/family#profile", label: "Household Profile", icon: Users },
      { href: "/family#programs", label: "Program Matching", icon: Users },
      { href: "/eligibility", label: "Eligibility Check", icon: ClipboardCheck },
    ],
  },
  updates: {
    title_en: "Gov Updates",
    title_ur: "سرکاری اپ ڈیٹس",
    icon: Radar,
    items: [
      { href: "/updates", label: "Government Radar", icon: Radar },
      { href: "/updates?cat=Identity", label: "Identity", icon: Shield },
      { href: "/updates?cat=Youth", label: "Youth", icon: GraduationCap },
      { href: "/updates?cat=Tax", label: "Tax", icon: Calculator },
      { href: "/updates?cat=Transport", label: "Transport", icon: Car },
      { href: "/updates?cat=Employment", label: "Employment", icon: Building2 },
      { href: "/updates?cat=Education", label: "Education", icon: GraduationCap },
      { href: "/updates?cat=Welfare", label: "Welfare", icon: Heart },
      { href: "/updates?cat=Business", label: "Business", icon: CreditCard },
      { href: "/updates?cat=Family", label: "Family", icon: Users },
    ],
  },
};

export default function DomainSidebar({ domain }: { domain: string }) {
  const { lang, setLang } = useLang();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cfg = DOMAIN_CONFIG[domain];
  if (!cfg) return null;
  const TitleIcon = cfg.icon;
  const title = lang === "ur" ? cfg.title_ur : cfg.title_en;

  return (
    <div className="h-screen sticky top-0 flex flex-col bg-white border-r border-border p-4">
      {/* Back to Dashboard */}
      <Link href="/dashboard" className="flex items-center gap-2 text-xs text-text-secondary hover:text-raah-green mb-3">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Domain Header */}
      <div className="flex items-center gap-3 px-2 py-3 bg-raah-mint rounded-xl border border-raah-green/20 mb-2">
        <div className="w-9 h-9 rounded-xl bg-raah-green text-white flex items-center justify-center">
          <TitleIcon size={18} />
        </div>
        <div>
          <div className="font-bold text-raah-deep text-sm leading-none">{title}</div>
          <div className="text-[11px] text-text-secondary">Mission Mode</div>
        </div>
      </div>

      {/* Items */}
      <nav className="flex-1 space-y-1 mt-2 overflow-y-auto">
        {cfg.items.map((item) => {
          const svc = searchParams.get("svc");
          const sub = searchParams.get("sub");
          const cat = searchParams.get("cat");
          const status = searchParams.get("status");
          let active = false;
          const svcVal = item.href.includes("svc=") ? item.href.split("svc=")[1].split("&")[0] : null;
          if (svcVal) {
            active = svc === svcVal;
          } else if (item.href.includes("cat=")) {
            active = cat === item.href.split("cat=")[1];
          } else if (item.href.includes("status=")) {
            active = status === item.href.split("status=")[1];
          } else if (item.href.includes("#")) {
            active = false;
          } else {
            const base = item.href.split("?")[0].split("#")[0];
            const type = searchParams.get("type");
            if (domain === "challans" && base === "/challans") {
              active = pathname === base;
            } else if (base === "/identity" || base === "/vehicle") {
              active = pathname === base && !svc;
            } else {
              active = pathname === base && !svc && !cat && !status && !type;
            }
          }
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition",
                  active ? "bg-raah-mint text-raah-deep border border-raah-green/20" : "text-text-secondary hover:bg-raah-soft hover:text-text-primary"
                )}
              >
                <item.icon size={16} className={cn(active ? "text-raah-green" : "text-text-muted")} />
                <span className="flex-1">{item.label}</span>
                {active && <span className="text-raah-green">›</span>}
              </Link>
              {active && (item as any).children && (
                <div className="ml-6 mt-1 space-y-1 border-l border-border pl-3">
                  {(item as any).children.map((child: any) => {
                    const childSub = child.href.split("sub=")[1];
                    const childActive = sub === childSub;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-3 py-1.5 rounded-lg text-xs transition",
                          childActive ? "bg-raah-green text-white font-medium" : "text-text-secondary hover:bg-raah-soft hover:text-text-primary"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Language */}
      <div className="mt-3 p-3 rounded-xl border border-border bg-raah-soft">
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
          <Globe size={14} /> Language
        </div>
        <div className="flex rounded-full bg-white border border-border p-1">
          <button
            onClick={() => setLang("ur")}
            className={cn("flex-1 py-1.5 rounded-full text-sm font-medium", lang === "ur" ? "bg-raah-mint text-raah-deep border border-raah-green/20" : "text-text-secondary")}
          >
            اردو
          </button>
          <button
            onClick={() => setLang("en")}
            className={cn("flex-1 py-1.5 rounded-full text-sm font-medium", lang === "en" ? "bg-raah-mint text-raah-deep border border-raah-green/20" : "text-text-secondary")}
          >
            English
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-border">
        <img src="https://i.pravatar.cc/100?img=12" alt="avatar" className="w-8 h-8 rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">Ehtisham Tahir</div>
          <div className="text-xs text-text-muted">Citizen • Free Plan</div>
        </div>
        <span className="text-text-muted">⌄</span>
      </div>
    </div>
  );
}
