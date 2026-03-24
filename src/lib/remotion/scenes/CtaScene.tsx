import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";
import { CtaSceneConfig } from "@/lib/types/scenario";

export const CtaScene: React.FC<{
  config: CtaSceneConfig;
  primaryColor: string;
  secondaryColor: string;
}> = ({ config, primaryColor, secondaryColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0.6,
    to: 1,
    durationInFrames: 25,
  });
  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });

  const buttonY = spring({
    frame: Math.max(0, frame - 12),
    fps,
    from: 20,
    to: 0,
    durationInFrames: 20,
  });

  // Pulsing glow on button
  const glowOpacity = interpolate(
    frame % 40,
    [0, 20, 40],
    [0.3, 0.6, 0.3]
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: "white",
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginBottom: 32,
            letterSpacing: -1,
          }}
        >
          {config.headline}
        </div>

        <div
          style={{
            transform: `translateY(${buttonY}px)`,
            display: "inline-block",
            position: "relative",
          }}
        >
          {/* Glow effect */}
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: 58,
              background: "white",
              opacity: glowOpacity,
              filter: "blur(20px)",
            }}
          />
          <div
            style={{
              position: "relative",
              background: "white",
              color: primaryColor,
              fontSize: 26,
              fontWeight: 700,
              padding: "18px 56px",
              borderRadius: 50,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {config.buttonText}
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "monospace",
          }}
        >
          {config.repoUrl}
        </div>
      </div>
    </AbsoluteFill>
  );
};
