import React from "react";
import type { GasWar, SandwichAttack } from "../lib/analysis.ts";
import { IconFlame, IconShield, IconCheck } from "./Icons.tsx";

interface Props { wars: GasWar[]; sandwiches: SandwichAttack[]; color: string; }

export function GasWars({ wars, sandwiches }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

      {/* Gas wars */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <IconFlame size={14} color={wars.length > 0 ? "var(--danger)" : "var(--text-3)"} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Contract congestion</span>
          {wars.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
              color: "var(--danger)", background: "var(--danger-dim)",
              border: "1px solid var(--danger-border)",
              borderRadius: 99, padding: "2px 7px",
            }}>
              {wars.length} ACTIVE
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16, lineHeight: 1.5 }}>
          Contracts consuming an above-average share of recent block gas.
        </p>

        {wars.length === 0 ? (
          <EmptyState Icon={IconCheck} text="No congestion detected in recent blocks." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {wars.map((war, i) => (
              <div key={war.contractAddress} style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12, alignItems: "center",
                padding: "12px 16px",
                background: i === 0 ? "var(--danger-dim)" : "var(--surface-2)",
                border: `1px solid ${i === 0 ? "var(--danger-border)" : "var(--border)"}`,
                borderRadius: "var(--r-sm)",
              }}>
                <div>
                  <a
                    href={`https://robinhoodchain.blockscout.com/address/${war.contractAddress}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      fontSize: 13, fontWeight: 600,
                      color: i === 0 ? "var(--danger)" : "var(--text)",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {war.contractName}
                  </a>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3, fontFamily: "var(--mono)" }}>
                    {war.txCount} tx · {Math.round(war.pctOfBlock)}% of gas · {Math.round(war.avgGasPerTx).toLocaleString()} avg gas
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 800, color: i === 0 ? "var(--danger)" : "var(--text-2)" }}>
                    {war.txCount}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>txs</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MEV sandwiches */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <IconShield size={14} color={sandwiches.length > 0 ? "var(--high)" : "var(--text-3)"} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>MEV sandwiches</span>
          {sandwiches.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
              color: "var(--high)", background: "var(--high-dim)",
              border: "1px solid var(--high-border)",
              borderRadius: 99, padding: "2px 7px",
            }}>
              {sandwiches.length} FOUND
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16, lineHeight: 1.5 }}>
          Front-run and back-run patterns detected in recent blocks.
        </p>

        {sandwiches.length === 0 ? (
          <EmptyState Icon={IconCheck} text="No sandwich attacks detected in recent blocks." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sandwiches.map((s, i) => (
              <div key={i} style={{
                padding: "12px 16px",
                background: "var(--high-dim)",
                border: "1px solid var(--high-border)",
                borderRadius: "var(--r-sm)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: "var(--high)" }}>
                    Block {s.blockNumber.toLocaleString()}
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>
                    ~{s.estimatedProfit.toFixed(4)} gwei extracted
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    { label: "Front-run", hash: s.txHashes[0], role: "attacker" },
                    { label: "Victim",    hash: s.txHashes[1], role: "victim" },
                    { label: "Back-run",  hash: s.txHashes[2], role: "attacker" },
                  ].map(({ label, hash, role }) => hash && (
                    <div key={hash} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: role === "victim" ? "var(--high)" : "var(--text-3)",
                        minWidth: 64,
                      }}>
                        {label}
                      </span>
                      <a
                        href={`https://robinhoodchain.blockscout.com/tx/${hash}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontFamily: "var(--mono)", fontSize: 11, color: role === "victim" ? "var(--high)" : "var(--text-3)" }}
                      >
                        {hash.slice(0, 12)}…{hash.slice(-6)}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ Icon, text }: { Icon: any; text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "16px",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)",
      color: "var(--text-3)", fontSize: 12,
    }}>
      <Icon size={12} color="var(--low)" />
      {text}
    </div>
  );
}
