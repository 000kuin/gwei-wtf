import React, { useState } from "react";
import { fetchWalletGasStats } from "../lib/rpc.ts";
import { IconShare2, IconCopy, IconCheck } from "./Icons.tsx";

interface Props { ethPrice: number; color: string; }

export function GasReport({ ethPrice, color }: Props) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<null | { address: string; totalUsd: number; totalEth: number; txCount: number; avgGwei: number }>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    const addr = address.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) { setError("Enter a valid 0x address"); return; }
    setError(null); setLoading(true);
    try {
      const s = await fetchWalletGasStats(addr, ethPrice, 500);
      setReport({ address: addr, totalUsd: s.totalUsdSpent, totalEth: s.totalEthSpent, txCount: s.txCount, avgGwei: s.avgGweiPaid });
    } catch { setError("Failed to fetch wallet data"); }
    finally { setLoading(false); }
  };

  const shareText = report
    ? `My Robinhood Chain gas report:\n$${report.totalUsd.toFixed(2)} spent · ${report.txCount} txs · avg ${report.avgGwei.toFixed(4)} gwei\n\nCheck yours at gwei.wtf`
    : "";

  const copy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Gas report</div>
      <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16, lineHeight: 1.5 }}>
        Generate a shareable summary of your gas spend on Robinhood Chain.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="text" placeholder="0x... your wallet"
          value={address}
          onChange={e => { setAddress(e.target.value); setError(null); }}
          onKeyDown={e => e.key === "Enter" && generate()}
          style={{
            flex: 1, padding: "9px 12px",
            background: "var(--surface-2)",
            border: `1px solid ${error ? "var(--danger-border)" : "var(--border-2)"}`,
            borderRadius: "var(--r-sm)",
            color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13, outline: "none",
          }}
          onFocus={e => e.target.style.borderColor = color}
          onBlur={e => e.target.style.borderColor = error ? "var(--danger-border)" : "var(--border-2)"}
        />
        <button
          onClick={generate} disabled={loading}
          style={{
            padding: "9px 16px",
            background: loading ? "var(--surface-2)" : color,
            color: loading ? "var(--text-2)" : "#000",
            fontWeight: 700, fontSize: 12, borderRadius: "var(--r-sm)",
            border: "none", cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
          }}
        >
          {loading ? "Scanning…" : "Generate"}
        </button>
      </div>

      {error && <div style={{ fontSize: 11, color: "var(--danger)", marginBottom: 10 }}>{error}</div>}

      {report && (
        <div style={{
          background: "var(--bg-2)",
          border: `1px solid ${color}33`,
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${color}18`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-0.02em" }}>gwei.wtf Report</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>
              Robinhood Chain · {new Date().toLocaleDateString()}
            </span>
          </div>

          {/* Address */}
          <div style={{ padding: "10px 18px 0", fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>
            {report.address.slice(0, 10)}…{report.address.slice(-8)}
          </div>

          {/* Main stat */}
          <div style={{ padding: "10px 18px 16px" }}>
            <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>Total gas spent</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 44, fontWeight: 900, color, letterSpacing: "-0.04em", lineHeight: 1 }}>
              ${report.totalUsd < 0.01 ? report.totalUsd.toFixed(6) : report.totalUsd.toFixed(2)}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
              {report.totalEth.toFixed(8)} ETH
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: `1px solid ${color}18` }}>
            {[
              { label: "Transactions", value: report.txCount.toString() },
              { label: "Avg gas price", value: `${report.avgGwei.toFixed(4)} gwei` },
              { label: "ETH/USD", value: `$${ethPrice.toLocaleString()}` },
            ].map(({ label, value }, i) => (
              <div key={label} style={{ padding: "11px 14px", borderRight: i < 2 ? `1px solid ${color}18` : "none" }}>
                <div style={{ fontSize: 9, color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "10px 18px", borderTop: `1px solid ${color}18`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--mono)" }}>gwei.wtf · last 500 blocks</span>
            <button
              onClick={copy}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px",
                background: copied ? "var(--low-dim)" : `${color}18`,
                border: `1px solid ${copied ? "var(--low-border)" : color + "33"}`,
                borderRadius: "var(--r-sm)",
                color: copied ? "var(--low)" : color,
                fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}
            >
              {copied ? <IconCheck size={11} color="var(--low)" /> : <IconCopy size={11} color={color} />}
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
