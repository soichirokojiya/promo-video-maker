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
  | CtaSceneConfig;

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
