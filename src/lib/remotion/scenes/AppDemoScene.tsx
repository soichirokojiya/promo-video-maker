import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { AppDemoSceneConfig, AppDemoStep, AppDemoElement } from "@/lib/types/scenario";

// --- 各UIエレメントのレンダリング ---
const RenderElement: React.FC<{
  el: AppDemoElement;
  index: number;
  isClickTarget: boolean;
  isClicked: boolean;
  primaryColor: string;
}> = ({ el, index, isClickTarget, isClicked, primaryColor }) => {
  const highlight = isClickTarget
    ? isClicked
      ? { boxShadow: `0 0 0 3px ${primaryColor}`, transform: "scale(0.97)" }
      : { boxShadow: `0 0 0 2px ${primaryColor}40` }
    : {};

  const baseStyle: React.CSSProperties = {
    transition: "all 0.15s",
    ...highlight,
  };

  switch (el.type) {
    case "button":
      return (
        <div
          style={{
            ...baseStyle,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 24px",
            background: el.color || primaryColor,
            color: "white",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "system-ui",
            cursor: "pointer",
          }}
        >
          {el.label}
        </div>
      );

    case "input":
      return (
        <div
          style={{
            ...baseStyle,
            padding: "10px 14px",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: 8,
            fontSize: 14,
            color: el.value ? "#333" : "#aaa",
            fontFamily: "system-ui",
            minWidth: 200,
          }}
        >
          {el.value || el.label}
        </div>
      );

    case "card":
      return (
        <div
          style={{
            ...baseStyle,
            padding: "16px 20px",
            background: "white",
            border: "1px solid #e8e8e8",
            borderRadius: 12,
            fontFamily: "system-ui",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 4 }}>
            {el.label}
          </div>
          {el.value && (
            <div style={{ fontSize: 13, color: "#888" }}>{el.value}</div>
          )}
        </div>
      );

    case "stat-card":
      return (
        <div
          style={{
            ...baseStyle,
            padding: "16px 20px",
            background: `${el.color || primaryColor}08`,
            border: `1px solid ${el.color || primaryColor}20`,
            borderRadius: 12,
            textAlign: "center",
            minWidth: 130,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: el.color || primaryColor,
              fontFamily: "system-ui",
            }}
          >
            {el.value || "0"}
          </div>
          <div style={{ fontSize: 12, color: "#888", fontFamily: "system-ui", marginTop: 2 }}>
            {el.label}
          </div>
        </div>
      );

    case "toggle":
      return (
        <div
          style={{
            ...baseStyle,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 0",
          }}
        >
          <div
            style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              background: el.active ? primaryColor : "#ccc",
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "white",
                position: "absolute",
                top: 2,
                left: el.active ? 20 : 2,
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </div>
          <span style={{ fontSize: 14, color: "#333", fontFamily: "system-ui" }}>
            {el.label}
          </span>
        </div>
      );

    case "table-row":
      return (
        <div
          style={{
            ...baseStyle,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            background: index % 2 === 0 ? "#fafafa" : "white",
            borderBottom: "1px solid #f0f0f0",
            fontSize: 14,
            fontFamily: "system-ui",
          }}
        >
          <span style={{ color: "#333", fontWeight: 500 }}>{el.label}</span>
          <span style={{ color: "#888" }}>{el.value || ""}</span>
        </div>
      );

    case "list-item":
      return (
        <div
          style={{
            ...baseStyle,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            borderBottom: "1px solid #f5f5f5",
            fontSize: 14,
            fontFamily: "system-ui",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: el.active ? primaryColor : "#ccc",
              flexShrink: 0,
            }}
          />
          <span style={{ color: "#333" }}>{el.label}</span>
          {el.value && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: "#888",
                background: "#f5f5f5",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              {el.value}
            </span>
          )}
        </div>
      );

    case "progress-bar":
      const pct = parseInt(el.value || "50");
      return (
        <div style={{ ...baseStyle, padding: "8px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              fontFamily: "system-ui",
              marginBottom: 6,
            }}
          >
            <span style={{ color: "#333" }}>{el.label}</span>
            <span style={{ color: "#888" }}>{el.value}%</span>
          </div>
          <div
            style={{
              height: 6,
              background: "#e8e8e8",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: el.color || primaryColor,
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      );

    case "image-placeholder":
      return (
        <div
          style={{
            ...baseStyle,
            width: "100%",
            height: 120,
            background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)`,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px dashed ${primaryColor}30`,
          }}
        >
          <span style={{ fontSize: 13, color: "#aaa", fontFamily: "system-ui" }}>
            {el.label}
          </span>
        </div>
      );

    case "text-block":
    default:
      return (
        <div
          style={{
            ...baseStyle,
            fontSize: 14,
            color: "#555",
            fontFamily: "system-ui",
            lineHeight: 1.6,
            padding: "4px 0",
          }}
        >
          {el.label}
        </div>
      );
  }
};

