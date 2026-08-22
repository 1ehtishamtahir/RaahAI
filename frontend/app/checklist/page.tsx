import AppShell from "@/components/layout/AppShell";
import ChecklistCard from "@/components/checklist/ChecklistCard";

export default function ChecklistPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-border p-6">
          <h1 className="text-xl font-bold text-raah-deep">My Checklist</h1>
          <p className="text-sm text-text-secondary mt-1">Personalized checklists for Passport, CNIC, and Business Registration.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <ChecklistCard service="passport" situation="new" />
          <ChecklistCard service="cnic" situation="renewal" />
          <ChecklistCard service="business_registration" situation="new" />
        </div>
      </div>
    </AppShell>
  );
}
