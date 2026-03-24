import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";
import { StatsSceneConfig } from "@/lib/types/scenario";

export const StatsScene: React.FC<{
  config: StatsSceneConfig;
  primaryColor: string;
  backgroundColor: string;
}> = ({ config, primaryColor, backgroundColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 40,
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: 1400,
        }}
      >
        {config.stats.map((stat, i) => {
          const delay = i * 8;
          const cardScale = spring({
            frame: Math.max(0, frame - delay),
            fps,
            from: 0.5,
            to: 1,
            durationInFrames: 20,
          });
          const cardOpacity = interpolate(
            frame,
            [delay, delay + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                opacity: cardOpacity,
                transform: `scale(${cardScale})`,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 20,
                padding: "40px 48px",
                textAlign: "center",
                minWidth: 200,
              }}
            >
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 800,
                  color: primaryColor,
                  fontFamily: "system-ui, sans-serif",
                  marginBottom: 8,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
