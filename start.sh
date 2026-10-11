#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# 裂变引擎 · 一键启动脚本(macOS / Linux)
#
# 用法:
#   ./start.sh           常规启动:释放 3000 端口 → 启动开发服务器
#   ./start.sh --clean   干净启动:额外清空 .next 缓存(页面白屏/资源404时用)
#   ./start.sh --prod    生产模式:先 build 再 start(更接近 Vercel 线上效果)
#
# 启动后访问: http://localhost:3000
# Key 配置:  .env.local(已自动读取)或网页右上角『设置 · API Key』
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# 始终切到本脚本所在目录,保证在任意路径下都能运行
cd "$(dirname "$0")"

PORT=3000
MODE="dev"

for arg in "$@"; do
  case "$arg" in
    --clean) MODE="clean" ;;
    --prod)  MODE="prod" ;;
    *) echo "未知参数:$arg(可用:--clean / --prod)"; exit 1 ;;
  esac
done

echo "▶ 裂变引擎启动器 · 模式:${MODE}"

# 1) 若没有 node_modules,先安装依赖
if [ ! -d node_modules ]; then
  echo "▶ 首次运行,安装依赖中…"
  npm install
fi

# 2) 释放可能被占用的端口(精确按端口终止,避免误杀)
PIDS="$(lsof -ti tcp:${PORT} 2>/dev/null || true)"
if [ -n "${PIDS}" ]; then
  echo "▶ 端口 ${PORT} 被占用(PID: $(echo "$PIDS" | tr '\n' ' ')),正在停止旧进程…"
  echo "${PIDS}" | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# 3) 按模式处理构建缓存
if [ "${MODE}" = "clean" ]; then
  echo "▶ 清空 .next 缓存…"
  rm -rf .next
elif [ "${MODE}" = "prod" ]; then
  echo "▶ 生产构建中…"
  npm run build
fi

# 4) 启动
if [ "${MODE}" = "prod" ]; then
  echo "▶ 以生产模式启动 → http://localhost:${PORT}"
  exec npm run start
else
  echo "▶ 以开发模式启动 → http://localhost:${PORT}"
  exec npm run dev
fi
