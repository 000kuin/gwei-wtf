import React, { useState } from "react";
import type { BlockInfo } from "../lib/rpc.ts";
import { recommendPriorityFee } from "../lib/rpc.ts";
import { IconCopy, IconCheck, IconZap } from "./Icons.tsx";

interface Props {
  current: { baseFeeGwei: number; priorityFeeGwei: number; gasPriceGwei: number };
  recentBlocks: BlockInfo[];
  color: string;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 12, color: "var(--text-2)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)" }}>
          {value.length > 28 ? value.slice(0, 26) + "…" : value}
        </span>
        <button
          onClick={copy}
          style={{
            display: "flex", alignItems: "center", gap: 3,
            padding: "3px 8px", borderRadius: "var(--r-sm)",
            border: "1px solid var(--border)", background: copied ? "var(--low-dim)" : "var(--surface-2)",
            color: copied ? "var(--low)" : "var(--text-3)",
            fontSize: 10, cursor: "pointer", fontFamily: "var(--mono)",
          }}
        >
          {copied ? <IconCheck size={10} color="var(--low)" /> : <IconCopy size={10} />}
          {copied ? "OK" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function PriorityFees({ current, recentBlocks, color }: Props) {
  const tips = recommendPriorityFee(recentBlocks);
  const total = (tip: number) => (current.baseFeeGwei + tip).toFixed(5);

  const basePct = current.baseFeeGwei / (current.baseFeeGwei + current.priorityFeeGwei + 0.00001);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
        <IconZap size={14} color={color} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Fee breakdown</span>
      </div>

      {/* Base vs tip visual */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ height: 6, display: "flex", borderRadius: 99, overflow: "hidden", gap: 1, marginBottom: 8 }}>
          <div style={{ flex: basePct, background: color, borderRadius: "99px 0 0 99px" }} />
          <div style={{ flex: 1 - basePct, background: "var(--text-3)", borderRadius: "0 99px 99px 0", opacity: 0.5 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-3)" }}>
          <span>Base <span style={{ color }}>{current.baseFeeGwei.toFixed(5)}</span> (burned)</span>
          <span>Tip <span style={{ color: "var(--text-2)" }}>{current.priorityFeeGwei.toFixed(5)}</span> (validator)</span>
        </div>
      </div>

      {/* Speed tiers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {[
          { label: "Slow",   tip: tips.slow,   time: "~30s" },
          { label: "Normal", tip: tips.normal, time: "~10s" },
          { label: "Fast",   tip: tips.fast,   time: "~3s" },
        ].map(({ label, tip, time }) => (
          <div key={label} style={{ padding: "12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
            <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color, marginBottom: 2 }}>{total(tip)}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>+{tip.toFixed(5)} tip · {time}</div>
          </div>
        ))}
      </div>

      {/* Dev quick-copy */}
      <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>Quick copy</div>
      <div>
        {[
          { label: "Chain ID",        value: "4663" },
          { label: "RPC URL",         value: "https://rpc.mainnet.chain.robinhood.com" },
          { label: "Block explorer",  value: "https://robinhoodchain.blockscout.com" },
          { label: "Max fee (fast)",  value: total(tips.fast) },
          { label: "Priority (fast)", value: tips.fast.toFixed(6) },
        ].map(row => <CopyRow key={row.label} {...row} />)}
      </div>
    </div>
  );
}
