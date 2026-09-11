import React, { useEffect, useRef } from "react";
import type { GasData, GasLevel } from "../hooks/useGas.ts";
import { estimateCost } from "../lib/rpc.ts";
import { RollingNumber } from "./RollingNumber.tsx";
import { LiveDot, IconTrendingUp, IconTrendingDown } from "./Icons.tsx";

const LEVEL = {
  low:       { color: "var(--low)",    glow: "var(--low-glow)",    border: "var(--low-border)",    verdict: "GO",   tag: "Low",      sub: "Below 24h average — ideal time to transact." },
  normal:    { color: "var(--normal)", glow: "var(--normal-glow)", border: "var(--normal-border)", verdict: "OK",   tag: "Normal",   sub: "At average fee levels. Safe to proceed." },
  high:      { color: "var(--high)",   glow: "var(--high-glow)",   border: "var(--high-border)",   verdict: "WAIT", tag: "Elevated", sub: "Above average. Consider waiting." },
  very_high: { color: "var(--danger)", glow: "var(--danger-glow)", border: "var(--danger-border)", verdict: "HOLD", tag: "Congested","sub": "Significant spike. Wait if not urgent." },
};

interface Props {
  current: GasData;
  smoothedGwei: number;
  level: GasLevel;
  avg24h: number;
  percentileRank: number;
  ethPrice: number;
  lastUpdated: Date | null;
}

export function HeroGas({ current, level, avg24h, percentileRank, ethPrice, lastUpdated }: Props) {
  const cfg = LEVEL[level];
  const rising = current.baseFeeGwei > avg24h;
  const pct    = percentileRank;

  const costs = [
    { label: "Transfer",   gas: 21_000  },
    { label: "Swap",       gas: 150_000 },
    { label: "Bridge",     gas: 250_000 },
    { label: "Deploy",     gas: 500_000 },
  ].map(({ label, gas }) => ({
    label, gas,
    usd: estimateCost(gas, current.gasPriceGwei, ethPrice),
  }));

  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "48px 32px 40px" }}>

      {/* Radial glow behind the number */}
      <div style={{
        position: "absolute",
        top: "50%", left: "35%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 400,
        background: `radial-gradient(ellipse, ${cfg.glow} 0%, transparent 65%)`,
        pointerEvents: "none",
        transition: "background 1.2s ease",
        animation: "glow-pulse 4s ease-in-out infinite",
      }} />

      {/* Subtle grid lines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: "linear-gradient(var(--border-3) 1px, transparent 1px), linear-gradient(90deg, var(--border-3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
        {/* Chain label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <LiveDot color={cfg.color} size={6} />
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500,
            color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            Robinhood Chain &nbsp;·&nbsp; Chain ID 4663 &nbsp;·&nbsp; Block {current.blockNumber.toLocaleString()}
            {lastUpdated && <>&nbsp;·&nbsp; {lastUpdated.toLocaleTimeString()}</>}
          </span>
        </div>

        {/* Main layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 48, alignItems: "start" }}>

          {/* Left: The Number */}
          <div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 24 }}>
              <RollingNumber
                value={current.baseFeeGwei}
                decimals={current.baseFeeGwei < 1 ? 5 : 4}
                color={cfg.color}
                style={{
                  fontSize: "clamp(72px, 11vw, 136px)",
                  fontWeight: 900,
                  letterSpacing: "-0.055em",
                  lineHeight: 0.9,
                  fontFamily: "var(--mono)",
                  filter: `drop-shadow(0 0 32px ${cfg.color}55)`,
                  transition: "filter 1s ease",
                }}
              />
              <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 400, color: "var(--text-3)", letterSpacing: "-0.02em" }}>
                  gwei
                </span>
                {rising
                  ? <IconTrendingUp   size={18} color="var(--danger)" />
                  : <IconTrendingDown size={18} color="var(--low)" />}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r)",
              overflow: "hidden",
            }}>
              {[
                { label: "24h average",  value: `${avg24h.toFixed(4)} gwei` },
                { label: "Gas price",    value: `${current.gasPriceGwei.toFixed(4)} gwei` },
                { label: "Priority tip", value: `${current.priorityFeeGwei.toFixed(5)} gwei` },
                { label: "24h position", value: `${pct}th pct`, accent: pct < 30 },
              ].map(({ label, value, accent }, i, arr) => (
                <div key={label} style={{
                  padding: "14px 18px",
                  background: "var(--glass)",
                  borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: accent ? cfg.color : "var(--text-2)" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Verdict */}
          <div style={{
            background: "var(--glass)",
            border: `1px solid ${cfg.border}`,
            borderRadius: "var(--r-xl)",
            padding: "28px 24px",
            textAlign: "center",
            backdropFilter: "blur(20px)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Glow inside card */}
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 50% 100%, ${cfg.glow} 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 12 }}>
                Transact now?
              </div>
              <div style={{
                fontSize: 64, fontWeight: 900, color: cfg.color,
                fontFamily: "var(--mono)", letterSpacing: "-0.05em",
                lineHeight: 1, marginBottom: 14,
                textShadow: `0 0 40px ${cfg.color}66`,
              }}>
                {cfg.verdict}
              </div>
              <div style={{
                display: "inline-block",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: cfg.color, background: cfg.glow,
                border: `1px solid ${cfg.border}`,
                borderRadius: 99, padding: "4px 12px", marginBottom: 12,
              }}>
                {cfg.tag}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.6 }}>
                {cfg.sub}
              </div>
            </div>
          </div>
        </div>

        {/* Cost bar */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1, background: "var(--border)",
          border: "1px solid var(--border)", borderRadius: "var(--r)",
          overflow: "hidden", marginTop: 16,
        }}>
          {costs.map(({ label, gas, usd }, i) => (
            <div key={label} style={{
              padding: "14px 18px",
              background: "var(--glass)",
              borderRight: i < costs.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>
                {label}
              </div>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 20, fontWeight: 800,
                color: cfg.color, letterSpacing: "-0.03em",
                filter: `drop-shadow(0 0 8px ${cfg.color}33)`,
              }}>
                ${usd < 0.0001 ? usd.toExponential(2) : usd < 0.01 ? usd.toFixed(5) : usd.toFixed(4)}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", marginTop: 3 }}>
                {gas.toLocaleString()} gas
              </div>
            </div>
          ))}
        </div>

        {/* Percentile bar */}
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 3, background: "var(--surface-2)", borderRadius: 99, position: "relative", overflow: "visible" }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, var(--low), var(--normal) 45%, var(--high) 70%, var(--danger))",
              borderRadius: 99, opacity: 0.2,
            }} />
            <div style={{
              position: "absolute",
              left: `${pct}%`, top: "50%",
              transform: "translate(-50%, -50%)",
              width: 12, height: 12,
              borderRadius: "50%",
              background: cfg.color,
              border: "2px solid var(--bg)",
              boxShadow: `0 0 10px ${cfg.color}`,
              zIndex: 1, transition: "left 0.5s ease, background 0.5s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-3)" }}>
            <span>Cheapest</span>
            <span>{pct}th percentile of last 24h</span>
            <span>Most expensive</span>
          </div>
        </div>
      </div>
    </section>
  );
}
