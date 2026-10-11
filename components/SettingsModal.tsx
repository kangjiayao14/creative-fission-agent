"use client";

// 兼容旧引用:统一从 AccessControl 导出。
export { getStoredKey, getCachedRunMode, fetchRunMode } from "./AccessControl";
export type { RunMode } from "./AccessControl";
