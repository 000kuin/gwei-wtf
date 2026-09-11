import React, { useState } from "react";
import { fetchWalletGasStats, type WalletGasStats } from "../lib/rpc.ts";
import { IconSearch, IconExternalLink } from "./Icons.tsx";

interface Props { ethPrice: number; color: string; }

export function WalletTracker({ ethPrice, color }: Props) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<WalletGasStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async () => {
    const addr = address.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) { setError("Enter a valid 0x address"); return; }
    setError(null); setLoading(true); setStats(null);
    try { setStats(await fetchWalletGasStats(addr, ethPrice, 200)); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Wallet gas usage</div>
      <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16, lineHeight: 1.5 }}>
        Scan any wallet address to see how much has been spent on gas in recent blocks.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <IconSearch size={13} color="var(--text-3)" />
          </div>
          <input
            type="text" placeholder="0x..."
            value={address}
            onChange={e => { setAddress(e.target.value); setError(null); }}
            onKeyDown={e => e.key === "Enter" && lookup()}
            style={{
              width: "100%", padding: "9px 12px 9px 32px",
              background: "var(--surface-2)",
              border: `1px solid ${error ? "var(--danger-border)" : "var(--border-2)"}`,
              borderRadius: "var(--r-sm)",
              color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13, outline: "none",
            }}
            onFocus={e => e.target.style.borderColor = color}
            onBlur={e => e.target.style.borderColor = error ? "var(--danger-border)" : "var(--border-2)"}
          />
        </div>
        <button
          onClick={lookup} disabled={loading}
          style={{
            padding: "9px 18px",
            background: loading ? "var(--surface-2)" : color,
            color: loading ? "var(--text-2)" : "#000",
            fontWeight: 700, fontSize: 12,
            borderRadius: "var(--r-sm)",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Scanning…" : "Look up"}
        </button>
      </div>

      {error && <div style={{ fontSize: 11, color: "var(--danger)", marginBottom: 10 }}>{error}</div>}
      {loading && <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-3)", fontSize: 12, fontFamily: "var(--mono)" }}>Scanning last 200 blocks…</div>}

      {stats && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Total gas spent", value: `$${stats.totalUsdSpent.toFixed(2)}`, sub: `${stats.totalEthSpent.toFixed(6)} ETH`, accent: true },
              { label: "Transactions",    value: stats.txCount.toString(),                sub: "last 200 blocks" },
              { label: "Avg gas price",   value: `${stats.avgGweiPaid.toFixed(4)}`,      sub: "gwei per tx" },
            ].map(({ label, value, sub, accent }) => (
              <div key={label} style={{ padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
                <div style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: accent ? 20 : 16, fontWeight: 800, color: accent ? color : "var(--text)", letterSpacing: "-0.03em" }}>{value}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", marginTop: 3 }}>{sub}</div>
              </div>
            ))}
          </div>

          {stats.mostExpensiveTx && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
              padding: "12px 16px",
              background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
            }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>Most expensive tx</div>
                <a
                  href={`https://robinhoodchain.blockscout.com/tx/${stats.mostExpensiveTx.hash}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "var(--mono)", fontSize: 12, color, display: "flex", alignItems: "center", gap: 4 }}
                >
                  {stats.mostExpensiveTx.hash.slice(0, 14)}…{stats.mostExpensiveTx.hash.slice(-6)}
                  <IconExternalLink size={11} color={color} />
                </a>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color }}>${stats.mostExpensiveTx.usdCost.toFixed(4)}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>{stats.mostExpensiveTx.ethCost.toFixed(8)} ETH</div>
              </div>
            </div>
          )}

          {stats.txCount === 0 && (
            <div style={{ padding: "16px", textAlign: "center", color: "var(--text-3)", fontSize: 12, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
              No transactions found for this address in the last 200 blocks.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
