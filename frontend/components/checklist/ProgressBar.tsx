export default function ProgressBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="h-2 bg-raah-soft rounded-full overflow-hidden">
      <div className="h-full bg-raah-green rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
