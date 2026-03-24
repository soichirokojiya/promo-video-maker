"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { VideoScenario } from "@/lib/types/scenario";
import { VideoPreview } from "@/components/VideoPreview";

function PreviewContent() {
  const searchParams = useSearchParams();
  const [scenario, setScenario] = useState<VideoScenario | null>(null);

  useEffect(() => {
    // Read from sessionStorage
    const stored = sessionStorage.getItem("promo-scenario");
    if (stored) {
      try {
        setScenario(JSON.parse(stored));
      } catch {}
    }
  }, [searchParams]);

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        シナリオが見つかりません
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] p-8">
      <h1 className="text-2xl font-bold text-white mb-6">
        {scenario.meta.repoName}
      </h1>
      <VideoPreview scenario={scenario} />
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white/50">
          読み込み中...
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
