import React, { useState } from "react";
import { estimateCost } from "../lib/rpc.ts";
import { IconBarChart } from "./Icons.tsx";

const PRESETS = [
  { label: "ETH Transfer",     gas: 21_000  },
  { label: "ERC-20 Transfer",  gas: 65_000  },
  { label: "Token Swap",       gas: 150_000 },
  { label: "Stock Token Mint", gas: 180_000 },
  { label: "Bridge Out",       gas: 250_000 },
  { label: "NFT Mint",         gas: 120_000 },
  { label: "Contract Deploy",  gas: 500_000 },
  { label: "Custom",           gas: 0       },
];

interface Props { gasPriceGwei: number; ethPrice: number; level: string; }

const LEVEL_COLORS: Record<string, string> = {
  low: "var(--low)", normal: "var(--normal)", high: "var(--high)", very_high: "var(--danger)",
};

export function Calculator({ gasPriceGwei, ethPrice, level }: Props) {
  const [selected, setSelected] = useState(2);
  const [customGas, setCustomGas] = useState("150000");
  const color = LEVEL_COLORS[level] ?? "var(--low)";

  const gasLimit = selected === PRESETS.length - 1 ? parseInt(customGas) || 0 : PRESETS[selected].gas;
  const usdCost  = estimateCost(gasLimit, gasPriceGwei, ethPrice);
  const ethCost  = (gasLimit * gasPriceGwei * 1e9) / 1e18;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
        <IconBarChart size={14} color="var(--text-3)" />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Cost estimator</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setSelected(i)}
            style={{
              padding: "8px 10px",
              borderRadius: "var(--r-sm)",
              border: `1px solid ${selected === i ? color + "55" : "var(--border)"}`,
              background: selected === i ? `${color}10` : "var(--surface-2)",
              color: selected === i ? color : "var(--text-2)",
              fontSize: 12, fontWeight: selected === i ? 600 : 400,
              cursor: "pointer", textAlign: "left",
              transition: "all 0.1s",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {selected === PRESETS.length - 1 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Gas limit</div>
          <input
            type="number" value={customGas}
            onChange={e => setCustomGas(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px",
              background: "var(--surface-2)", border: "1px solid var(--border-2)",
              borderRadius: "var(--r-sm)", color: "var(--text)",
              fontFamily: "var(--mono)", fontSize: 13, outline: "none",
            }}
          />
        </div>
      )}

      <div style={{
        padding: "16px 18px",
        background: `${color}0d`, border: `1px solid ${color}28`,
        borderRadius: "var(--r-sm)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>Estimated cost</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 32, fontWeight: 900, color, letterSpacing: "-0.04em", lineHeight: 1 }}>
            ${usdCost < 0.0001 ? usdCost.toExponential(2) : usdCost < 0.01 ? usdCost.toFixed(6) : usdCost.toFixed(4)}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>
            {ethCost.toFixed(8)} ETH · {gasLimit.toLocaleString()} gas · {gasPriceGwei.toFixed(4)} gwei
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>ETH / USD</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: "var(--text-2)" }}>
            ${ethPrice.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
