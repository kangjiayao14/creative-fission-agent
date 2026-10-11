"use client";

import { useEffect, useRef } from "react";

export interface LogLine {
  t: number;
  level: "info" | "model" | "ok" | "warn" | "err";
  msg: string;
}

const DOT: Record<string, string> = {
  info: "bg-slate-400",
  model: "bg-teal-glow",
  ok: "bg-emerald-400",
  warn: "bg-amber-400",
  err: "bg-rose-400"
};

export default function LogConsole({ logs }: { logs: LogLine[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  return (
    <div className="glass-strong flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-glow animate-pulseGlow" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">实时日志 · Agent Stream</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">{logs.length} events</span>
      </div>
      <div ref={ref} className="log-scroll flex-1 space-y-1.5 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed">
        {logs.length === 0 && <div className="text-slate-600">等待任务启动…</div>}
        {logs.map((l, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[l.level]}`} />
            <span className="shrink-0 text-slate-600">
              {new Date(l.t).toLocaleTimeString("zh-CN", { hour12: false })}
            </span>
            <span className={l.level === "err" ? "text-rose-300" : l.level === "ok" ? "text-emerald-300" : l.level === "model" ? "text-teal-glow" : l.level === "warn" ? "text-amber-300" : "text-slate-300"}>
              {l.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
