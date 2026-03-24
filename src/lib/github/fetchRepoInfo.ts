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

// 主要なソースファイルを取得（エントリポイントや重要ファイル）
const SOURCE_PATTERNS = [
  // エントリポイント系
  "src/index.ts",
  "src/index.tsx",
  "src/index.js",
  "src/main.ts",
  "src/main.tsx",
  "src/main.rs",
  "src/main.go",
  "main.go",
  "main.py",
  "app.py",
  "src/app.ts",
  "src/app.tsx",
  "src/App.tsx",
  "src/lib.rs",
  "cmd/main.go",
  "index.ts",
  "index.js",
  // API・ルーティング系
  "src/routes/index.ts",
  "src/api/index.ts",
  "src/server.ts",
  "src/server.js",
  "app/page.tsx",
  "app/layout.tsx",
  "pages/index.tsx",
  "pages/index.js",
];

async function fetchSampleCode(
  owner: string,
  repo: string,
  tree: string
): Promise<{ path: string; content: string }[]> {
  // ツリーに存在するファイルだけ取得
  const filesToFetch = SOURCE_PATTERNS.filter((f) => tree.includes(f)).slice(
    0,
    5
  );

  // ツリーからさらに重要そうなファイルを発見
  const treeLines = tree.split("\n").map((l) => l.trim().replace(/^📁 |^   /, ""));
  const extraFiles = treeLines
    .filter(
      (f) =>
        !f.includes("/") && // ルート直下
        f.match(/\.(ts|tsx|js|jsx|py|rs|go|rb|java)$/) &&
        !f.match(/config|test|spec|\.d\.ts/) &&
        !filesToFetch.includes(f)
    )
    .slice(0, 2);

  const allFiles = [...filesToFetch, ...extraFiles].slice(0, 5);

  const results = await Promise.allSettled(
    allFiles.map(async (f) => {
      const content = await ghFetchRaw(`/repos/${owner}/${repo}/contents/${f}`);
      return { path: f, content: content.slice(0, 2000) };
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
