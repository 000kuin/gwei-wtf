import React from "react";
import type { BlockInfo } from "../lib/rpc.ts";
import { IconBox, IconExternalLink } from "./Icons.tsx";

interface Props { blocks: BlockInfo[]; level: string; }

const LEVEL_COLORS: Record<string, string> = {
  low: "var(--low)", normal: "var(--normal)", high: "var(--high)", very_high: "var(--danger)",
};

function blockColor(gwei: number, avg: number): string {
  const r = gwei / avg;
  if (r <= 0.8)  return "var(--low)";
  if (r <= 1.1)  return "var(--normal)";
  if (r <= 1.5)  return "var(--high)";
  return "var(--danger)";
}

export function BlockFeed({ blocks, level }: Props) {
  if (blocks.length === 0) return null;
  const avg = blocks.reduce((s, b) => s + b.baseFeeGwei, 0) / blocks.length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
        <IconBox size={14} color="var(--text-3)" />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Recent blocks</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {blocks.map((b, i) => {
          const c = blockColor(b.baseFeeGwei, avg);
          const util = Math.round((b.gasUsed / b.gasLimit) * 100);
          const age = blocks[0] ? Math.round(blocks[0].timestamp - b.timestamp) : 0;
          return (
            <a
              key={b.number}
              href={`https://robinhoodchain.blockscout.com/block/${b.number}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto auto",
                gap: 10, alignItems: "center",
                padding: "8px 12px",
                background: i === 0 ? `${c}0d` : "var(--surface-2)",
                border: `1px solid ${i === 0 ? c + "33" : "var(--border)"}`,
                borderRadius: "var(--r-sm)",
                textDecoration: "none",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = c + "55"}
              onMouseLeave={e => e.currentTarget.style.borderColor = i === 0 ? c + "33" : "var(--border)"}
            >
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: i === 0 ? c : "var(--text-2)", minWidth: 72 }}>
                {b.number.toLocaleString()}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 3, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${util}%`, height: "100%", background: c, borderRadius: 99, opacity: 0.7 }} />
                </div>
                <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)", minWidth: 28, textAlign: "right" }}>{util}%</span>
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: c, minWidth: 80, textAlign: "right" }}>
                {b.baseFeeGwei.toFixed(4)}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", minWidth: 36, textAlign: "right" }}>
                {b.txCount}tx
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", minWidth: 28, textAlign: "right" }}>
                {age === 0 ? "now" : `${age}s`}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
