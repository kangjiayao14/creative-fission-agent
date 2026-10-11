"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, fileToDataUrl } from "@/lib/client";
import { GENES, Genome, GeneKey, Hypothesis, QaScore, EMPTY_GENOME } from "@/lib/genome";
import GeneChip from "@/components/GeneChip";
import LogConsole, { LogLine } from "@/components/LogConsole";
import { getStoredKey, fetchRunMode } from "@/components/AccessControl";

type Phase = "input" | "sequencing" | "mutating" | "generating" | "done";

interface Card {
  h: Hypothesis;
  imageUrl?: string;
  status: "queued" | "generating" | "qa" | "done" | "rejected";
  qa?: QaScore;
  attempts: number;
}

export default function Studio() {
  const [phase, setPhase] = useState<Phase>("input");
  const [seedImg, setSeedImg] = useState<string>("");
  const [brand, setBrand] = useState("");
  const [product, setProduct] = useState("");
  const [environment, setEnvironment] = useState("信息流");
  const [count, setCount] = useState(4);
  const [aggr, setAggr] = useState(0.5);

  const [genome, setGenome] = useState<Genome>(EMPTY_GENOME);
  const [why, setWhy] = useState("");
  const [winners, setWinners] = useState<GeneKey[]>([]);
  const [summary, setSummary] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [error, setError] = useState("");
  const startTs = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);

  const log = useCallback((level: LogLine["level"], msg: string) => {
    setLogs((p) => [...p, { t: Date.now(), level, msg }]);
  }, []);

  const cost = useMemo(() => {
    // Illustrative cost model (¥). Real numbers depend on your GLM pricing.
    const seq = phase === "input" ? 0 : 0.02;
    const mut = cards.length ? 0.03 : 0;
    const gen = cards.filter((c) => c.imageUrl).length * 0.25;
    const qa = cards.reduce((s, c) => s + c.attempts * 0.02, 0);
    return (seq + mut + gen + qa).toFixed(2);
  }, [cards, phase]);

  async function onFile(f: File) {
    const url = await fileToDataUrl(f);
    setSeedImg(url);
  }

  const canRun = seedImg && phase === "input";

  async function run() {
    if (!seedImg) return;
    // 门控:读取服务器权威模式。仅「访客自带 Key」模式才要求本地 Key;
    // 「免费公开」模式直接放行,由服务器预置的 ZHIPU_API_KEY 承载调用。
    const runMode = await fetchRunMode();
    if (runMode === "byok" && !getStoredKey()) {
      setError("当前为『访客自带 Key』模式,请点右上角『填写 API Key』填入你自己的 GLM Key 后再运行。");
      return;
    }
    setError("");
    setLogs([]);
    setCards([]);
    startTs.current = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTs.current) / 1000)), 1000);

    try {
      // ── Stage 1: Sequencing ────────────────────────────────────────────
      setPhase("sequencing");
      log("info", "任务启动 · 目标环境=" + environment + " · 数量=" + count + " · 激进度=" + aggr.toFixed(2));
      log("model", "调用 GLM-5.3-Flash 读图对原始素材进行基因测序…");
      const seq = await api.sequence(seedImg, brand, product);
      setGenome(seq.genome);
      setWhy(seq.whyItWorks);
      setWinners(seq.winningGenes);
      setSummary(seq.summary);
      log("ok", `测序完成:${seq.summary}。赢家基因 → ${seq.winningGenes.join(", ") || "未标注"}`);

      // ── Stage 2: Mutation ──────────────────────────────────────────────
      setPhase("mutating");
      log("model", "调用 GLM-5.3-Flash 策略官进行定向变异,产出创意假设…");
      const { hypotheses } = await api.mutate({
        genome: seq.genome,
        winningGenes: seq.winningGenes,
        brand,
        product,
        count,
        aggressiveness: aggr,
        environment
      });
      log("ok", `生成 ${hypotheses.length} 条真实差异假设(${hypotheses.filter((h) => h.mode === "explore").length} 探索 / ${hypotheses.filter((h) => h.mode === "exploit").length} 利用)`);
      const initCards: Card[] = hypotheses.map((h) => ({ h, status: "queued", attempts: 0 }));
      setCards(initCards);

      // ── Stage 4+5: Generate + QA loop (per hypothesis) ─────────────────
      setPhase("generating");
      for (let i = 0; i < initCards.length; i++) {
        const h = initCards[i].h;
        setCards((p) => p.map((c, idx) => (idx === i ? { ...c, status: "generating" } : c)));
        log("model", `[${h.id}] glm-image 生成素材:${h.title}(变异 ${h.mutatedGenes.map((g) => g.split("_")[0].toUpperCase()).join("/")})`);
        try {
          const { imageUrl } = await api.generate(h.imagePrompt);
          setCards((p) => p.map((c, idx) => (idx === i ? { ...c, imageUrl, status: "qa" } : c)));
          log("ok", `[${h.id}] 素材生成完成,进入 Loop 质检…`);

          // QA loop with cap
          let attempts = 0;
          let qa: QaScore | undefined;
          const MAX = 2;
          while (attempts < MAX) {
            attempts++;
            log("model", `[${h.id}] GLM-5.3-Flash 创意总监质检(第 ${attempts} 轮)…`);
            qa = await api.qa({ imageUrl, hypothesisTitle: h.title, bet: h.bet, brand });
            setCards((p) => p.map((c, idx) => (idx === i ? { ...c, qa, attempts } : c)));
            if (qa.passed) {
              log("ok", `[${h.id}] 质检通过 ✓ 品牌${qa.brand}/合规${qa.compliance}/质量${qa.quality}/保真${qa.fidelity}/跨模态${qa.crossmodal}`);
              break;
            }
            log("warn", `[${h.id}] 未通过 → 修复批注:${qa.directorNotes.slice(0, 60)}`);
          }
          const passed = qa?.passed;
          setCards((p) => p.map((c, idx) => (idx === i ? { ...c, status: passed ? "done" : "rejected" } : c)));
          if (!passed) log("warn", `[${h.id}] 超过质检轮次上限,标记为淘汰并记录原因(反哺策略官)`);
        } catch (e: any) {
          log("err", `[${h.id}] 生成/质检失败:${e.message}`);
          setCards((p) => p.map((c, idx) => (idx === i ? { ...c, status: "rejected" } : c)));
        }
      }

      log("ok", "本代裂变完成。优质基因将回流为下一代变异先验(进化闭环)。");
      setPhase("done");
    } catch (e: any) {
      setError(e.message);
      log("err", e.message);
      setPhase("input");
    } finally {
      clearInterval(timer);
    }
  }

  function reset() {
    setPhase("input");
    setGenome(EMPTY_GENOME);
    setCards([]);
    setLogs([]);
    setWhy("");
    setWinners([]);
    setSummary("");
    setError("");
  }

  const passedCards = cards.filter((c) => c.status === "done");

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-teal-glow/70">Studio</div>
          <h1 className="font-display text-3xl text-white md:text-4xl">裂变工作台</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            上传一张原始素材 → GLM-5.3-Flash 测序 → GLM-5.3-Flash 定向变异 → glm-image 生成新素材 → Loop 质检。
            全流程真实调用智谱 GLM。默认『免密体验模式』可直接开跑;如切换到『需填 Key 模式』,则需在右上角填入你的 Key。
          </p>
        </div>
        <div className="flex gap-3">
          <Metric label="累计成本(示意)" value={`¥${cost}`} />
          <Metric label="耗时" value={`${elapsed}s`} />
          <Metric label="通过 / 产出" value={`${passedCards.length}/${cards.length}`} />
        </div>
      </div>

      {/* Stepper */}
      <Stepper phase={phase} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* INPUT PANEL */}
          <div className="glass-strong p-6">
            <h2 className="mb-4 font-display text-xl text-white">Stage 0 · 输入 &amp; 目标</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Uploader seedImg={seedImg} onFile={onFile} disabled={phase !== "input"} />
              </div>
              <div className="space-y-3">
                <Field label="品牌"><input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="如:某护肤品牌" className={inputCls} /></Field>
                <Field label="商品"><input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="如:熬夜急救精华" className={inputCls} /></Field>
                <Field label="目标投放环境">
                  <select value={environment} onChange={(e) => setEnvironment(e.target.value)} className={inputCls}>
                    {["信息流", "激励视频", "搜索", "社交种草"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={`裂变数量:${count}`}>
                    <input type="range" min={1} max={8} value={count} onChange={(e) => setCount(+e.target.value)} className="w-full accent-teal-glow" />
                  </Field>
                  <Field label={`探索激进度:${aggr.toFixed(2)}`}>
                    <input type="range" min={0} max={1} step={0.05} value={aggr} onChange={(e) => setAggr(+e.target.value)} className="w-full accent-magenta-glow" />
                  </Field>
                </div>
              </div>
            </div>
            {error && <div className="mt-4 rounded-lg border border-rose-400/40 bg-rose-400/10 px-4 py-2.5 text-sm text-rose-300">{error}</div>}
            <div className="mt-5 flex gap-3">
              <button onClick={run} disabled={!canRun}
                className="rounded-full bg-gradient-to-r from-teal-glow to-magenta-glow px-8 py-3 font-medium text-abyss-950 shadow-glow transition enabled:hover:scale-[1.02] disabled:opacity-40">
                {phase === "input" ? "开始裂变 →" : "运行中…"}
              </button>
              {phase === "done" && <button onClick={reset} className="rounded-full border border-white/15 px-6 py-3 text-white hover:bg-white/5">重新开始</button>}
            </div>
          </div>

          {/* SEQUENCING RESULT */}
          <AnimatePresence>
            {(phase !== "input" || summary) && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong p-6">
                <h2 className="mb-1 font-display text-xl text-white">Stage 1 · 基因测序</h2>
                <p className="mb-4 text-xs text-slate-500">GLM-5.3-Flash 读图把原始素材拆解为 10 个策略基因位,并给出「它为什么有效」的假设。</p>
                {why && (
                  <div className="mb-4 rounded-xl border border-teal-glow/20 bg-teal-glow/5 px-4 py-3 text-sm text-teal-glow">
                    💡 {why}
                  </div>
                )}
                <div className="grid gap-2 sm:grid-cols-2">
                  {GENES.map((g) => (
                    <div key={g.key} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${winners.includes(g.key) ? "border-teal-glow/50 bg-teal-glow/5" : "border-white/10"}`}>
                      <span className="font-mono text-xs text-teal-glow">{g.code}</span>
                      <span className="w-20 shrink-0 text-xs text-slate-400">{g.label}</span>
                      <span className="truncate text-sm text-white">{genome[g.key] || "…"}</span>
                      {winners.includes(g.key) && <span className="ml-auto text-[10px] text-teal-glow">赢家</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HYPOTHESIS / RESULT CARDS */}
          {cards.length > 0 && (
            <div className="glass-strong p-6">
              <h2 className="mb-1 font-display text-xl text-white">Stage 2–5 · 变异假设 → 生成 → 质检</h2>
              <p className="mb-4 text-xs text-slate-500">每张卡是一条真实差异的创意假设:标注被变异的基因、赌点、生成的新素材与质检结果。</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {cards.map((c) => <ResultCard key={c.h.id} card={c} />)}
              </div>
            </div>
          )}
        </div>

        {/* LOG PANEL */}
        <div className="sticky top-20 h-[calc(100vh-6rem)]">
          <LogConsole logs={logs} />
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-abyss-800 px-3 py-2 text-sm text-white outline-none focus:border-teal-glow/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass px-4 py-2 text-right">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-mono text-lg text-white">{value}</div>
    </div>
  );
}

function Uploader({ seedImg, onFile, disabled }: { seedImg: string; onFile: (f: File) => void; disabled: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <span className="mb-1 block text-xs text-slate-400">原始素材(图片)</span>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && !disabled) onFile(f); }}
        className={`relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition ${
          disabled ? "border-white/10 opacity-70" : "border-teal-glow/30 hover:border-teal-glow/60"
        }`}
      >
        {seedImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={seedImg} alt="seed" className="h-full w-full object-cover" />
        ) : (
          <div className="text-center text-slate-500">
            <div className="text-3xl">＋</div>
            <div className="mt-1 text-xs">点击或拖拽上传原始素材</div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

function Stepper({ phase }: { phase: Phase }) {
  const steps: { key: Phase; label: string }[] = [
    { key: "input", label: "输入" },
    { key: "sequencing", label: "测序" },
    { key: "mutating", label: "变异" },
    { key: "generating", label: "生成+质检" },
    { key: "done", label: "完成" }
  ];
  const order = steps.findIndex((s) => s.key === phase);
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition ${
            i < order ? "bg-emerald-400/15 text-emerald-300" : i === order ? "bg-gradient-to-r from-teal-glow/30 to-magenta-glow/30 text-white shadow-glow" : "bg-white/5 text-slate-500"
          }`}>
            <span className="font-mono text-xs">{i + 1}</span>{s.label}
          </div>
          {i < steps.length - 1 && <span className="text-white/20">—</span>}
        </div>
      ))}
    </div>
  );
}

