import SourceBadge from "./SourceBadge";

function renderInline(s: string) {
  // handle **bold** and *italic* without external dep
  const parts: React.ReactNode[] = [];
  let last = 0;
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    if (m[1]) parts.push(<strong key={idx++} className="font-semibold text-raah-deep">{m[1]}</strong>);
    else if (m[2]) parts.push(<em key={idx++}>{m[2]}</em>);
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts.length ? parts : s;
}

function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let list: string[] = [];
  const flushList = (k: number) => {
    if (list.length) {
      nodes.push(
        <ul key={`ul-${k}`} className="list-disc pl-5 my-2 space-y-1">
          {list.map((it, i) => (
            <li key={i} className="leading-relaxed">{renderInline(it)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList(i);
      nodes.push(<div key={`sp-${i}`} className="h-2" />);
      return;
    }
    // headings ### / ## / #
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);
    if (h3) {
      flushList(i);
      nodes.push(<div key={i} className="font-semibold text-[14px] text-raah-deep mt-3 mb-1">{renderInline(h3[1])}</div>);
      return;
    }
    if (h2) {
      flushList(i);
      nodes.push(<div key={i} className="font-bold text-[15px] text-raah-deep mt-3 mb-1">{renderInline(h2[1])}</div>);
      return;
    }
    if (h1) {
      flushList(i);
      nodes.push(<div key={i} className="font-bold text-[16px] text-raah-deep mt-3 mb-1">{renderInline(h1[1])}</div>);
      return;
    }
    // bullets: ● * - •
    const bullet = line.match(/^\s*[●•*\-]\s+(.*)/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    // numbered: ① ② or 1. 2.
    const numbered = line.match(/^\s*(?:[①②③④⑤⑥⑦⑧⑨⑩]|\d+\.)\s+(.*)/);
    if (numbered) {
      flushList(i);
      nodes.push(<div key={i} className="flex gap-2 text-[14px] my-1"><span className="text-raah-green">•</span><span>{renderInline(numbered[1])}</span></div>);
      return;
    }
    flushList(i);
    nodes.push(<p key={i} className="my-1 leading-relaxed">{renderInline(line)}</p>);
  });
  flushList(lines.length);
  return <div className="text-[14px] leading-relaxed">{nodes}</div>;
}

export default function AIMessage({ text, time, citations, grounded = true }: { text: string; time: string; citations?: { title: string; snippet?: string }[]; grounded?: boolean }) {
  const isFallback = /don't have verified information|تصدیق شدہ معلومات نہیں/i.test(text);
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-raah-green text-white flex items-center justify-center text-xs font-bold shrink-0">R</div>
      <div className="flex-1 bg-white border border-border rounded-2xl rounded-bl-md p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-text-muted mb-2">
          <span className="font-semibold text-raah-deep flex items-center gap-1">RaahAI <span className="text-raah-success">✓</span></span>
          <span>{time}</span>
        </div>
        <Markdown text={text} />

        {citations && citations.length > 0 && grounded !== false && !isFallback && (
          <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2">
            <span className="text-xs text-text-secondary">Source:</span>
            {Array.from(new Map(citations.map((c) => [c.title, c] as const)).values()).map((c, i) => (
              <SourceBadge key={i} title={c.title} snippet={c.snippet} />
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3 text-text-muted">
          <button className="hover:text-raah-green text-sm" title="Like">♡</button>
          <button className="hover:text-raah-green text-sm" title="Dislike">👎</button>
          <button className="hover:text-raah-green text-sm" title="Copy" onClick={() => navigator.clipboard?.writeText(text)}>⧉</button>
        </div>
      </div>
    </div>
  );
}
