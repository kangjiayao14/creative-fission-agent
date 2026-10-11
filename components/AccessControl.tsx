"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// 访问模式 —— 把「站长切换模式」与「访客填 Key」彻底分开
//
// 站点运行模式(runMode,由站长用服务端密码切换):
//   • free  免费公开模式:任何访客打开即用,无需任何 Key(由站长预置的
//           服务器 ZHIPU_API_KEY 承载全部调用)。→ 给朋友们直接用。
//   • byok  访客自带 Key 模式:每位访客必须填自己的 GLM Key 才能跑任务
//           (Key 只存该访客自己的浏览器)。→ 公开部署、各付各的。
//
// 关键区分:
//   - 切换 runMode 需要【管理密码】,密码只存在服务端环境变量。
//   - 访客填自己的 Key【不需要密码】—— 在 byok 模式下,任何访客都能在
//     一个公开入口里粘贴自己的 Key。这解决了「别人怎么填 key」的问题。
// ─────────────────────────────────────────────────────────────────────────────

export type RunMode = "free" | "byok";

export const KEY_STORAGE = "zhipu_api_key";
// 站长切换模式的本地回退缓存(真正的权威值来自服务器 /api/mode)
const RUN_MODE_CACHE = "fission_run_mode_cache";

// 访客自己的 Key(仅本地浏览器)
export function getStoredKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY_STORAGE) || "";
}
export function setStoredKey(k: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY_STORAGE, k.trim());
}

// 运行模式的本地缓存(用于首屏立即渲染;权威值随后由服务器校正)
export function getCachedRunMode(): RunMode {
  if (typeof window === "undefined") return "byok";
  return window.localStorage.getItem(RUN_MODE_CACHE) === "free" ? "free" : "byok";
}
function cacheRunMode(m: RunMode) {
  if (typeof window !== "undefined") window.localStorage.setItem(RUN_MODE_CACHE, m);
}

// 从服务器读取权威运行模式(所有访客一致)
export async function fetchRunMode(): Promise<RunMode> {
  try {
    const r = await fetch("/api/mode", { cache: "no-store" });
    const d = await r.json();
    const m: RunMode = d?.mode === "free" ? "free" : "byok";
    cacheRunMode(m);
    return m;
  } catch {
    return getCachedRunMode();
  }
}

export default function AccessControl({
  open,
  onClose,
  onChanged
}: {
  open: boolean;
  onClose: () => void;
  onChanged?: (mode: RunMode) => void;
}) {
  const [mode, setMode] = useState<RunMode>("byok");
  const [keyVal, setKeyVal] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  // 站长切换区(需密码)
  const [showAdmin, setShowAdmin] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdErr, setPwdErr] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [adminTip, setAdminTip] = useState("");

  useEffect(() => {
    if (open) {
      setKeyVal(getStoredKey());
      setKeySaved(false);
      setShowAdmin(false);
      setUnlocked(false);
      setPwd("");
      setPwdErr(false);
      setVerifying(false);
      setAdminTip("");
      setMode(getCachedRunMode());
      fetchRunMode().then(setMode);
    }
  }, [open]);

  function saveKey() {
    setStoredKey(keyVal);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  }

  async function tryUnlock() {
    setVerifying(true);
    try {
      const r = await fetch("/api/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", password: pwd })
      });
      if (!r.ok) {
        setPwdErr(true);
        return;
      }
      setUnlocked(true);
      setPwdErr(false);
    } catch {
      setPwdErr(true);
    } finally {
      setVerifying(false);
    }
  }

