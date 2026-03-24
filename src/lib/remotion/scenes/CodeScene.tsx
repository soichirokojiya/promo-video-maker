import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { CodeSceneConfig } from "@/lib/types/scenario";

export const CodeScene: React.FC<{
  config: CodeSceneConfig;
  primaryColor: string;
  backgroundColor: string;
}> = ({ config, primaryColor, backgroundColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const codeChars = Math.floor(
    interpolate(frame, [10, 60], [0, config.snippet.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const terminalScale = spring({
    frame,
    fps,
    from: 0.9,
    to: 1,
    durationInFrames: 20,
  });
  const terminalOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  const barOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 60, alignItems: "center", padding: "0 80px" }}>
        {/* Terminal */}
        <div
          style={{
            opacity: terminalOpacity,
            transform: `scale(${terminalScale})`,
            flex: 1,
            maxWidth: 800,
          }}
        >
          <div
            style={{
              background: "#1e1e2e",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Terminal bar */}
            <div
              style={{
                height: 40,
                background: "#181825",
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                gap: 8,
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
              <span
                style={{
                  marginLeft: 12,
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 13,
                  fontFamily: "monospace",
                }}
              >
                {config.language.toLowerCase()}
              </span>
            </div>
            {/* Code */}
            <pre
              style={{
                padding: 28,
                margin: 0,
                fontSize: 18,
                lineHeight: 1.6,
                color: "#cdd6f4",
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                whiteSpace: "pre-wrap",
                minHeight: 160,
              }}
            >
              {config.snippet.slice(0, codeChars)}
              <span
                style={{
                  opacity: frame % 30 < 15 ? 1 : 0,
                  color: primaryColor,
                }}
              >
                |
              </span>
            </pre>
          </div>
        </div>

        {/* Language breakdown */}
        <div style={{ opacity: barOpacity, minWidth: 300 }}>
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.6)",
              fontFamily: "system-ui, sans-serif",
              marginBottom: 20,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Languages
          </div>
          {config.languageBreakdown.slice(0, 5).map((lang, i) => {
            const barWidth = interpolate(
              frame,
              [55 + i * 5, 70 + i * 5],
              [0, lang.percentage],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div key={i} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 16,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {lang.name}
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 14,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {lang.percentage}%
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barWidth}%`,
                      background: lang.color,
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
