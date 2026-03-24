"use client";

import { Player } from "@remotion/player";
import { DynamicPromoVideo } from "@/lib/remotion/DynamicPromoVideo";
import { VideoScenario } from "@/lib/types/scenario";

export function VideoPreview({ scenario }: { scenario: VideoScenario }) {
  const totalFrames = scenario.scenes.reduce(
    (sum, s) => sum + Math.round(s.durationSeconds * scenario.meta.fps),
    0
  );

  return (
    <div className="w-full max-w-[960px] mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
      <Player
        component={DynamicPromoVideo}
        inputProps={{ scenario }}
        durationInFrames={totalFrames}
        fps={scenario.meta.fps}
        compositionWidth={scenario.meta.width}
        compositionHeight={scenario.meta.height}
        style={{ width: "100%" }}
        controls
        autoPlay
        loop
      />
    </div>
  );
}
