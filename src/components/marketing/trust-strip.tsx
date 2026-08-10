export type TrustStripItem = { value: string; label: string };

/** A slim band of big-numeral stats/credibility markers — used right under a hero for immediate context. */
export function TrustStrip({ items }: { items: TrustStripItem[] }) {
  return (
    <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1.5 px-6 py-8 text-center">
          <span className="font-display text-3xl font-semibold text-foreground sm:text-4xl">{item.value}</span>
          <span className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
