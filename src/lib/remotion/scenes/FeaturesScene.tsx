import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";
import { FeaturesSceneConfig } from "@/lib/types/scenario";

export const FeaturesScene: React.FC<{
  config: FeaturesSceneConfig;
  primaryColor: string;
  backgroundColor: string;
}> = ({ config, primaryColor, backgroundColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headingOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const headingY = spring({ frame, fps, from: 30, to: 0, durationInFrames: 20 });

  return (
    <AbsoluteFill
      style={{
        background: backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ maxWidth: 1200, width: "100%", padding: "0 80px" }}>
        <div
          style={{
            opacity: headingOpacity,
            transform: `translateY(${headingY}px)`,
            fontSize: 48,
            fontWeight: 700,
            color: "white",
            fontFamily: "system-ui, sans-serif",
            marginBottom: 48,
            textAlign: "center",
          }}
        >
          {config.heading}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          {config.items.map((item, i) => {
            const delay = 12 + i * 10;
            const itemX = spring({
              frame: Math.max(0, frame - delay),
              fps,
              from: -60,
              to: 0,
              durationInFrames: 20,
            });
            const itemOpacity = interpolate(
              frame,
              [delay, delay + 12],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  transform: `translateX(${itemX}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 16,
                  padding: "20px 28px",
                  borderLeft: `3px solid ${primaryColor}`,
                }}
              >
                <span style={{ fontSize: 36 }}>{item.emoji}</span>
                <span
                  style={{
                    fontSize: 22,
                    color: "rgba(255,255,255,0.9)",
                    fontFamily: "system-ui, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
