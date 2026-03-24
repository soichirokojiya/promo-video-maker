"use client";

import { useState } from "react";
import { VideoScenario } from "@/lib/types/scenario";
import { VideoPreview } from "@/components/VideoPreview";
import { ImageUpload, UploadedImage } from "@/components/ImageUpload";

const EXAMPLES = [
  { label: "Express.js", url: "https://github.com/expressjs/express" },
  { label: "Next.js", url: "https://github.com/vercel/next.js" },
  { label: "Deno", url: "https://github.com/denoland/deno" },
];

type Step = "idle" | "fetching" | "generating" | "done" | "error" | "revising";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [scenario, setScenario] = useState<VideoScenario | null>(null);
  const [error, setError] = useState("");
  const [revisionInput, setRevisionInput] = useState("");
  const [revisionHistory, setRevisionHistory] = useState<string[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [revisionImages, setRevisionImages] = useState<UploadedImage[]>([]);

  const toApiImages = (imgs: UploadedImage[]) =>
    imgs.map((img) => ({ data: img.data, mediaType: img.mediaType }));

  const handleGenerate = async () => {
    if (!repoUrl.trim()) return;

    setStep("fetching");
    setError("");
    setScenario(null);
    setRevisionHistory([]);

    try {
      setStep("generating");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          prompt: prompt.trim() || undefined,
          images: images.length > 0 ? toApiImages(images) : undefined,
        }),
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

  const handleRevise = async () => {
    if (!revisionInput.trim() || !scenario) return;

    const instruction = revisionInput.trim();
    setStep("revising");
    setError("");

    try {
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          instruction,
          images:
            revisionImages.length > 0
              ? toApiImages(revisionImages)
              : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Revision failed");
      }

      setScenario(data.scenario);
      setRevisionHistory((prev) => [...prev, instruction]);
      setRevisionInput("");
      setRevisionImages([]);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("done");
    }
  };

  const isLoading = step === "fetching" || step === "generating";
  const isRevising = step === "revising";

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Header */}
        {step !== "done" && step !== "revising" && (
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
              GitHub
              リポジトリのURLを貼るだけ。AIが自動でプロモーション動画を生成します。
            </p>
          </div>
        )}

        {/* Input Form */}
        {(step === "idle" ||
          step === "fetching" ||
          step === "generating" ||
          step === "error") && (
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex gap-3">
              <input
                type="url"
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !isLoading && handleGenerate()
                }
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
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                    >
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

            <textarea
              placeholder={
                "動画の指示を自由に書いてください。例:\n• 複数Xアカウントの自動投稿機能を操作デモで見せて\n• タイトルなしで操作画面だけ30秒で\n• ダッシュボード→設定画面→投稿完了の流れを見せて"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none disabled:opacity-50"
            />

            {/* Image Upload */}
            <ImageUpload
              images={images}
              onChange={setImages}
              disabled={isLoading}
            />

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
        )}

        {/* Loading */}
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
                <p className="text-sm text-white/40">
                  {images.length > 0
                    ? "スクショも解析しています...20〜30秒ほどかかります"
                    : "10〜20秒ほどかかります"}
                </p>
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

        {/* Result + Revision */}
        {(step === "done" || step === "revising") && scenario && (
          <div className="w-full max-w-[960px] space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {scenario.meta.repoName}
              </h2>
              <button
                onClick={() => {
                  setStep("idle");
                  setScenario(null);
                  setRevisionHistory([]);
                  setRevisionInput("");
                  setRevisionImages([]);
                }}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:text-white hover:border-white/30 transition"
              >
                新しく作る
              </button>
            </div>

            <VideoPreview scenario={scenario} />

            {/* Revision History */}
            {revisionHistory.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-white/30">修正履歴:</p>
                {revisionHistory.map((rev, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-white/50"
                  >
                    <span className="text-indigo-400 shrink-0">#{i + 1}</span>
                    <span>{rev}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Revision Input */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <p className="text-sm text-white/60 font-medium">修正指示</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="例: 2番目のシーンを長くして / 色を青に / サイドバーのメニューを変えて"
                  value={revisionInput}
                  onChange={(e) => setRevisionInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !isRevising && handleRevise()
                  }
                  disabled={isRevising}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
                />
                <button
                  onClick={handleRevise}
                  disabled={isRevising || !revisionInput.trim()}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:from-indigo-400 hover:to-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isRevising ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                      >
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
                      修正中...
                    </span>
                  ) : (
                    "修正する"
                  )}
                </button>
              </div>

              {/* Image upload for revisions */}
              <ImageUpload
                images={revisionImages}
                onChange={setRevisionImages}
                disabled={isRevising}
              />

              {/* Quick suggestions */}
              <div className="flex gap-2 flex-wrap">
                {[
                  "もっとゆっくり",
                  "色を変えて",
                  "操作画面を増やして",
                  "タイトルを削除",
                  "CTAを追加",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRevisionInput(s)}
                    disabled={isRevising}
                    className="px-3 py-1 text-xs rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {error && step === "done" && (
                <p className="text-red-400 text-xs">{error}</p>
              )}
            </div>

            {/* JSON */}
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

      <footer className="py-6 text-center text-xs text-white/20">
        Built with Remotion + Claude AI + Next.js
      </footer>
    </main>
  );
}