function ResultCard({ card }: { card: Card }) {
  const { h, imageUrl, status, qa } = card;
  const badge = {
    queued: ["排队", "text-slate-400 bg-white/5"],
    generating: ["生成中", "text-teal-glow bg-teal-glow/10"],
    qa: ["质检中", "text-amber-300 bg-amber-400/10"],
    done: ["通过 ✓", "text-emerald-300 bg-emerald-400/10"],
    rejected: ["淘汰", "text-rose-300 bg-rose-400/10"]
  }[status];

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className={`overflow-hidden rounded-xl border ${status === "done" ? "border-emerald-400/30" : status === "rejected" ? "border-rose-400/30" : "border-white/10"} bg-white/[0.02]`}>
      <div className="relative aspect-video bg-abyss-800">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={h.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-glow/30 border-t-teal-glow" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1.5">
          <span className="rounded-full bg-black/50 px-2 py-0.5 font-mono text-[11px] text-white backdrop-blur">{h.id}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] ${h.mode === "explore" ? "bg-magenta-glow/20 text-magenta-glow" : "bg-teal-glow/20 text-teal-glow"}`}>
            {h.mode === "explore" ? "探索" : "利用"}
          </span>
        </div>
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] ${badge[1]}`}>{badge[0]}</span>
      </div>
      <div className="p-4">
        <div className="font-semibold text-white">{h.title}</div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {h.mutatedGenes.map((g) => <GeneChip key={g} gene={g} value={h.genome[g]} highlight />)}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">🎲 {h.bet}</p>
        {qa && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="grid grid-cols-5 gap-1 text-center">
              {([["品牌", qa.brand], ["合规", qa.compliance], ["质量", qa.quality], ["保真", qa.fidelity], ["跨模态", qa.crossmodal]] as [string, number][]).map(([k, v]) => (
                <div key={k}>
                  <div className={`font-mono text-sm ${v >= 70 ? "text-emerald-300" : "text-rose-300"}`}>{v}</div>
                  <div className="text-[9px] text-slate-500">{k}</div>
                </div>
              ))}
            </div>
            {qa.directorNotes && !qa.passed && (
              <p className="mt-2 rounded-lg bg-amber-400/5 px-2.5 py-1.5 text-[11px] text-amber-200/90">🎬 {qa.directorNotes}</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
