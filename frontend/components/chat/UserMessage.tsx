export default function UserMessage({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex justify-end gap-2">
      <div className="max-w-[72%] bg-raah-soft border border-raah-mint rounded-2xl rounded-br-md px-4 py-3 text-[14px] leading-relaxed">
        <div className="whitespace-pre-wrap">{text}</div>
        <div className="text-[11px] text-text-muted text-right mt-1">{time} ✓✓</div>
      </div>
      <div className="w-8 h-8 rounded-full bg-raah-green/10 border border-raah-green/20 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-raah-green">U</span>
      </div>
    </div>
  );
}
