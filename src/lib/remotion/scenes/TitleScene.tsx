import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { TitleSceneConfig } from "@/lib/types/scenario";

export const TitleScene: React.FC<{
  config: TitleSceneConfig;
  primaryColor: string;
  secondaryColor: string;
}> = ({ config, primaryColor, secondaryColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ frame, fps, from: 50, to: 0, durationInFrames: 25 });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleY = spring({
    frame: Math.max(0, frame - 15),
    fps,
    from: 30,
    to: 0,
    durationInFrames: 25,
  });

  // Subtle background animation
  const bgScale = interpolate(frame, [0, 90], [1, 1.05], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        justifyContent: "center",
        alignItems: "center",
        transform: `scale(${bgScale})`,
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          top: -100,
          right: -100,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
          bottom: -50,
          left: -50,
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            fontSize: 80,
            fontWeight: 800,
            color: "white",
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: -2,
          }}
        >
          {config.title}
        </div>
        <div
          style={{
            transform: `translateY(${subtitleY}px)`,
            opacity: subtitleOpacity,
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginTop: 16,
            fontWeight: 300,
          }}
        >
          {config.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