// 站长切换模式:写入当前服务器实例,需带服务端密码。
  async function switchMode(next: RunMode) {
    setSwitching(true);
    setAdminTip("");
    try {
      const r = await fetch("/api/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: next, password: pwd })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "切换失败");
      const m: RunMode = d?.mode === "free" ? "free" : "byok";
      setMode(m);
      cacheRunMode(m);
      onChanged?.(m);
      setAdminTip(
        m === "free"
          ? "当前实例已切换为『免费公开模式』。持久默认值请配置 SITE_RUN_MODE。"
          : "当前实例已切换为『访客自带 Key 模式』。持久默认值请配置 SITE_RUN_MODE。"
      );
    } catch (e: any) {
      setAdminTip("切换失败:" + (e?.message || "未知错误"));
    } finally {
      setSwitching(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-strong max-h-[88vh] w-full max-w-lg overflow-y-auto p-6"
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 当前站点模式 */}
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-white">访问设置</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  mode === "free" ? "bg-teal-glow/15 text-teal-glow" : "bg-magenta-glow/15 text-magenta-glow"
                }`}
              >
                当前:{mode === "free" ? "免费公开" : "访客自带 Key"}
              </span>
            </div>

            {/* ── 访客区:随模式呈现,无需密码 ─────────────────── */}
            {mode === "free" ? (
              <div className="mt-4 rounded-xl border border-teal-glow/25 bg-teal-glow/5 p-4">
                <div className="flex items-center gap-2 text-teal-glow">
                  <span>✨</span>
                  <span className="font-medium">免费公开模式已开启</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  你可以直接开始使用,<b>无需填写任何 API Key</b> —— 所有 GLM 调用由站长预置的额度承载。
                  去「裂变工作台」上传一张素材即可跑通全流程。
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-magenta-glow/25 bg-magenta-glow/5 p-4">
                <div className="flex items-center gap-2 text-magenta-glow">
                  <span>🔑</span>
                  <span className="font-medium">请填写你自己的 GLM API Key</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  当前站点为「访客自带 Key」模式。填入你自己的智谱 Key 即可跑任务,Key 只保存在
                  <b>你自己的浏览器</b>;调用时通过 HTTPS 随单次请求发送给本站 API 代理,
                  服务端不会把它写入数据库或日志。
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="password"
                    value={keyVal}
                    onChange={(e) => setKeyVal(e.target.value)}
                    placeholder="粘贴你的 Key,例如 xxxxx.xxxxxx"
                    className="w-full rounded-lg border border-white/15 bg-abyss-800 px-3 py-2.5 text-sm text-white outline-none focus:border-magenta-glow/60"
                  />
                  <button
                    onClick={saveKey}
                    className="shrink-0 rounded-lg bg-gradient-to-r from-teal-glow to-magenta-glow px-5 text-sm font-medium text-abyss-950"
                  >
                    {keySaved ? "已保存 ✓" : "保存"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  在{" "}
                  <a className="text-teal-glow underline" href="https://open.bigmodel.cn/" target="_blank" rel="noreferrer">
                    open.bigmodel.cn
                  </a>{" "}
                  免费注册获取 Key。
                </p>
              </div>
            )}

            {/* ── 站长区:折叠,需密码切换模式 ─────────────────── */}
            <div className="mt-5 border-t border-white/10 pt-4">
              {!showAdmin ? (
                <button
                  onClick={() => setShowAdmin(true)}
                  className="text-xs text-slate-500 transition hover:text-slate-300"
                >
                  🔐 我是站长 · 切换网站模式
                </button>
              ) : (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                    <span>🔐</span>
                    <span>站长控制台</span>
                    <span className="text-xs text-slate-500">(当前实例即时生效)</span>
                  </div>

                  {!unlocked ? (
                    <motion.div animate={pwdErr ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={pwd}
                          autoFocus
                          onChange={(e) => {
                            setPwd(e.target.value);
                            setPwdErr(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void tryUnlock();
                          }}
                          placeholder="输入管理密码"
                          className={`w-full rounded-lg border bg-abyss-800 px-3 py-2.5 text-sm text-white outline-none ${
                            pwdErr ? "border-rose-400/70" : "border-white/15 focus:border-teal-glow/60"
                          }`}
                        />
                        <button
                          onClick={() => void tryUnlock()}
                          disabled={verifying || !pwd.trim()}
                          className="shrink-0 rounded-lg border border-teal-glow/40 bg-teal-glow/10 px-4 text-sm text-teal-glow hover:bg-teal-glow/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {verifying ? "验证中…" : "解锁"}
                        </button>
                      </div>
                      {pwdErr && <p className="mt-2 text-xs text-rose-300">密码不正确,请重试。</p>}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <ModeCard
                        active={mode === "free"}
                        accent="teal"
                        title="免费公开模式"
                        desc="任何访客打开即用,无需填 Key。适合分享给朋友们直接体验。"
                        disabled={switching}
                        onClick={() => switchMode("free")}
                      />
                      <ModeCard
                        active={mode === "byok"}
                        accent="magenta"
                        title="访客自带 Key 模式"
                        desc="每位访客需填自己的 GLM Key 才能跑任务。适合公开部署、各用各的额度。"
                        disabled={switching}
                        onClick={() => switchMode("byok")}
                      />
                      {adminTip && (
                        <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">
                          {adminTip}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button onClick={onClose} className="rounded-full border border-white/15 px-6 py-2 text-sm text-white hover:bg-white/5">
                完成
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModeCard({
  active,
  accent,
  title,
  desc,
  disabled,
  onClick
}: {
  active: boolean;
  accent: "teal" | "magenta";
  title: string;
  desc: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const ring = active
    ? accent === "teal"
      ? "border-teal-glow/60 bg-teal-glow/10"
      : "border-magenta-glow/60 bg-magenta-glow/10"
    : "border-white/10 bg-white/[0.02] hover:border-white/25";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl border p-3.5 text-left transition disabled:opacity-50 ${ring}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{title}</span>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
            active
              ? accent === "teal"
                ? "border-teal-glow bg-teal-glow text-abyss-950"
                : "border-magenta-glow bg-magenta-glow text-abyss-950"
              : "border-white/30"
          }`}
        >
          {active && <span className="text-[11px]">✓</span>}
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">{desc}</p>
    </button>
  );
}