// --- メインコンポーネント ---
export const AppDemoScene: React.FC<{
  config: AppDemoSceneConfig;
  primaryColor: string;
  secondaryColor: string;
}> = ({ config, primaryColor, secondaryColor }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const totalFrames = Math.round(config.durationSeconds * fps);
  const stepCount = config.steps.length;
  const framesPerStep = Math.floor(totalFrames / stepCount);

  const currentStepIndex = Math.min(
    Math.floor(frame / framesPerStep),
    stepCount - 1
  );
  const stepFrame = frame - currentStepIndex * framesPerStep;
  const step = config.steps[currentStepIndex];

  // ステップ切り替え時のフェード
  const stepOpacity = interpolate(stepFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // カーソルアニメーション
  const hasClick = step.clickTarget !== undefined && step.clickTarget >= 0;
  const clickFrame = Math.floor(framesPerStep * 0.5); // ステップの半分でクリック
  const isClicked = hasClick && stepFrame > clickFrame;

  // カーソル位置を計算（クリック対象に向かって移動）
  const contentCount = step.content.length;
  const targetIdx = step.clickTarget ?? 0;
  // クリック対象の位置に基づいてカーソル位置を推定
  const targetY = 200 + targetIdx * 55;
  const targetX = step.sidebar ? 500 : 400;

  const cursorX = hasClick
    ? interpolate(stepFrame, [10, clickFrame - 5], [300, targetX], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 300;
  const cursorY = hasClick
    ? interpolate(stepFrame, [10, clickFrame - 5], [250, targetY], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 250;

  // クリックパルス
  const clickPulseOpacity =
    isClicked && stepFrame < clickFrame + 15
      ? interpolate(stepFrame, [clickFrame, clickFrame + 15], [1, 0], {
          extrapolateRight: "clamp",
        })
      : 0;
  const clickPulseScale =
    isClicked && stepFrame < clickFrame + 15
      ? interpolate(stepFrame, [clickFrame, clickFrame + 15], [0.5, 1.5], {
          extrapolateRight: "clamp",
        })
      : 0;

  // トースト / モーダル表示
  const showAfterClick =
    isClicked && step.afterClickChanges && stepFrame > clickFrame + 10;
  const afterClickOpacity = showAfterClick
    ? interpolate(
        stepFrame,
        [clickFrame + 10, clickFrame + 20],
        [0, 1],
        { extrapolateRight: "clamp" }
      )
    : 0;
  const afterClickY = showAfterClick
    ? spring({
        frame: stepFrame - clickFrame - 10,
        fps,
        from: 20,
        to: 0,
        durationInFrames: 15,
      })
    : 20;

  // ブラウザウィンドウのスケール
  const browserScale = spring({
    frame: Math.min(frame, 20),
    fps,
    from: 0.95,
    to: 1,
    durationInFrames: 20,
  });

  return (
    <AbsoluteFill
      style={{
        background: "#f0f2f5",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* ブラウザウィンドウ */}
      <div
        style={{
          transform: `scale(${browserScale})`,
          width: 1400,
          height: 800,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 25px 80px rgba(0,0,0,0.12)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ブラウザバー */}
        <div
          style={{
            height: 44,
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 8,
            borderBottom: "1px solid #e8e8e8",
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          <div
            style={{
              marginLeft: 16,
              background: "white",
              borderRadius: 6,
              padding: "5px 16px",
              fontSize: 13,
              color: "#888",
              flex: 1,
              maxWidth: 500,
              border: "1px solid #e8e8e8",
              fontFamily: "system-ui",
            }}
          >
            {config.browserUrl}
          </div>
        </div>

        {/* アプリ本体 */}
        <div style={{ display: "flex", height: "calc(100% - 44px)", opacity: stepOpacity }}>
          {/* サイドバー */}
          {step.sidebar && (
            <div
              style={{
                width: 220,
                background: "#1a1a2e",
                padding: "20px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                flexShrink: 0,
              }}
            >
              {step.sidebar.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    color: i === step.sidebar!.activeIndex ? "white" : "rgba(255,255,255,0.45)",
                    fontSize: 14,
                    padding: "10px 14px",
                    borderRadius: 8,
                    background:
                      i === step.sidebar!.activeIndex
                        ? `${primaryColor}30`
                        : "transparent",
                    fontFamily: "system-ui",
                    fontWeight: i === step.sidebar!.activeIndex ? 600 : 400,
                    borderLeft:
                      i === step.sidebar!.activeIndex
                        ? `3px solid ${primaryColor}`
                        : "3px solid transparent",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* メインコンテンツ */}
          <div style={{ flex: 1, padding: 28, overflow: "hidden" }}>
            {/* ヘッダー */}
            {step.header && (
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  fontFamily: "system-ui",
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                {step.header}
              </div>
            )}

            {/* コンテンツ要素 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {step.content.map((el, i) => (
                <RenderElement
                  key={i}
                  el={el}
                  index={i}
                  isClickTarget={hasClick && i === step.clickTarget}
                  isClicked={hasClick && i === step.clickTarget && isClicked}
                  primaryColor={primaryColor}
                />
              ))}
            </div>
          </div>
        </div>

        {/* トースト通知 */}
        {step.afterClickChanges?.type === "toast" && (
          <div
            style={{
              position: "absolute",
              top: 60,
              right: 20,
              opacity: afterClickOpacity,
              transform: `translateY(${afterClickY}px)`,
              background: "#1a1a2e",
              color: "white",
              padding: "12px 24px",
              borderRadius: 10,
              fontSize: 14,
              fontFamily: "system-ui",
              fontWeight: 500,
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              zIndex: 10,
            }}
          >
            <span style={{ color: "#28c840" }}>✓</span>
            {step.afterClickChanges.text}
          </div>
        )}

        {/* モーダル */}
        {step.afterClickChanges?.type === "modal" && showAfterClick && (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                top: 44,
                background: "rgba(0,0,0,0.3)",
                opacity: afterClickOpacity,
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, calc(-50% + ${afterClickY}px))`,
                opacity: afterClickOpacity,
                background: "white",
                borderRadius: 16,
                padding: "32px 40px",
                minWidth: 400,
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                zIndex: 10,
                textAlign: "center",
                fontFamily: "system-ui",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 600, color: "#333", marginBottom: 8 }}>
                {step.afterClickChanges.text}
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 16,
                  padding: "8px 24px",
                  background: primaryColor,
                  color: "white",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                OK
              </div>
            </div>
          </>
        )}

        {/* 画面更新エフェクト */}
        {step.afterClickChanges?.type === "update" && showAfterClick && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: `translateX(-50%) translateY(${afterClickY}px)`,
              opacity: afterClickOpacity,
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: "white",
              padding: "10px 28px",
              borderRadius: 50,
              fontSize: 14,
              fontFamily: "system-ui",
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              zIndex: 10,
            }}
          >
            {step.afterClickChanges.text}
          </div>
        )}
      </div>

      {/* カーソル */}
      {hasClick && (
        <div
          style={{
            position: "absolute",
            left: cursorX,
            top: cursorY,
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
            <path d="M5 3l14 8-6 2-4 6z" fill="white" stroke="#333" strokeWidth="1.2" />
          </svg>
          {clickPulseOpacity > 0 && (
            <div
              style={{
                position: "absolute",
                top: -8,
                left: -8,
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: `2px solid ${primaryColor}`,
                opacity: clickPulseOpacity,
                transform: `scale(${clickPulseScale})`,
              }}
            />
          )}
        </div>
      )}

      {/* キャプション */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: stepOpacity,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(10px)",
          color: "white",
          padding: "12px 32px",
          borderRadius: 50,
          fontSize: 18,
          fontFamily: "system-ui",
          fontWeight: 500,
          whiteSpace: "nowrap",
          zIndex: 15,
        }}
      >
        {step.caption}
      </div>
    </AbsoluteFill>
  );
};
