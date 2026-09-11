import React from "react";
import type { SpikeReason } from "../lib/analysis.ts";
import { IconAlertTriangle, IconCheck, IconFlame } from "./Icons.tsx";

interface Props { spike: SpikeReason; color: string; }

const SEVERITY_STYLES = {
  none:     { bg: "transparent", border: "transparent", labelColor: "var(--low)",    Icon: IconCheck },
  mild:     { bg: "var(--normal-dim)", border: "var(--normal-border)", labelColor: "var(--normal)", Icon: IconAlertTriangle },
  moderate: { bg: "var(--high-dim)",   border: "var(--high-border)",   labelColor: "var(--high)",   Icon: IconFlame },
  severe:   { bg: "var(--danger-dim)", border: "var(--danger-border)", labelColor: "var(--danger)", Icon: IconFlame },
};

export function SpikeDetector({ spike }: Props) {
  if (!spike.detected) return null;

  const s = SEVERITY_STYLES[spike.severity];
  const Icon = s.Icon;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 18px",
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: "var(--r)", marginBottom: 0,
    }}>
      <Icon size={14} color={s.labelColor} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: "var(--text-2)", flex: 1, lineHeight: 1.4 }}>
        {spike.explanation}
      </span>
      {spike.topContract && (
        <a
          href={`https://robinhoodchain.blockscout.com/address/${spike.topContract}`}
          target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "var(--mono)", fontSize: 11, color: s.labelColor, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {spike.topContract.slice(0, 8)}…{spike.topContract.slice(-4)} ↗
        </a>
      )}
      {spike.pctChange > 0 && (
        <span style={{
          fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700,
          color: s.labelColor,
          background: `${s.labelColor}18`,
          border: `1px solid ${s.labelColor}33`,
          borderRadius: 99, padding: "2px 9px", flexShrink: 0,
        }}>
          +{Math.round(spike.pctChange)}%
        </span>
      )}
    </div>
  );
}
