"use client";

import { motion } from "framer-motion";

export default function Validation() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-teal-glow/70">Validation</div>
      <h1 className="font-display text-4xl text-white">验证方案与投入判断</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        四段式验证:离线回测 → 虚拟受众预投放 → 在线 A/B → 预注册 Go/No-Go。每一段都在检验产品的三条成立条件。
      </p>

      {/* Go/No-Go badge */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="glass-strong border-emerald-400/30 p-6 text-center">
          <div className="text-5xl">🟢</div>
          <div className="mt-2 font-display text-2xl text-emerald-300">GO</div>
          <p className="mt-2 text-sm text-slate-400">
            采用命中率提升≥X% 且 新赢家基因数≥2× 且 单采用成本≤人工Y% 且 合规事故=0 且 A/B 显著(p&lt;0.05)
          </p>
        </div>
        <div className="glass-strong border-amber-400/30 p-6 text-center">
          <div className="text-5xl">🟡</div>
          <div className="mt-2 font-display text-2xl text-amber-300">迭代</div>
          <p className="mt-2 text-sm text-slate-400">多样性达标但命中率不足 → 调整 Explore/Exploit 比例与质检阈值,再跑一代</p>
        </div>
        <div className="glass-strong border-rose-400/30 p-6 text-center">
          <div className="text-5xl">🔴</div>
          <div className="mt-2 font-display text-2xl text-rose-300">NO-GO</div>
          <p className="mt-2 text-sm text-slate-400">基因归因常年低 R²(赢家不可复制)或 单位经济长期为负 → 触发证伪条件,喊停</p>
        </div>
      </div>

      {/* Metrics table */}
      <h2 className="mt-14 font-display text-2xl text-white">核心指标 · 对齐成立性三条件</h2>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-4 py-3">指标</th>
              <th className="px-4 py-3">定义</th>
              <th className="px-4 py-3">破除的质疑</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-400">
            {[
              ["采用命中率提升", "(进入投放/被采用素材数 ÷ 产出数) 相对基线的提升", "『只是量多没用』"],
              ["有效多样性 & 新赢家数", "胜出素材覆盖的不同赢家基因组合数", "『换皮式假差异』"],
              ["头部集中度下降", "消耗的 Gini / Top-K 集中度", "直击『采用集中在少数几条』"],
              ["投放表现", "CTR/CVR/ROI/消耗 + 衰退速度", "『外部因素主导、表现不可控』"],
              ["单位经济", "每个被采用素材的生成+质检+试投成本", "『成本太高』"],
              ["人效", "创意人节省工时 / 产物可用率", "『替代不了人』"]
            ].map((r) => (
              <tr key={r[0]}>
                <td className="px-4 py-3 font-medium text-white">{r[0]}</td>
                <td className="px-4 py-3">{r[1]}</td>
                <td className="px-4 py-3 text-teal-glow/80">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Method steps */}
      <h2 className="mt-14 font-display text-2xl text-white">四段式验证方法</h2>
      <div className="mt-6 space-y-4">
        {[
          ["离线回测(最省钱、最先做)", "拿历史『原始素材 + 已知赢家变体』,让 Agent 在不看答案的情况下裂变,看它能否重新发现历史赢家的基因。能复现 ⇒ 成立条件①②成立。"],
          ["虚拟受众预投放", "GLM-5.3-Flash 扮演目标人群『观看』素材,预测相对点击意愿,作为上线前的低成本预筛(并单独验证预测与真实 CTR 的相关性)。"],
          ["在线 A/B(黄金标准)", "同一原始素材、同预算、同定向,三臂对照(Agent / 旧工具 / 人工),看采用率、CTR/CVR/ROI、集中度、衰退曲线,做显著性检验 + 护栏指标(合规=0)。"],
          ["人机协同评估", "创意人对 Agent 产物的『可用率/改动量』打分,验证副驾价值。"]
        ].map(([t, d], i) => (
          <motion.div key={t as string} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass flex gap-4 p-5">
            <span className="font-display text-3xl text-teal-glow/60">{i + 1}</span>
            <div>
              <div className="font-semibold text-white">{t}</div>
              <div className="mt-1 text-sm text-slate-400">{d}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 glass-strong border-teal-glow/20 p-6">
        <h3 className="font-display text-xl text-white">成立性判断框架</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          <b className="text-teal-glow">成立(值得做),当且仅当同时满足:</b><br />
          ① 可搜索性:创意表现差异确实由可结构化的策略变量驱动;<br />
          ② 未开发空间存在:采用集中在少数几条 ⇒ 高绩效空间被严重欠探索;<br />
          ③ 单位经济为正:发现一个新赢家的期望收益 &gt; 生成+质检+试投的成本。<br /><br />
          <b className="text-rose-300">证伪信号(应喊停):</b> 表现由创意之外因素主导 / 赢家是不可复制的孤品 / 单位经济长期为负。
        </p>
      </div>
    </div>
  );
}
