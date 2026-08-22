"use client";
export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-sm">
      <div className="font-medium text-red-700">Unable to process this request</div>
      <div className="text-red-600/80 mt-1 text-xs break-words">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 px-4 py-1.5 bg-white border border-red-200 rounded-full text-xs font-medium hover:bg-red-100">
          Try Again
        </button>
      )}
      <div className="text-[11px] text-text-muted mt-2">If this persists, check <code className="bg-white px-1 rounded border">NEXT_PUBLIC_API_URL</code> and backend <code className="bg-white px-1 rounded border">/health</code>.</div>
    </div>
  );
}
