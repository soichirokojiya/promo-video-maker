import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt";
import { RepoInfo, VideoScenario } from "@/lib/types/scenario";

export async function generateScenario(
  repoInfo: RepoInfo,
  userPrompt?: string
): Promise<VideoScenario> {
  const client = new Anthropic();

  // 言語比率をパーセンテージに変換
  const totalBytes = Object.values(repoInfo.languages).reduce(
    (a, b) => a + b,
    0
  );
  const langBreakdown = Object.entries(repoInfo.languages)
    .sort(([, a], [, b]) => b - a)
    .map(([lang, bytes]) => `  ${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%`)
    .join("\n");

  // 設定ファイルの内容を整形
  const configSection = Object.entries(repoInfo.configFiles)
    .map(([file, content]) => `--- ${file} ---\n${content}`)
    .join("\n\n");

  // ソースコードの内容を整形
  const codeSection = repoInfo.sampleCode
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  // コミットメッセージ
  const commitsSection = repoInfo.recentCommits
    .map((m, i) => `  ${i + 1}. ${m}`)
    .join("\n");

  let userMessage = `Generate a promo video scenario for this GitHub repository.
I'm providing you with DEEP analysis data — use ALL of it.

=== BASIC INFO ===
Repository: ${repoInfo.owner}/${repoInfo.repo}
URL: https://github.com/${repoInfo.owner}/${repoInfo.repo}
Description: ${repoInfo.description || "No description"}
Primary Language: ${repoInfo.language || "Unknown"}
Stars: ${repoInfo.stars}
Forks: ${repoInfo.forks}
Topics: ${repoInfo.topics.join(", ") || "None"}

=== LANGUAGE BREAKDOWN ===
${langBreakdown}

=== DIRECTORY STRUCTURE ===
${repoInfo.directoryTree}

=== CONFIG FILES ===
${configSection || "(none found)"}

=== SOURCE CODE SAMPLES ===
${codeSection || "(none found)"}

=== RECENT COMMITS ===
${commitsSection || "(none found)"}

=== README ===
${repoInfo.readme}`;

  if (userPrompt) {
    userMessage += `\n\n=== USER INSTRUCTIONS ===\n${userPrompt}\n\nIMPORTANT: Follow the user's instructions above to determine what to highlight, the tone, and the language of the video text. The user's instructions take highest priority.`;
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonStr = text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  try {
    return JSON.parse(jsonStr) as VideoScenario;
  } catch {
    throw new Error("Failed to parse video scenario from AI response");
  }
}
