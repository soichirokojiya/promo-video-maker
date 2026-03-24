import { NextResponse } from "next/server";
import { fetchRepoInfo, parseGithubUrl } from "@/lib/github/fetchRepoInfo";
import { generateScenario } from "@/lib/ai/generateScenario";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { repoUrl, prompt } = await request.json();

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "GitHub repository URL is required" },
        { status: 400 }
      );
    }

    try {
      parseGithubUrl(repoUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid GitHub URL. Example: https://github.com/owner/repo" },
        { status: 400 }
      );
    }

    const repoInfo = await fetchRepoInfo(repoUrl);
    const scenario = await generateScenario(
      repoInfo,
      prompt && typeof prompt === "string" ? prompt : undefined
    );

    return NextResponse.json({ scenario, repoInfo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
