import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { VideoScenario } from "@/lib/types/scenario";
import { TitleScene } from "./scenes/TitleScene";
import { StatsScene } from "./scenes/StatsScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { CodeScene } from "./scenes/CodeScene";
import { CtaScene } from "./scenes/CtaScene";
import { AppDemoScene } from "./scenes/AppDemoScene";

export const DynamicPromoVideo: React.FC<{ scenario: VideoScenario }> = ({
  scenario,
}) => {
  const { theme, scenes, meta } = scenario;
  const fps = meta.fps;

  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ background: theme.backgroundColor }}>
      {scenes.map((scene, i) => {
        const from = currentFrame;
        const durationInFrames = Math.round(scene.durationSeconds * fps);
        currentFrame += durationInFrames;

        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames}>
            {scene.type === "title" && (
              <TitleScene
                config={scene}
                primaryColor={theme.primaryColor}
                secondaryColor={theme.secondaryColor}
              />
            )}
            {scene.type === "stats" && (
              <StatsScene
                config={scene}
                primaryColor={theme.primaryColor}
                backgroundColor={theme.backgroundColor}
              />
            )}
            {scene.type === "features" && (
              <FeaturesScene
                config={scene}
                primaryColor={theme.primaryColor}
                backgroundColor={theme.backgroundColor}
              />
            )}
            {scene.type === "code" && (
              <CodeScene
                config={scene}
                primaryColor={theme.primaryColor}
                backgroundColor={theme.backgroundColor}
              />
            )}
            {scene.type === "cta" && (
              <CtaScene
                config={scene}
                primaryColor={theme.primaryColor}
                secondaryColor={theme.secondaryColor}
              />
            )}
            {scene.type === "app-demo" && (
              <AppDemoScene
                config={scene}
                primaryColor={theme.primaryColor}
                secondaryColor={theme.secondaryColor}
              />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
