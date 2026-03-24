import { RepoInfo } from "@/lib/types/scenario";

export function parseGithubUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s#?]+)/);
  if (!match) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function ghFetch(path: string): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} for ${path}`);
  }
  return res.json();
}

async function ghFetchRaw(path: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) return "";
  return res.text();
}

export async function fetchRepoInfo(url: string): Promise<RepoInfo> {
  const { owner, repo } = parseGithubUrl(url);

  const [repoData, readme, languages] = await Promise.all([
    ghFetch(`/repos/${owner}/${repo}`),
    ghFetchRaw(`/repos/${owner}/${repo}/readme`),
    ghFetch(`/repos/${owner}/${repo}/languages`),
  ]);

  return {
    owner,
    repo,
    description: repoData.description as string | null,
    stars: repoData.stargazers_count as number,
    forks: repoData.forks_count as number,
    language: repoData.language as string | null,
    topics: (repoData.topics as string[]) || [],
    readme: readme.slice(0, 3000),
    languages: languages as Record<string, number>,
  };
}
