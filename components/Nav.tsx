"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AccessControl, { fetchRunMode, getCachedRunMode, type RunMode } from "./AccessControl";

const links = [
  { href: "/", label: "概览" },
  { href: "/studio", label: "裂变工作台" },
  { href: "/pages", label: "页面说明" },
  { href: "/validation", label: "验证方案" }
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<RunMode>("free");

  // 载入服务器权威模式(所有访客一致);先用本地缓存立即渲染,再用服务器校正
  useEffect(() => {
    setMode(getCachedRunMode());
    fetchRunMode().then(setMode);
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-abyss-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-glow/30 to-magenta-glow/30 shadow-glow">
              <span className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-teal-glow to-magenta-glow animate-pulseGlow" />
            </span>
            <span className="font-display text-lg tracking-wide text-white">
              裂变引擎<span className="ml-1.5 text-xs font-sans text-teal-glow/80">Fission</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-4 py-1.5 text-sm transition ${
                    active
                      ? "bg-white/10 text-white shadow-glow"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setOpen(true)}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition ${
              mode === "byok"
                ? "border-magenta-glow/40 bg-magenta-glow/10 text-magenta-glow hover:bg-magenta-glow/20"
                : "border-teal-glow/40 bg-teal-glow/10 text-teal-glow hover:bg-teal-glow/20"
            }`}
          >
            <span>{mode === "byok" ? "🔑" : "✨"}</span>
            <span>{mode === "byok" ? "填写 API Key" : "免费体验"}</span>
          </button>
        </div>
      </header>
      <AccessControl open={open} onClose={() => setOpen(false)} onChanged={setMode} />
    </>
  );
}
