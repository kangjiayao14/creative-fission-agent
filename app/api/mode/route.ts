import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// 站点运行模式(所有访客共享的权威值):
//   free = 免费公开(访客无需 Key,用服务器预置 Key)
//   byok = 访客自带 Key(每位访客填自己的 Key)
//
// 权威来源(优先级):
//   1. 运行时覆盖(站长在页面用密码切换时写入的内存)——当前实例即时生效
//   2. 环境变量 SITE_RUN_MODE(Vercel 上部署级默认值)
//   3. 安全兜底 "byok"
//
// Serverless 实例会回收。若要持久固定模式,请设置 SITE_RUN_MODE=free|byok。
// ─────────────────────────────────────────────────────────────────────────────

type RunMode = "free" | "byok";

// 进程内运行时覆盖(热切换即时生效)
let runtimeOverride: RunMode | null = null;

function currentMode(): RunMode {
  if (runtimeOverride) return runtimeOverride;
  const env = (process.env.SITE_RUN_MODE || "").toLowerCase();
  if (env === "byok") return "byok";
  if (env === "free") return "free";
  return "byok";
}

function passwordMatches(candidate: unknown): boolean {
  const configured = process.env.SITE_ADMIN_PASSWORD;
  if (!configured || typeof candidate !== "string") return false;
  const actual = Buffer.from(configured);
  const supplied = Buffer.from(candidate);
  return actual.length === supplied.length && timingSafeEqual(actual, supplied);
}

export async function GET() {
  return NextResponse.json(
    { mode: currentMode() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SITE_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "站长控制台未配置。请设置 SITE_ADMIN_PASSWORD 环境变量。" },
        { status: 503 }
      );
    }

    const { action, mode, password } = await req.json();
    if (!passwordMatches(password)) {
      return NextResponse.json({ error: "管理密码不正确" }, { status: 403 });
    }

    if (action === "verify") {
      return NextResponse.json({ ok: true, mode: currentMode() });
    }

    const next: RunMode = mode === "byok" ? "byok" : "free";
    runtimeOverride = next;
    return NextResponse.json({ mode: next, ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "请求无效" }, { status: 400 });
  }
}
