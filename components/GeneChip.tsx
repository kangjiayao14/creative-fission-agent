import { GENES, GeneKey } from "@/lib/genome";

const COLORS: Record<string, string> = {
  G1: "border-teal-glow/40 text-teal-glow bg-teal-glow/10",
  G2: "border-magenta-glow/40 text-magenta-glow bg-magenta-glow/10",
  G3: "border-amber-400/40 text-amber-300 bg-amber-400/10",
  G4: "border-sky-400/40 text-sky-300 bg-sky-400/10",
  G5: "border-rose-400/40 text-rose-300 bg-rose-400/10",
  G6: "border-lime-400/40 text-lime-300 bg-lime-400/10",
  G7: "border-violet-400/40 text-violet-300 bg-violet-400/10",
  G8: "border-cyan-400/40 text-cyan-300 bg-cyan-400/10",
  G9: "border-orange-400/40 text-orange-300 bg-orange-400/10",
  G10: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10"
};

export function GeneChip({ gene, value, highlight }: { gene: GeneKey; value?: string; highlight?: boolean }) {
  const def = GENES.find((g) => g.key === gene);
  if (!def) return null;
  const cls = COLORS[def.code] || "border-white/20 text-slate-300 bg-white/5";
  return (
    <span
      className={`gene-chip ${cls} ${highlight ? "ring-1 ring-white/40 shadow-glow" : ""}`}
      title={`${def.label}${value ? ": " + value : ""}`}
    >
      <span className="font-mono opacity-70">{def.code}</span>
      {value ? <span className="max-w-[120px] truncate">{value}</span> : <span>{def.label}</span>}
    </span>
  );
}

export default GeneChip;
