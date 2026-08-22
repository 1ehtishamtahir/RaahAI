export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-border/60 rounded ${className}`} />;
}

export function ChatSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-border" />
      <div className="flex-1 bg-white border border-border rounded-2xl p-4 space-y-3">
        <div className="h-4 bg-border rounded w-1/3" />
        <div className="h-3 bg-raah-soft rounded w-full" />
        <div className="h-3 bg-raah-soft rounded w-5/6" />
        <div className="h-3 bg-raah-soft rounded w-4/6" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-border rounded w-2/3" />
      <div className="h-3 bg-raah-soft rounded w-full" />
      <div className="h-3 bg-raah-soft rounded w-5/6" />
    </div>
  );
}
