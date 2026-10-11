// ─────────────────────────────────────────────────────────────────────────────
// Creative Genome — the operational definition of "real difference".
// Two creatives differ *for real* when their strategy-layer genes differ,
// not when their pixels differ. This schema is shared by every agent.
// ─────────────────────────────────────────────────────────────────────────────

export type GeneKey =
  | "G1_value"
  | "G2_audience"
  | "G3_persuasion"
  | "G4_hook"
  | "G5_emotion"
  | "G6_scene"
  | "G7_narrative"
  | "G8_visual"
  | "G9_format"
  | "G10_cta";

export interface GeneDef {
  key: GeneKey;
  code: string; // G1..G10
  label: string;
  desc: string;
  examples: string[];
}

export const GENES: GeneDef[] = [
  {
    key: "G1_value",
    code: "G1",
    label: "卖点 / 价值主张",
    desc: "这条素材在卖什么利益",
    examples: ["功能利益", "情感利益", "社会认同", "性价比"]
  },
  {
    key: "G2_audience",
    code: "G2",
    label: "人群 & 洞察",
    desc: "说给谁听、戳中什么",
    examples: ["熬夜白领·变丑焦虑", "学生党·平价刚需", "宝妈·安全成分"]
  },
  {
    key: "G3_persuasion",
    code: "G3",
    label: "说服机制",
    desc: "使用哪种心理杠杆",
    examples: ["恐惧诉求", "从众", "权威背书", "稀缺", "对比实证"]
  },
  {
    key: "G4_hook",
    code: "G4",
    label: "钩子(前3秒)",
    desc: "如何在开场留住注意力",
    examples: ["悬念", "痛点前置", "利益前置", "强反差", "提问"]
  },
  {
    key: "G5_emotion",
    code: "G5",
    label: "情绪基调",
    desc: "情感底色",
    examples: ["焦虑→安心", "惊喜", "共鸣", "搞笑", "理性信任"]
  },
  {
    key: "G6_scene",
    code: "G6",
    label: "场景 / 情境",
    desc: "故事发生在哪里",
    examples: ["深夜卧室", "通勤地铁", "宿舍", "办公室"]
  },
  {
    key: "G7_narrative",
    code: "G7",
    label: "叙事结构",
    desc: "怎么把故事讲出来",
    examples: ["问题-解决", "开箱", "对比测评", "医生口播", "UGC自述"]
  },
  {
    key: "G8_visual",
    code: "G8",
    label: "视觉风格",
    desc: "长什么样",
    examples: ["冷调高级感", "暖调生活流", "强对比综艺感", "极简留白"]
  },
  {
    key: "G9_format",
    code: "G9",
    label: "表现形式",
    desc: "用什么载体",
    examples: ["单人口播", "情景剧", "图文海报", "动画", "手持Vlog"]
  },
  {
    key: "G10_cta",
    code: "G10",
    label: "CTA / 转化钩",
    desc: "怎么收口促转化",
    examples: ["限时优惠", "扫码领样", "痛点回扣", "0元试用"]
  }
];

export type Genome = Record<GeneKey, string>;

export interface SequenceResult {
  genome: Genome;
  whyItWorks: string; // GLM's hypothesis about the winning gene(s)
  winningGenes: GeneKey[];
  summary: string;
}

export type MutationMode = "exploit" | "explore";

export interface Hypothesis {
  id: string;
  title: string;
  mode: MutationMode;
  mutatedGenes: GeneKey[]; // which genes were changed vs the seed
  genome: Genome;
  bet: string; // "we bet that ... because ..."
  imagePrompt: string; // glm-image prompt to realize the hypothesis as an image
}

export interface GeneratedMaterial {
  hypothesisId: string;
  imageBase64?: string; // data URL from glm-image (or seeded fallback)
  imageUrl?: string;
  status: "pending" | "generating" | "qa" | "done" | "rejected";
}

export interface QaScore {
  brand: number;
  compliance: number;
  quality: number;
  fidelity: number; // did it actually realize the target hypothesis?
  crossmodal: number;
  passed: boolean;
  directorNotes: string; // actionable, director-style fix instructions
}

export const EMPTY_GENOME: Genome = {
  G1_value: "",
  G2_audience: "",
  G3_persuasion: "",
  G4_hook: "",
  G5_emotion: "",
  G6_scene: "",
  G7_narrative: "",
  G8_visual: "",
  G9_format: "",
  G10_cta: ""
};
