import { NextRequest, NextResponse } from "next/server";
import { chat, getApiErrorStatus, resolveKey, parseJson, MODELS } from "@/lib/glm";
import { GENES, Genome, GeneKey, Hypothesis } from "@/lib/genome";

export const runtime = "nodejs";
export const maxDuration = 120;

// Stage 2 — Directed Mutation. The Strategist (GLM-5.3-Flash) proposes N
// creative hypotheses. Mutations happen at the STRATEGY layer (which genes to
// change), balancing exploit (small variation around winners) vs explore
// (jump to unexplored strategy space). Each hypothesis carries the bet + an
// image prompt to realize it.
export async function POST(req: NextRequest) {
  try {
    const key = resolveKey(req.headers.get("x-zhipu-key"));
    const { genome, winningGenes, brand, product, count, aggressiveness, environment } =
      await req.json();

    const n = Math.min(Math.max(Number(count) || 4, 1), 8);
    const aggr = Math.min(Math.max(Number(aggressiveness) ?? 0.5, 0), 1); // 0 conservative → 1 aggressive

    const geneSpec = GENES.map((g) => `${g.code} ${g.key} = ${g.label}`).join("\n");
    const seedStr = GENES.map((g) => `${g.code} ${g.label}: ${(genome as Genome)?.[g.key] || "—"}`).join("\n");

    const sys = `你是一名广告创意策略官(Strategist Agent)。你会拿到一条【已被采用】的原始素材的创意基因组,
你的任务是产出 ${n} 条【真实差异】的创意假设 —— 差异必须发生在策略层(改变卖点/人群/说服机制/钩子/叙事等基因),
而不是仅仅换背景或换颜色(那不是真差异)。

基因位:
${geneSpec}

探索激进度 = ${aggr.toFixed(2)} (0=保守,围绕赢家基因做小步微变异 exploit;1=激进,大胆跳到空白策略空间 explore)。
请让约 ${Math.round((1 - aggr) * n)} 条为 exploit,其余为 explore。目标投放环境:${environment || "信息流"}。

每条假设必须:
- 明确写出改动了哪些基因(mutatedGenes,用基因key数组,如 ["G4_hook","G7_narrative"]);
- 给出完整的新基因组 genome(未改动的基因沿用原值);
- 用一句话写清"我们赌它的理由"(bet),形如"我们赌……因为……";
- 给出一段英文的 imagePrompt,用于文生图模型生成能体现该假设的广告主视觉(具体、可执行、含风格/场景/主体/情绪, 适合 SDXL 风格)。

严格输出 JSON:
{ "hypotheses": [ { "title": "中文短标题", "mode": "exploit"|"explore", "mutatedGenes": ["..."], "genome": {全部10个基因key}, "bet": "...", "imagePrompt": "english prompt ..." } ] }`;

    const userMsg = `品牌:${brand || "未提供"};商品:${product || "未提供"}。
原始赢家基因(winningGenes):${(winningGenes || []).join(", ") || "未标注"}。
原始基因组:
${seedStr}

请产出 ${n} 条创意假设。`;

    const raw = await chat(
      key,
      MODELS.text,
      [
        { role: "system", content: sys },
        { role: "user", content: userMsg }
      ],
      { temperature: 0.6 + aggr * 0.4, jsonMode: true }
    );

    const parsed = parseJson<{ hypotheses: any[] }>(raw);
    const list: Hypothesis[] = (parsed.hypotheses || []).slice(0, n).map((h, i) => {
      const g = {} as Genome;
      for (const gene of GENES) {
        g[gene.key] = h?.genome?.[gene.key] || (genome as Genome)?.[gene.key] || "—";
      }
      const mutated = (h?.mutatedGenes || []).filter((k: string) =>
        GENES.some((x) => x.key === (k as GeneKey))
      );
      return {
        id: `H${i + 1}`,
        title: h?.title || `假设 ${i + 1}`,
        mode: h?.mode === "explore" ? "explore" : "exploit",
        mutatedGenes: mutated,
        genome: g,
        bet: h?.bet || "",
        imagePrompt: h?.imagePrompt || "high quality advertising creative, studio lighting"
      };
    });

    return NextResponse.json({ hypotheses: list });
  } catch (err: any) {
    const status = getApiErrorStatus(err);
    return NextResponse.json({ error: err.message || "变异失败" }, { status });
  }
}
