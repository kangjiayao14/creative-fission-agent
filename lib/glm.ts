// ─────────────────────────────────────────────────────────────────────────────
// Zhipu GLM client. Talks to the official OpenAI-compatible v4 endpoints.
// The API key can come from (in priority order):
//   1. the `x-zhipu-key` request header (user pastes it in the UI at runtime)
//   2. the ZHIPU_API_KEY environment variable (.env.local / Vercel env)
// Nothing is hardcoded — if no key is present, routes return a clear error.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.ZHIPU_BASE_URL || "https://open.bigmodel.cn/api/paas/v4";

// GLM-5.3-Flash 是原生多模态模型(文本 + 视觉),因此文本与视觉共用同一模型。
// 图片生成使用 glm-image。均可用环境变量覆盖。
export const MODELS = {
  text: process.env.GLM_TEXT_MODEL || "glm-5.3-flash",
  vision: process.env.GLM_VISION_MODEL || "glm-5.3-flash",
  image: process.env.GLM_IMAGE_MODEL || "glm-image"
};

export class MissingKeyError extends Error {
  constructor() {
    super("未检测到 GLM API Key。请在页面右上角『填写 API Key』中输入你的智谱 Key,或由站长配置 ZHIPU_API_KEY 环境变量。");
    this.name = "MissingKeyError";
  }
}

export class GlmApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 502, code?: string) {
    super(message);
    this.name = "GlmApiError";
    this.status = status;
    this.code = code;
  }
}

export function getApiErrorStatus(error: unknown): number {
  if (error instanceof MissingKeyError) return 401;
  if (error instanceof GlmApiError) return error.status;
  return 500;
}

export function resolveKey(headerKey?: string | null): string {
  const key = (headerKey && headerKey.trim()) || process.env.ZHIPU_API_KEY || "";
  if (!key) throw new MissingKeyError();
  return key;
}

function compactText(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 300);
}

function apiMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, any>;
  const error = record.error;
  if (typeof error === "string") return error;
  if (error && typeof error.message === "string") return error.message;
  if (typeof record.message === "string") return record.message;
  return "";
}

async function readApiJson<T>(res: Response, label: string): Promise<T> {
  const text = await res.text();
  let data: unknown;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      const preview = compactText(text);
      const message =
        /^an error occurred/i.test(preview)
          ? `${label} 暂时不可用,上游返回了非 JSON 错误`
          : `${label} 返回了无法识别的响应${preview ? `: ${preview}` : ""}`;
      throw new GlmApiError(message, res.ok ? 502 : res.status || 502, "NON_JSON_RESPONSE");
    }
  }

  if (!res.ok) {
    const code =
      data && typeof data === "object"
        ? String((data as any)?.error?.code || (data as any)?.code || "")
        : undefined;
    const message = apiMessage(data) || `${label} 请求失败`;
    const friendly =
      res.status === 429
        ? `${label}触发速率限制,请稍等 10-30 秒后重试`
        : `${label}调用失败 (${res.status}): ${message}`;
    throw new GlmApiError(friendly, res.status, code);
  }

  if (!data || typeof data !== "object") {
    throw new GlmApiError(`${label} 未返回有效 JSON 数据`, 502, "EMPTY_RESPONSE");
  }

  return data as T;
}

async function fetchWithRateLimitRetry(
  input: string,
  init: RequestInit,
  retries = 1
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(input, init);
    if (res.status !== 429 || attempt >= retries) return res;

    await res.text();
    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 15_000)
      : 4_000 * (attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

interface ChatMessageContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ChatMessageContentPart[];
}

// Chat completion for GLM-5.3-Flash (native multimodal: text + vision).
// Per Zhipu docs: thinking.type only supports "enabled"; recommended
// temperature 1 / top_p 0.95 / reasoning_effort max. We keep temperature
// overridable so JSON-heavy calls can run cooler for stability.
export async function chat(
  key: string,
  model: string,
  messages: ChatMessage[],
  opts: { temperature?: number; jsonMode?: boolean; reasoningEffort?: string } = {}
): Promise<string> {
  const res = await fetchWithRateLimitRetry(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 1.0,
      top_p: 0.95,
      max_tokens: 8192,
      thinking: { type: "enabled", clear_thinking: false },
      reasoning_effort: opts.reasoningEffort ?? "high",
      ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {})
    })
  });

  const data = await readApiJson<any>(res, "GLM chat");
  return data?.choices?.[0]?.message?.content ?? "";
}

// glm-image image generation → returns an https URL to the generated image.
export async function generateImage(
  key: string,
  prompt: string,
  size = "1024x1024"
): Promise<string> {
  const res = await fetchWithRateLimitRetry(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({ model: MODELS.image, prompt, size })
  });

  const data = await readApiJson<any>(res, "glm-image");
  const url = data?.data?.[0]?.url;
  if (!url) throw new GlmApiError("glm-image 未返回图片 URL", 502, "MISSING_IMAGE_URL");
  return url;
}

// Robustly pull a JSON object out of a model response that may be fenced.
export function parseJson<T>(raw: string): T {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  return JSON.parse(s) as T;
}
