export default function UserMessage({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex justify-end gap-2">
      <div className="max-w-[72%] bg-raah-soft border border-raah-mint rounded-2xl rounded-br-md px-4 py-3 text-[14px] leading-relaxed">
        <div className="whitespace-pre-wrap">{text}</div>
        <div className="text-[11px] text-text-muted text-right mt-1">{time} ✓✓</div>
      </div>
      <img src="https://i.pravatar.cc/100?img=12" alt="user" className="w-8 h-8 rounded-full shrink-0" />
    </div>
  );
}
