import { NextRequest, NextResponse } from "next/server";
import { chat, getApiErrorStatus, resolveKey, parseJson, MODELS } from "@/lib/glm";
import { QaScore } from "@/lib/genome";

export const runtime = "nodejs";
export const maxDuration = 120;

// Stage 5 — Loop Engineering QA. GLM-5.3-Flash acts as an "AI Creative Director",
// scoring the generated material on 5 dimensions and — crucially — giving
// ACTIONABLE, director-style fix instructions (not just a number). The key
// dimension is "fidelity": did the material actually realize the target
// hypothesis (did the winning gene survive)?
export async function POST(req: NextRequest) {
  try {
    const key = resolveKey(req.headers.get("x-zhipu-key"));
    const { imageUrl, imageBase64, hypothesisTitle, bet, brand } = await req.json();
    const url = imageUrl || imageBase64;
    if (!url) return NextResponse.json({ error: "缺少图片" }, { status: 400 });

    const sys = `你是一名 AI 创意总监,负责对生成的广告素材做 Loop 质检。给出 0-100 的五维打分,并给出可执行的定向修复批注(不是空泛评价)。
维度:
- brand 品牌一致性(是否符合品牌 ${brand || "(通用)"} 的调性)
- compliance 合规安全(违禁词/绝对化用语/敏感画面)
- quality 技术质量(畸变/多指/糊脸/文字乱码)
- fidelity 创意保真度(是否真的实现了目标创意假设:『${hypothesisTitle || ""}』,赌点:『${bet || ""}』)
- crossmodal 跨模态一致(画面与文案主张是否讲同一件事)
passed = 五维是否都 >= 70。
directorNotes:若不通过,给出针对失败维度的具体、可执行修复指令(如"把钩子改成24h前后强反差冷开场")。
严格输出 JSON: { "brand":n, "compliance":n, "quality":n, "fidelity":n, "crossmodal":n, "passed":true/false, "directorNotes":"..." }`;

    const raw = await chat(
      key,
      MODELS.vision,
      [
        { role: "system", content: sys },
        {
          role: "user",
          content: [
            { type: "text", text: "请对这张广告素材质检打分。" },
            { type: "image_url", image_url: { url } }
          ]
        }
      ],
      { temperature: 0.3 }
    );

    const s = parseJson<QaScore>(raw);
    const clamp = (v: any) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
    const score: QaScore = {
      brand: clamp(s.brand),
      compliance: clamp(s.compliance),
      quality: clamp(s.quality),
      fidelity: clamp(s.fidelity),
      crossmodal: clamp(s.crossmodal),
      passed: false,
      directorNotes: s.directorNotes || ""
    };
    score.passed =
      score.brand >= 70 &&
      score.compliance >= 70 &&
      score.quality >= 70 &&
      score.fidelity >= 70 &&
      score.crossmodal >= 70;

    return NextResponse.json(score);
  } catch (err: any) {
    const status = getApiErrorStatus(err);
    return NextResponse.json({ error: err.message || "质检失败" }, { status });
  }
}
