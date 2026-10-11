import { NextRequest, NextResponse } from "next/server";
import { chat, getApiErrorStatus, resolveKey, parseJson, MODELS } from "@/lib/glm";
import { GENES, Genome, GeneKey, SequenceResult } from "@/lib/genome";

export const runtime = "nodejs";
export const maxDuration = 120;

// Stage 1 — Gene Sequencing. GLM-5.3-Flash "reads" the uploaded creative and
// decomposes it into the structured Creative Genome + a hypothesis about
// *why* it works (which genes are the winners).
export async function POST(req: NextRequest) {
  try {
    const key = resolveKey(req.headers.get("x-zhipu-key"));
    const { imageBase64, brand, product } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "缺少图片数据" }, { status: 400 });
    }

    const geneSpec = GENES.map((g) => `${g.code} ${g.label}(${g.desc};如 ${g.examples.join("/")})`).join("\n");

    const sys = `你是一名资深广告创意测序官。你的任务是把一条已被客户采用的广告素材,拆解为结构化的『创意基因组』。
请只在【策略层】描述基因,而不是描述像素细节。基因位定义如下:
${geneSpec}

严格输出 JSON,结构:
{
  "genome": { "G1_value": "...", "G2_audience": "...", "G3_persuasion": "...", "G4_hook": "...", "G5_emotion": "...", "G6_scene": "...", "G7_narrative": "...", "G8_visual": "...", "G9_format": "...", "G10_cta": "..." },
  "whyItWorks": "一句话假设:这条素材为什么有效,核心靠哪个/哪些基因",
  "winningGenes": ["G3_persuasion", "G4_hook"],
  "summary": "20字内的素材概括"
}
所有取值用中文,简洁具体。`;

    const userText = `品牌:${brand || "未提供"};商品:${product || "未提供"}。请分析这张广告素材并测序。`;

    const raw = await chat(
      key,
      MODELS.vision,
      [
        { role: "system", content: sys },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: imageBase64 } }
          ]
        }
      ],
      { temperature: 0.4 }
    );

    const parsed = parseJson<SequenceResult>(raw);

    // Defensive: ensure all 10 gene slots exist.
    const genome = {} as Genome;
    for (const g of GENES) {
      genome[g.key] = (parsed.genome as any)?.[g.key] || "—";
    }

    return NextResponse.json({
      genome,
      whyItWorks: parsed.whyItWorks || "",
      winningGenes: (parsed.winningGenes || []).filter((k) =>
        GENES.some((g) => g.key === (k as GeneKey))
      ),
      summary: parsed.summary || ""
    });
  } catch (err: any) {
    const status = getApiErrorStatus(err);
    return NextResponse.json({ error: err.message || "测序失败" }, { status });
  }
}
