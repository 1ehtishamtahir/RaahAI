import { useState } from "react";
import SourceBadge from "./SourceBadge";
import { feedbackApi } from "@/lib/api";

function renderInline(s: string) {
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
    const bullet = line.match(/^\s*[●\u2022*\-]\s+(.*)/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    const numbered = line.match(/^\s*(?:[\u2460\u2461\u2462\u2463\u2464\u2465\u2466\u2467\u2468\u2469]|\d+\.)\s+(.*)/);
    if (numbered) {
      flushList(i);
      nodes.push(<div key={i} className="flex gap-2 text-[14px] my-1"><span className="text-raah-green">\u2022</span><span>{renderInline(numbered[1])}</span></div>);
      return;
    }
    flushList(i);
    nodes.push(<p key={i} className="my-1 leading-relaxed">{renderInline(line)}</p>);
  });
  flushList(lines.length);
  return <div className="text-[14px] leading-relaxed">{nodes}</div>;
}

export default function AIMessage({ text, time, citations, grounded = true, messageId }: { text: string; time: string; citations?: { title: string; snippet?: string }[]; grounded?: boolean; messageId?: string }) {
  const isFallback = /don't have verified information|\u062a\u0635\u062f\u06cc\u0642 \u0634\u062f\u06c9 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0646\u06c1\u06cc\u0646/i.test(text);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleFeedback(rating: "up" | "down") {
    if (feedback) return;
    setFeedback(rating);
    try {
      await feedbackApi(messageId || Date.now().toString(), rating);
    } catch {}
  }

  function handleCopy() {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => handleFeedback("up")}
            className={`text-sm transition ${feedback === "up" ? "text-raah-green font-bold" : "text-text-muted hover:text-raah-green"}`}
            title="Helpful"
          >
            {feedback === "up" ? "👍" : "👍"}
          </button>
          <button
            onClick={() => handleFeedback("down")}
            className={`text-sm transition ${feedback === "down" ? "text-red-500 font-bold" : "text-text-muted hover:text-red-500"}`}
            title="Not helpful"
          >
            {feedback === "down" ? "👎" : "👎"}
          </button>
          <button
            onClick={handleCopy}
            className="text-sm text-text-muted hover:text-raah-green transition"
            title="Copy"
          >
            {copied ? "✓" : "⧉"}
          </button>
        </div>
      </div>
    </div>
  );
}
