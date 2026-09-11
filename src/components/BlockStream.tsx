import React, { useEffect, useRef, useState } from "react";
import type { BlockInfo } from "../lib/rpc.ts";

interface Props { blocks: BlockInfo[]; level: string; }

const COLORS: Record<string, string> = {
  low: "var(--low)", normal: "var(--normal)", high: "var(--high)", very_high: "var(--danger)",
};

function blockColor(gwei: number, avg: number) {
  const r = gwei / avg;
  if (r <= 0.8) return "var(--low)";
  if (r <= 1.1) return "var(--normal)";
  if (r <= 1.5) return "var(--high)";
  return "var(--danger)";
}

export function BlockStream({ blocks, level }: Props) {
  const [visible, setVisible] = useState<BlockInfo[]>([]);
  const prevTop = useRef<number | null>(null);
  const accentColor = COLORS[level] ?? "var(--low)";

  useEffect(() => {
    if (!blocks[0]) return;
    if (prevTop.current !== blocks[0].number) {
      prevTop.current = blocks[0].number;
      setVisible([...blocks]);
    }
  }, [blocks]);

  if (visible.length === 0) return null;

  const avg = visible.reduce((s, b) => s + b.baseFeeGwei, 0) / visible.length;

  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Live blocks
          </span>
          <span style={{
            display: "inline-block", width: 5, height: 5, borderRadius: "50%",
            background: accentColor,
            boxShadow: `0 0 6px ${accentColor}`,
            animation: "glow-pulse 2s infinite",
          }} />
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>
          avg {avg.toFixed(4)} gwei
        </span>
      </div>

      {/* Header row */}
      <div style={{
        display: "grid", gridTemplateColumns: "100px 1fr 80px 44px 36px",
        gap: 8, padding: "0 0 6px",
        borderBottom: "1px solid var(--border)",
        marginBottom: 6,
      }}>
        {["Block", "Utilization", "Base fee", "Txs", "Age"].map(h => (
          <span key={h} style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--mono)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            {h}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {visible.map((b, i) => {
          const c    = blockColor(b.baseFeeGwei, avg);
          const util = Math.round((b.gasUsed / b.gasLimit) * 100);
          const age  = visible[0] ? Math.max(0, Math.round(visible[0].timestamp - b.timestamp)) : 0;
          return (
            <a
              key={b.number}
              href={`https://robinhoodchain.blockscout.com/block/${b.number}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 80px 44px 36px",
                gap: 8, alignItems: "center",
                padding: "7px 10px",
                borderRadius: "var(--r-sm)",
                background: i === 0 ? `${c}0c` : "transparent",
                border: `1px solid ${i === 0 ? c + "28" : "transparent"}`,
                textDecoration: "none",
                transition: "background 0.2s",
                animation: i === 0 ? "slide-in-right 0.3s ease" : "none",
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${c}0c`}
              onMouseLeave={e => e.currentTarget.style.background = i === 0 ? `${c}0c` : "transparent"}
            >
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? c : "var(--text-2)" }}>
                {b.number.toLocaleString()}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 3, background: "var(--surface-3)", borderRadius: 99 }}>
                  <div style={{ width: `${util}%`, height: "100%", background: c, borderRadius: 99, opacity: 0.8, transition: "width 0.3s ease" }} />
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-3)", minWidth: 28, textAlign: "right" }}>{util}%</span>
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: c, textAlign: "right" }}>
                {b.baseFeeGwei.toFixed(4)}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-2)", textAlign: "right" }}>
                {b.txCount}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", textAlign: "right" }}>
                {age === 0 ? "now" : `${age}s`}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
