"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GENES } from "@/lib/genome";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } })
};

export default function Home() {
  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 md:pt-32">
          <motion.p
            variants={fade} initial="hidden" animate="show"
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-glow/30 bg-teal-glow/5 px-4 py-1.5 text-xs text-teal-glow"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-glow animate-pulseGlow" />
            Powered by Zhipu GLM · GLM-5.3-Flash 测序·策略·质检 / glm-image 生成
          </motion.p>

          <motion.h1
            variants={fade} custom={1} initial="hidden" animate="show"
            className="max-w-4xl font-display text-5xl leading-[1.1] text-white md:text-7xl"
          >
            不是素材<span className="text-slate-500">工厂</span>,<br />
            而是一台<span className="glow-text text-teal-glow">创意达尔文引擎</span>
          </motion.h1>

          <motion.p
            variants={fade} custom={2} initial="hidden" animate="show"
            className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-300"
          >
            现有工具在<b className="text-white">像素层</b>制造差异,而广告的胜负发生在<b className="text-teal-glow">创意策略层</b>。
            我们把一条已验证的原始素材当作『创意基因』,通过
            <b className="text-white"> 测序 → 定向变异 → 质检淘汰 → 投放选择 → 优质基因遗传 </b>
            的进化循环,系统性搜索那片<b className="text-magenta-glow">尚未被发现的高绩效创意空间</b>。
          </motion.p>

          <motion.div
            variants={fade} custom={3} initial="hidden" animate="show"
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/studio"
              className="group relative rounded-full bg-gradient-to-r from-teal-glow to-magenta-glow px-8 py-3.5 font-medium text-abyss-950 shadow-glow transition hover:scale-[1.02]"
            >
              进入裂变工作台 · 真实运行 →
            </Link>
            <Link href="/pages" className="rounded-full border border-white/15 px-8 py-3.5 text-white transition hover:bg-white/5">
              查看全部页面说明
            </Link>
          </motion.div>

          <motion.div
            variants={fade} custom={4} initial="hidden" animate="show"
            className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              ["真实差异", "策略层基因距离,而非像素距离"],
              ["永续进化", "变异-选择-遗传,越用越懂赢家"],
              ["Loop 质检", "AI 创意总监自我改稿,产物敢直接用"],
              ["敢下判断", "预注册 Go / No-Go 证伪条件"]
            ].map(([t, d]) => (
              <div key={t} className="glass p-4">
                <div className="text-sm font-semibold text-white">{t}</div>
                <div className="mt-1 text-xs leading-relaxed text-slate-400">{d}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PROBLEM REFRAME ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle kicker="洞察重构" title="为什么现有工具注定失败" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              q: "“换文案/颜色/背景,采用仍集中在少数几条。”",
              a: "换皮式变异只在表现层打转,说服逻辑没变,受众眼里它们是同一条广告。决定采用的是策略层基因。"
            },
            {
              q: "“同一原始素材,版本表现差异很大。”",
              a: "表现差异其实由可枚举的策略变量(卖点/人群/钩子/机制)驱动 —— 只是没人把它结构化过。"
            },
            {
              q: "“好素材会随时间失去消耗。”",
              a: "这是特定基因在特定环境下的适应度衰减,可预测、可通过『续命裂变』延寿。"
            }
          ].map((c) => (
            <div key={c.q} className="glass p-6">
              <p className="font-display text-lg text-magenta-glow">{c.q}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{c.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 glass-strong border-teal-glow/20 p-6">
          <p className="text-center text-lg leading-relaxed text-white">
            所谓「真实差异」,不是像素距离大,而是<span className="text-teal-glow glow-text">创意假设不同</span>。
            谁能把创意假设结构化、可枚举、可度量、可验证,谁就能系统性覆盖那片被欠探索的高绩效空间。
          </p>
        </div>
      </section>

      {/* ── GENOME ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle kicker="核心资产" title="创意基因组 · 10 个策略基因位" />
        <p className="mt-4 max-w-2xl text-slate-400">
          任意素材被编码为一段结构化基因组。变异发生在这些策略维度上,而不是像素层 ——
          这就是「真实差异」的可计算定义。
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {GENES.map((g, i) => (
            <motion.div
              key={g.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 5) * 0.05 }}
              className="glass p-4 hover:border-teal-glow/40 transition"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-teal-glow">{g.code}</span>
                <span className="text-sm font-semibold text-white">{g.label}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{g.desc}</p>
              <p className="mt-2 text-[11px] text-slate-500">{g.examples.slice(0, 3).join(" · ")}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PIPELINE ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle kicker="运行方式" title="一次 1 → N 裂变的漏斗式流程" />
        <p className="mt-4 max-w-2xl text-slate-400">成本感知漏斗:先便宜后昂贵,先筛掉弱假设,再花钱生成。</p>
        <div className="mt-10 grid gap-3 md:grid-cols-4 lg:grid-cols-7">
          {[
            ["0", "输入 & 目标", "GLM-5.3-Flash 解析 TaskSpec"],
            ["1", "基因测序", "GLM-5.3-Flash 读图拆解"],
            ["2", "定向变异", "策略官产出 N 条假设"],
            ["3", "预演快筛", "关键帧 + 虚拟受众预筛"],
            ["4", "素材生成", "glm-image 出图 / 文案"],
            ["5", "Loop 质检", "GLM-5.3-Flash 评审-修复环"],
            ["6", "结果 & 进化", "谱系 + 基因适应度回流"]
          ].map(([n, t, d], i) => (
            <div key={n} className="relative glass p-4">
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-glow/30 to-magenta-glow/30 font-mono text-sm text-white">
                {n}
              </div>
              <div className="text-sm font-semibold text-white">{t}</div>
              <div className="mt-1 text-xs text-slate-400">{d}</div>
              {i < 6 && <div className="absolute -right-2 top-1/2 hidden text-teal-glow/40 lg:block">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── DIFFERENTIATORS ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle kicker="为什么能拿第一" title="10 个差异化亮点" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            ["创意基因组", "把「真实差异」变成可计算的策略距离,打败一切换皮工具"],
            ["达尔文进化引擎", "变异-选择-遗传的永续闭环,而非一次性 Demo"],
            ["Loop 质检 = AI 创意总监", "自我改稿,产物敢直接投放"],
            ["探索-利用双引擎", "机制性打破「采用集中在少数几条」"],
            ["多环境基因适应度矩阵", "同素材因投放环境而异,吃满加分项"],
            ["因果归因", "基因结构化 → 可做准实验,而非黑盒"],
            ["衰退预测 + 续命裂变", "给赢家延寿,精准解题「素材会衰退」"],
            ["虚拟受众预投放", "花真钱前先做 AI 焦点小组"],
            ["成本感知漏斗 + 实时日志", "又省钱又透明,强可观测性"],
            ["敢给证伪条件的验证", "预注册 Go/No-Go,成熟的产品思维"]
          ].map(([t, d], i) => (
            <div key={t} className="glass flex items-start gap-4 p-5">
              <span className="mt-0.5 font-display text-2xl text-teal-glow/70">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="font-semibold text-white">{t}</div>
                <div className="mt-1 text-sm text-slate-400">{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link
            href="/studio"
            className="rounded-full bg-gradient-to-r from-teal-glow to-magenta-glow px-10 py-4 font-medium text-abyss-950 shadow-glow transition hover:scale-[1.02]"
          >
            立即体验:上传素材,真实裂变 →
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-teal-glow/70">{kicker}</div>
      <h2 className="font-display text-3xl text-white md:text-4xl">{title}</h2>
    </div>
  );
}
