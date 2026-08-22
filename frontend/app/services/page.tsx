import AppShell from "@/components/layout/AppShell";

const services = [
  { id: "passport", title: "Passport", desc: "New, renewal, lost — DGIP", color: "#087F3E", items: ["New Passport", "Renewal", "Lost Passport"] },
  { id: "cnic", title: "CNIC", desc: "NADRA Smart CNIC services", color: "#3478E5", items: ["New CNIC", "Renewal", "Modification", "Smart CNIC"] },
  { id: "business_registration", title: "Business Registration", desc: "SECP company registration", color: "#6844C7", items: ["Private Limited", "Sole Proprietor", "Name Reservation"] },
];

export default function ServicesPage() {
  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-raah-deep">Popular Services</h1>
        <p className="text-sm text-text-secondary mt-1">Choose a service to get a personalized checklist.</p>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {services.map((s) => (
            <a key={s.id} href={`/checklist?service=${s.id}`} className="border border-border rounded-2xl p-4 hover:border-raah-green/30 hover:bg-raah-soft/30 transition">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: s.color }}>
                {s.id === "passport" ? "🛂" : s.id === "cnic" ? "🪪" : "💼"}
              </div>
              <div className="font-semibold mt-3">{s.title}</div>
              <div className="text-xs text-text-secondary">{s.desc}</div>
              <ul className="mt-3 space-y-1">
                {s.items.map((it) => (
                  <li key={it} className="text-xs text-text-secondary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-raah-green" /> {it}
                  </li>
                ))}
              </ul>
            </a>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
