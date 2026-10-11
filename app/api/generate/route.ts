import { NextRequest, NextResponse } from "next/server";
import { generateImage, getApiErrorStatus, resolveKey } from "@/lib/glm";

export const runtime = "nodejs";
export const maxDuration = 240;

// Stage 4 — Material Generation. glm-image turns the hypothesis's imagePrompt
// into a real new image material. Returns the image URL produced by Zhipu.
export async function POST(req: NextRequest) {
  try {
    const key = resolveKey(req.headers.get("x-zhipu-key"));
    const { imagePrompt, size } = await req.json();
    if (!imagePrompt) {
      return NextResponse.json({ error: "缺少 imagePrompt" }, { status: 400 });
    }
    const url = await generateImage(key, imagePrompt, size || "1024x1024");
    return NextResponse.json({ imageUrl: url });
  } catch (err: any) {
    const status = getApiErrorStatus(err);
    return NextResponse.json({ error: err.message || "生成失败" }, { status });
  }
}
