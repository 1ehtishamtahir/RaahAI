const SOURCE_LINKS: Record<string, string> = {
  "DGIP Official Website": "https://dgip.gov.pk",
  "NADRA.gov.pk": "https://nadra.gov.pk",
  "SECP Official": "https://secp.gov.pk",
  "Official": "https://dgip.gov.pk",
};

export default function SourceBadge({ title, href, snippet }: { title: string; href?: string; snippet?: string }) {
  const link = href || SOURCE_LINKS[title] || null;
  const content = `${title} ↗`;
  const base = "inline-flex items-center px-3 py-1 rounded-full bg-raah-mint text-raah-deep text-xs font-medium border border-raah-green/20 hover:bg-raah-soft group relative";
  const badge = <span className={base} title={snippet || title}>{content}{snippet && <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-text-primary text-white text-[11px] rounded-lg shadow-lg z-10 leading-snug">{snippet}</span>}</span>;
  if (link) {
    return (
      <a href={link} target="_blank" rel="noreferrer" className={base} title={snippet || title}>
        {content}
        {snippet && <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-text-primary text-white text-[11px] rounded-lg shadow-lg z-10 leading-snug">{snippet}</span>}
      </a>
    );
  }
  return badge;
}
