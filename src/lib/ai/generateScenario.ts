import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt";
import { RepoInfo, VideoScenario } from "@/lib/types/scenario";

export async function generateScenario(
  repoInfo: RepoInfo,
  userPrompt?: string
): Promise<VideoScenario> {
  const client = new Anthropic();

  let userMessage = `Generate a promo video scenario for this GitHub repository:

Repository: ${repoInfo.owner}/${repoInfo.repo}
URL: https://github.com/${repoInfo.owner}/${repoInfo.repo}
Description: ${repoInfo.description || "No description"}
Primary Language: ${repoInfo.language || "Unknown"}
Stars: ${repoInfo.stars}
Forks: ${repoInfo.forks}
Topics: ${repoInfo.topics.join(", ") || "None"}

Language Breakdown:
${Object.entries(repoInfo.languages)
  .map(([lang, bytes]) => `  ${lang}: ${bytes} bytes`)
  .join("\n")}

README (first 3000 chars):
${repoInfo.readme}`;

  if (userPrompt) {
    userMessage += `\n\n--- USER INSTRUCTIONS ---\n${userPrompt}\n\nIMPORTANT: Follow the user's instructions above to determine what to highlight, the tone, and the language of the video text.`;
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
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
