"use client";

import { useState } from "react";
import { VideoScenario } from "@/lib/types/scenario";
import { VideoPreview } from "@/components/VideoPreview";

const EXAMPLES = [
  { label: "Express.js", url: "https://github.com/expressjs/express" },
  { label: "Next.js", url: "https://github.com/vercel/next.js" },
  { label: "Deno", url: "https://github.com/denoland/deno" },
];

type Step = "idle" | "fetching" | "generating" | "done" | "error";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [scenario, setScenario] = useState<VideoScenario | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!repoUrl.trim()) return;

    setStep("fetching");
    setError("");
    setScenario(null);

    try {
      setStep("generating");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: repoUrl.trim(), prompt: prompt.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setScenario(data.scenario);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  };

  const isLoading = step === "fetching" || step === "generating";

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-white/60 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Powered by Claude AI + Remotion
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
            Promo Video
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              in Seconds
            </span>
          </h1>
          <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto">
            GitHub リポジトリのURLを貼るだけ。AIが自動でプロモーション動画を生成します。
          </p>
        </div>

        {/* Input Form */}
        <div className="w-full max-w-2xl space-y-4">
          {/* URL Input */}
          <div className="flex gap-3">
            <input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleGenerate()}
              disabled={isLoading}
              className="flex-1 px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !repoUrl.trim()}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:from-indigo-400 hover:to-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  生成中...
                </span>
              ) : (
                "生成する"
              )}
            </button>
          </div>

          {/* Custom Prompt */}
          <textarea
            placeholder="（任意）動画の指示: 例「複数のXアカウントを自動投稿できるところをわかりやすく印象的に伝えて」"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            rows={2}
            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none disabled:opacity-50"
          />

          {/* Example Repos */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/30">例:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.url}
                onClick={() => setRepoUrl(ex.url)}
                className="px-3 py-1 text-xs rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <div className="space-y-1">
                <p className="text-white font-medium">
                  {step === "fetching"
                    ? "リポジトリ情報を取得中..."
                    : "AIが動画シナリオを生成中..."}
                </p>
                <p className="text-sm text-white/40">10〜15秒ほどかかります</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="mt-8 px-6 py-4 rounded-xl bg-red-500/10 border border-red-500/20 max-w-2xl w-full">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setStep("idle")}
              className="mt-2 text-sm text-red-300 underline hover:text-red-200"
            >
              やり直す
            </button>
          </div>
        )}

        {/* Result */}
        {step === "done" && scenario && (
          <div className="mt-12 w-full max-w-[960px] space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {scenario.meta.repoName}
              </h2>
              <button
                onClick={() => {
                  setStep("idle");
                  setScenario(null);
                }}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:text-white hover:border-white/30 transition"
              >
                新しく作る
              </button>
            </div>

            <VideoPreview scenario={scenario} />

            {/* Scenario JSON (collapsible) */}
            <details className="group">
              <summary className="cursor-pointer text-sm text-white/40 hover:text-white/60 transition">
                シナリオ JSON を表示
              </summary>
              <pre className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 overflow-auto max-h-80">
                {JSON.stringify(scenario, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-white/20">
        Built with Remotion + Claude AI + Next.js
      </footer>
    </main>
  );
}
