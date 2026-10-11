"use client";

import { motion } from "framer-motion";

interface PageSpec {
  no: string;
  name: string;
  purpose: string;
  interactions: string[];
  prompt: string; // AI image prompt (URL-encoded at render)
}

const PAGES: PageSpec[] = [
  {
    no: "01",
    name: "新建裂变任务 · Task Creation",
    purpose: "上传一条原始素材,配置品牌/商品/目标环境/裂变数量/探索激进度,一键启动。",
    interactions: [
      "左侧拖拽上传原始素材,自动读取尺寸/格式",
      "右侧填写品牌、商品、制作要求",
      "三个关键控件:目标环境(信息流/激励/搜索)、裂变数量、探索激进度滑杆",
      "顶部步骤条:测序→变异→生成→质检→结果,点『开始裂变』进入工作台"
    ],
    prompt:
      "modern dark mode SaaS dashboard UI mockup, AI ad creative platform, new task creation screen, upload one original ad image thumbnail on the left, brand and product goal input fields on the right, a large primary button start fission, top step wizard, editorial magazine layout, generous white space, glassmorphism panels, bioluminescent teal and magenta accents, deep navy background, clean sans-serif typography, soft glow, high end product design, ultra detailed, 4k"
  },
  {
    no: "02",
    name: "基因测序视图 · Gene Sequencing",
    purpose: "GLM-5.3-Flash 读图把原始素材拆解为发光的 DNA 双螺旋,10 个策略基因位逐一可视化。",
    interactions: [
      "中央 DNA 双螺旋,每个基因位是可点击的荧光片段,悬停高亮展开判定依据",
      "右侧雷达图展示基因强度分布",
      "底部胶片条对齐分镜/关键帧,点某帧联动高亮承载的基因",
      "顶部一句 GLM 生成的『它为什么有效』假设,赢家基因高亮"
    ],
    prompt:
      "modern dark mode SaaS dashboard UI mockup, creative genome sequencing screen, one ad decomposed into a glowing DNA double helix strand of ten labeled gene segments such as selling point audience hook emotion scene narrative, a radar chart on the right, a keyframe filmstrip along the bottom, editorial magazine layout, glassmorphism panels, bioluminescent teal and magenta accents, deep navy background, clean sans-serif typography, soft glow, ultra detailed, 4k"
  },
  {
    no: "03",
    name: "裂变策略谱系图 · Fission Strategy Map",
    purpose: "核心页 —— 直接呈现『原始素材 ↔ 裂变结果』的关系:一个中心节点辐射出多条创意假设。",
    interactions: [
      "中心节点=原始素材,向外辐射创意假设节点",
      "连线颜色区分 利用(青)/探索(品红)",
      "每个子节点显示被变异的基因标签 + 一句『赌的理由』",
      "点连线查看父子基因 diff,右下角 minimap 导航"
    ],
    prompt:
      "modern dark mode SaaS dashboard UI mockup, fission strategy pedigree map, a node graph tree branching from one central original node into many child creative variant nodes connected by glowing curved lines, each node is a small ad thumbnail card with small gene tag chips, react-flow canvas style, minimap at corner, editorial magazine layout, glassmorphism, bioluminescent teal and magenta accents, deep navy background, clean typography, soft glow, ultra detailed, 4k"
  },
  {
    no: "04",
    name: "生成工作台 + 实时日志 · Workbench",
    purpose: "素材并行生成,右侧悬浮实时日志面板逐条打印每个 Agent 事件与模型调用。",
    interactions: [
      "左侧素材卡实时进度环:脚本→关键帧→生成→剪辑→质检",
      "右侧 SSE 实时日志流,每行带模型名、耗时、Token/成本",
      "顶部累计成本 & 时间计数器,体现漏斗式成本感知",
      "可随时暂停/否决某条,人在环路"
    ],
    prompt:
      "modern dark mode SaaS dashboard UI mockup, AI generation workbench, a grid of ad creative cards rendering with circular progress rings, a floating real time log console panel on the right streaming agent events and model calls with colored status dots, cost and time counters on top, editorial magazine layout, glassmorphism, bioluminescent teal and magenta accents, deep navy background, clean typography, soft glow, ultra detailed, 4k"
  },
  {
    no: "05",
    name: "Loop 质检闭环 · QA Loop",
    purpose: "GLM-5.3-Flash 扮演 AI 创意总监,五维打分 + 可执行的定向修复批注,生成-评审-修复成环。",
    interactions: [
      "左侧素材预览,中间『生成-评审-修复』环形图 + 迭代计数",
      "右侧五维评分条:品牌/合规/质量/创意保真度/跨模态一致",
      "创意总监批注是可执行指令(如把钩子改成强反差冷开场)",
      "通过阈值亮绿,超限淘汰亮红并给原因(反哺策略官)"
    ],
    prompt:
      "modern dark mode SaaS dashboard UI mockup, quality inspection loop screen, one ad creative preview on left, a scorecard panel with five bars brand compliance visual quality creative fidelity cross modal, a circular generate critique repair cycle diagram with iteration counter in the center, director feedback notes on right, editorial magazine layout, glassmorphism, bioluminescent teal and magenta accents, deep navy background, clean typography, soft glow, ultra detailed, 4k"
  },
  {
    no: "06",
    name: "裂变结果画廊 + 多样性地图 · Gallery",
    purpose: "通过质检的素材以杂志瀑布流展示,右侧多样性散点图证明『真实差异』。",
    interactions: [
      "瀑布流每张带基因标签、成本、耗时、质检分,可按基因/环境筛选",
      "右侧多样性散点地图(Embedding 降维),点越分散=真差异越大",
      "框选一簇可看共享哪些基因",
      "每张卡『查看谱系』跳回页面 03 定位父节点"
    ],
    prompt:
      "modern dark mode SaaS dashboard UI mockup, results gallery of many diverse ad creative thumbnails in a masonry magazine grid with small genome tag chips and cost time labels, a scatter diversity cluster map plot on the right side showing spread points, filter chips on top, editorial magazine layout, glassmorphism, bioluminescent teal and magenta accents, deep navy background, clean typography, soft glow, ultra detailed, 4k"
  },
  {
    no: "07",
    name: "进化反馈看板 · Evolution Dashboard",
    purpose: "投放数据回流,基因×环境适应度热力图 + 衰退曲线 + 续命告警,吃满加分项。",
    interactions: [
      "左侧 基因×环境 适应度热力图,一眼看出哪种机制在哪个环境最强",
      "中间各版本 CTR/CVR/ROI/消耗曲线,联动因果归因",
      "右侧衰退曲线 + 续命告警,临近拐点一键触发『接力裂变』",
      "优质基因回流为下一代变异先验,形成永不停歇循环"
    ],
    prompt:
      "modern dark mode SaaS dashboard UI mockup, evolution feedback dashboard, a gene fitness heatmap matrix of genes versus placement environments on the left, performance line charts of CTR and ROI in the center, a material decay curve with a glowing rejuvenate alert badge on the right, editorial magazine layout, glassmorphism, bioluminescent teal and magenta accents, deep navy background, clean typography, soft glow, ultra detailed, 4k"
  },
  {
    no: "08",
    name: "验证报告 · Validation Report",
    purpose: "Agent vs 旧工具 vs 人工三栏对比,顶部醒目 GO/NO-GO 徽章,支撑投入判断。",
    interactions: [
      "三栏对比:采用命中率提升、集中度(Gini)下降、单采用成本",
      "顶部 GO/NO-GO 徽章依据预注册阈值自动判定",
      "每个指标可下钻到显著性检验与样本量",
      "一键导出 Word / PDF 验证说明"
    ],
    prompt:
      "modern dark mode SaaS dashboard UI mockup, validation report screen comparing agent versus baseline tool, bar charts of adoption hit rate lift, a concentration gini indicator gauge, cost per adopted material metric card, a large green GO decision badge, statistical significance notes, editorial magazine layout, glassmorphism, bioluminescent teal and magenta accents, deep navy background, clean typography, soft glow, ultra detailed, 4k"
  }
];

function imgUrl(prompt: string) {
  return `https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=landscape_16_9`;
}

export default function PagesDoc() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-teal-glow/70">Product Pages</div>
      <h1 className="font-display text-4xl text-white">全部页面说明</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        产品由 8 个页面组成,覆盖从新建任务到进化反馈的完整闭环。每个页面附 AI 生成的设计稿与完整交互说明。
        其中『新建任务 / 测序 / 生成工作台 / 结果画廊』已在 <a href="/studio" className="text-teal-glow underline">裂变工作台</a> 中真实可运行。
      </p>

      <div className="mt-12 space-y-16">
        {PAGES.map((p, i) => (
          <motion.section
            key={p.no}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div className="glass overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl(p.prompt)} alt={p.name} className="aspect-video w-full object-cover" loading="lazy" />
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl text-teal-glow/50">{p.no}</span>
                <h2 className="font-display text-2xl text-white">{p.name}</h2>
              </div>
              <p className="mt-3 text-slate-300">{p.purpose}</p>
              <ul className="mt-4 space-y-2">
                {p.interactions.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-glow" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
