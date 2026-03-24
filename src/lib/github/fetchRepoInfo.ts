import { RepoInfo } from "@/lib/types/scenario";

export function parseGithubUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s#?]+)/);
  if (!match) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

const headers = (): Record<string, string> => {
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
};

async function ghFetch(path: string): Promise<Record<string, unknown>> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}`);
  return res.json();
}

async function ghFetchRaw(path: string): Promise<string> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { ...headers(), Accept: "application/vnd.github.raw" },
  });
  if (!res.ok) return "";
  return res.text();
}

// ディレクトリツリーを再帰的に取得（depth 2まで）
async function fetchTree(
  owner: string,
  repo: string
): Promise<string> {
  try {
    const data = await ghFetch(
      `/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`
    );
    const tree = data.tree as { path: string; type: string }[];

    // ファイルツリーを整形（重要なファイルだけ表示、最大100行）
    const lines: string[] = [];
    for (const item of tree) {
      const depth = item.path.split("/").length - 1;
      if (depth > 2) continue; // 3階層目以降は省略
      if (item.path.includes("node_modules/")) continue;
      if (item.path.includes(".git/")) continue;
      if (item.path.match(/\.(lock|sum|min\.\w+)$/)) continue;
      const prefix = item.type === "tree" ? "📁 " : "   ";
      lines.push(prefix + item.path);
      if (lines.length >= 100) break;
    }
    return lines.join("\n");
  } catch {
    return "(tree not available)";
  }
}

// 主要な設定ファイルを取得
const CONFIG_FILES = [
  "package.json",
  "Cargo.toml",
  "pyproject.toml",
  "setup.py",
  "go.mod",
  "build.gradle",
  "pom.xml",
  "Gemfile",
  "composer.json",
  "deno.json",
  "docker-compose.yml",
  "Dockerfile",
];

async function fetchConfigFiles(
  owner: string,
  repo: string,
  tree: string
): Promise<Record<string, string>> {
  const configs: Record<string, string> = {};
  const filesToFetch = CONFIG_FILES.filter((f) => tree.includes(f));

  const results = await Promise.allSettled(
    filesToFetch.map(async (f) => {
      const content = await ghFetchRaw(`/repos/${owner}/${repo}/contents/${f}`);
      return { file: f, content: content.slice(0, 3000) };
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value.content) {
      configs[r.value.file] = r.value.content;
    }
  }

  return configs;
}

// 主要なソースファイルを取得（UI・レイアウト・ルーティング重視）
const SOURCE_PATTERNS = [
  // レイアウト・ページ（UIを理解するのに最重要）
  "src/App.tsx",
  "src/App.jsx",
  "src/App.vue",
  "app/layout.tsx",
  "app/page.tsx",
  "pages/index.tsx",
  "pages/index.jsx",
  "src/app.tsx",
  "src/app.jsx",
  // ルーティング（画面構成を理解）
  "src/routes.tsx",
  "src/routes.ts",
  "src/router.tsx",
  "src/router.ts",
  "src/routes/index.ts",
  "src/routes/index.tsx",
  // エントリ
  "src/index.tsx",
  "src/index.ts",
  "src/main.tsx",
  "src/main.ts",
  "index.ts",
  "main.py",
  "app.py",
  "main.go",
  "src/main.rs",
  // サーバー
  "src/server.ts",
  "src/server.js",
  "src/api/index.ts",
];

// UIコンポーネントを探すパターン
const UI_FILE_PATTERNS = [
  /components?\/(Dashboard|Home|Layout|Sidebar|Header|Nav|Main|App)/i,
  /pages?\/(index|home|dashboard|main)/i,
  /views?\/(index|home|dashboard|main)/i,
  /screens?\/(Home|Main|Dashboard)/i,
  /app\/.+\/page\.(tsx|jsx|ts|js)$/,
  /templates?\//i,
];

// CSS・スタイリング
const STYLE_PATTERNS = [
  "src/index.css",
  "src/App.css",
  "src/styles/globals.css",
  "src/styles/global.css",
  "app/globals.css",
  "styles/globals.css",
  "tailwind.config.js",
  "tailwind.config.ts",
  "theme.ts",
  "theme.js",
  "src/theme.ts",
  "src/theme/index.ts",
  "src/styles/theme.ts",
];

async function fetchSampleCode(
  owner: string,
  repo: string,
  tree: string
): Promise<{ path: string; content: string }[]> {
  const treeLines = tree
    .split("\n")
    .map((l) => l.trim().replace(/^📁 |^   /, ""));

  // 1. 定義済みパターンにマッチするファイル
  const patternMatches = SOURCE_PATTERNS.filter((f) => tree.includes(f));

  // 2. UIコンポーネントファイルをツリーから発見
  const uiFiles = treeLines.filter((f) =>
    UI_FILE_PATTERNS.some((p) => p.test(f))
  );

  // 3. CSSスタイリングファイル
  const styleFiles = STYLE_PATTERNS.filter((f) => tree.includes(f));

  // 優先度: UIコンポーネント > レイアウト/ページ > スタイル > エントリ
  const allFiles = [
    ...uiFiles.slice(0, 4),
    ...patternMatches.slice(0, 4),
    ...styleFiles.slice(0, 2),
  ];

  // 重複排除して最大10ファイル
  const uniqueFiles = [...new Set(allFiles)].slice(0, 10);

  const results = await Promise.allSettled(
    uniqueFiles.map(async (f) => {
      const content = await ghFetchRaw(
        `/repos/${owner}/${repo}/contents/${f}`
      );
      return { path: f, content: content.slice(0, 3000) };
    })
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<{ path: string; content: string }> =>
        r.status === "fulfilled" && !!r.value.content
    )
    .map((r) => r.value);
}

// 最近のコミットメッセージを取得
async function fetchRecentCommits(
  owner: string,
  repo: string
): Promise<string[]> {
  try {
    const data = await ghFetch(
      `/repos/${owner}/${repo}/commits?per_page=10`
    );
    return (data as unknown as { commit: { message: string } }[]).map(
      (c) => c.commit.message.split("\n")[0]
    );
  } catch {
    return [];
  }
}

export async function fetchRepoInfo(url: string): Promise<RepoInfo> {
  const { owner, repo } = parseGithubUrl(url);

  // Phase 1: 基本情報 + ツリーを並列取得
  const [repoData, readme, languages, directoryTree] = await Promise.all([
    ghFetch(`/repos/${owner}/${repo}`),
    ghFetchRaw(`/repos/${owner}/${repo}/readme`),
    ghFetch(`/repos/${owner}/${repo}/languages`),
    fetchTree(owner, repo),
  ]);

  // Phase 2: ツリーに基づいて設定ファイル・ソースコード・コミットを並列取得
  const [configFiles, sampleCode, recentCommits] = await Promise.all([
    fetchConfigFiles(owner, repo, directoryTree),
    fetchSampleCode(owner, repo, directoryTree),
    fetchRecentCommits(owner, repo),
  ]);

  return {
    owner,
    repo,
    description: repoData.description as string | null,
    stars: repoData.stargazers_count as number,
    forks: repoData.forks_count as number,
    language: repoData.language as string | null,
    topics: (repoData.topics as string[]) || [],
    readme: readme.slice(0, 8000),
    languages: languages as Record<string, number>,
    directoryTree,
    configFiles,
    sampleCode,
    recentCommits,
  };
}
