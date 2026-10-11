"use client";

import { getStoredKey } from "@/components/SettingsModal";

function compactText(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 240);
}

function platformErrorMessage(status: number, body: string): string {
  const normalized = body.toLowerCase();
  if (
    status === 504 ||
    normalized.includes("an error occurred") ||
    normalized.includes("function_invocation_timeout")
  ) {
    return "部署平台中断了本次请求。图片生成可能耗时较长,请稍后重试;若频繁发生,请检查 Vercel Function Max Duration。";
  }
  if (status === 429) {
    return "请求过于频繁,请等待 10-30 秒后重试。免费体验模式下的访客会共享同一个 GLM Key 配额。";
  }
  return `服务返回了非 JSON 响应 (HTTP ${status || "未知"}): ${compactText(body) || "空响应"}`;
}

async function parseResponse<T>(res: Response, path: string): Promise<T> {
  const text = await res.text();
  let data: unknown;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(platformErrorMessage(res.status, text));
    }
  }

  if (!res.ok) {
    const record = data && typeof data === "object" ? (data as Record<string, any>) : null;
    const message =
      (typeof record?.error === "string" && record.error) ||
      (typeof record?.message === "string" && record.message) ||
      `${path} 请求失败 (HTTP ${res.status})`;

    if (res.status === 429) {
      throw new Error(
        `${message}。免费体验模式下的访客会共享同一个 GLM Key 配额,请等待 10-30 秒后重试。`
      );
    }
    throw new Error(message);
  }

  if (!data || typeof data !== "object") {
    throw new Error(`${path} 未返回有效 JSON 数据`);
  }

  return data as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const key = getStoredKey();
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { "x-zhipu-key": key } : {})
    },
    body: JSON.stringify(body)
  });
  return parseResponse<T>(res, path);
}

import { Genome, GeneKey, Hypothesis, QaScore, SequenceResult } from "@/lib/genome";

export const api = {
  sequence: (imageBase64: string, brand: string, product: string) =>
    post<SequenceResult>("/api/sequence", { imageBase64, brand, product }),

  mutate: (args: {
    genome: Genome;
    winningGenes: GeneKey[];
    brand: string;
    product: string;
    count: number;
    aggressiveness: number;
    environment: string;
  }) => post<{ hypotheses: Hypothesis[] }>("/api/mutate", args),

  generate: (imagePrompt: string, size?: string) =>
    post<{ imageUrl: string }>("/api/generate", { imagePrompt, size }),

  qa: (args: { imageUrl: string; hypothesisTitle: string; bet: string; brand: string }) =>
    post<QaScore>("/api/qa", args)
};

// Convert a File to a base64 data URL (needed by GLM-5.3-Flash vision input).
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
