import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { VideoScenario } from "@/lib/types/scenario";

export const maxDuration = 30;

const REVISE_SYSTEM_PROMPT = `You are a video scenario editor. You will receive:
1. The current video scenario (JSON)
2. The user's revision instructions
3. Optionally, screenshot images showing what the UI should look like

Your job: modify the scenario JSON according to the user's instructions and return the COMPLETE updated JSON.

Rules:
- Return ONLY valid JSON (no markdown fences, no explanation)
- Keep the same overall structure (meta, theme, scenes array)
- Only change what the user asks to change
- If the user says "make it longer", increase scene durations
- If the user says "remove the title", remove that scene
- If the user says "change the color", update the theme
- If the user asks to add/modify/reorder scenes, do it
- Keep meta.totalDurationSeconds in sync with the sum of all scene durations
- Maintain the same JSON schema — don't add new fields that aren't in the schema
- If screenshots are provided, use them to make the app-demo UI elements match the actual design:
  match colors, layout, sidebar items, button labels, card content, etc.
`;

export async function POST(request: Request) {
  try {
    const { scenario, instruction, images } = await request.json();

    if (!scenario || !instruction) {
      return NextResponse.json(
        { error: "scenario and instruction are required" },
        { status: 400 }
      );
    }

    const client = new Anthropic();

    // Build content array with text and optional images
    const content: Anthropic.Messages.ContentBlockParam[] = [];

    // Add images if provided
    if (images && Array.isArray(images)) {
      for (const img of images) {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: img.mediaType || "image/png",
            data: img.data,
          },
        });
      }
    }

    content.push({
      type: "text",
      text: `Current scenario:\n${JSON.stringify(scenario, null, 2)}\n\n--- REVISION INSTRUCTIONS ---\n${instruction}`,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: REVISE_SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonStr = text
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();

    try {
      const revised: VideoScenario = JSON.parse(jsonStr);
      return NextResponse.json({ scenario: revised });
    } catch {
      return NextResponse.json(
        { error: "AIの応答をパースできませんでした。もう一度お試しください。" },
        { status: 500 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
