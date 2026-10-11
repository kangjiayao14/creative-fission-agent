import type { Metadata } from "next";
import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "裂变引擎 · Creative Fission Agent",
  description:
    "把一条已验证的广告素材当作『创意基因』,通过测序→定向变异→质检淘汰→进化遗传,系统性搜索高绩效创意方向。Powered by Zhipu GLM.",
  keywords: ["广告素材裂变", "GLM", "智谱", "Creative Agent", "AIGC"]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Nav />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-white/10 px-6 py-10 text-center text-xs text-slate-500">
          裂变引擎 Creative Fission Agent · 一台创意达尔文引擎 · Powered by Zhipu GLM
          <span className="mx-2">·</span>
          Demo for Hackathon — 填入你的 GLM API Key 即可真实运行
        </footer>
      </body>
    </html>
  );
}
