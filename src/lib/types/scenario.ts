export interface VideoScenario {
  meta: {
    repoName: string;
    repoUrl: string;
    totalDurationSeconds: number;
    fps: number;
    width: number;
    height: number;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  scenes: SceneConfig[];
}

export type SceneConfig =
  | TitleSceneConfig
  | StatsSceneConfig
  | FeaturesSceneConfig
  | CodeSceneConfig
  | CtaSceneConfig
  | AppDemoSceneConfig;

interface BaseScene {
  type: string;
  durationSeconds: number;
}

export interface TitleSceneConfig extends BaseScene {
  type: "title";
  title: string;
  subtitle: string;
}

export interface StatsSceneConfig extends BaseScene {
  type: "stats";
  stats: { label: string; value: string }[];
}

export interface FeaturesSceneConfig extends BaseScene {
  type: "features";
  heading: string;
  items: { emoji: string; text: string }[];
}

export interface CodeSceneConfig extends BaseScene {
  type: "code";
  language: string;
  snippet: string;
  languageBreakdown: { name: string; percentage: number; color: string }[];
}

export interface CtaSceneConfig extends BaseScene {
  type: "cta";
  headline: string;
  buttonText: string;
  repoUrl: string;
}

// 操作デモシーン
export interface AppDemoSceneConfig extends BaseScene {
  type: "app-demo";
  browserUrl: string;
  steps: AppDemoStep[];
}

export interface AppDemoStep {
  caption: string; // 画面下に出る説明テキスト (例: "アカウントを選択して投稿を作成")
  sidebar?: { items: string[]; activeIndex: number };
  header?: string;
  content: AppDemoElement[];
  clickTarget?: number; // contentの何番目をクリックするか (0-indexed)
  afterClickChanges?: {
    // クリック後の変化
    type: "toast" | "modal" | "update" | "navigate";
    text: string;
  };
}

export interface AppDemoElement {
  type:
    | "card"
    | "button"
    | "input"
    | "toggle"
    | "table-row"
    | "stat-card"
    | "text-block"
    | "image-placeholder"
    | "list-item"
    | "progress-bar";
  label: string;
  value?: string;
  color?: string;
  active?: boolean;
}

export interface RepoInfo {
  owner: string;
  repo: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  readme: string;
  languages: Record<string, number>;
  directoryTree: string;
  configFiles: Record<string, string>;
  sampleCode: { path: string; content: string }[];
  recentCommits: string[];
}
