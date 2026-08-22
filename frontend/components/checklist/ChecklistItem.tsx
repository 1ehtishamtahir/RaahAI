export default function ChecklistItem({ label, completed }: { label: string; completed: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={completed} readOnly className="w-4 h-4 rounded border-border text-raah-green focus:ring-raah-green" />
      <span className={completed ? "line-through text-text-muted" : "text-text-primary"}>{label}</span>
    </label>
  );
}
