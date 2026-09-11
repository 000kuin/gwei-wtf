import React, { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { FeeHistoryPoint } from "../lib/rpc.ts";

interface Props {
  history: FeeHistoryPoint[];
  currentGwei: number;
  avg24h: number;
  level: string;
}

const LEVEL_COLORS: Record<string, string> = {
  low:       "#00e87a",
  normal:    "#f0c040",
  high:      "#ff8c42",
  very_high: "#ff4444",
};

export function FeeChart({ history, currentGwei, avg24h, level }: Props) {
  const color = LEVEL_COLORS[level] ?? "#00e87a";

  const data = useMemo(() => {
    if (history.length === 0) return [];
    // sample to max 200 points for performance
    const step = Math.max(1, Math.floor(history.length / 200));
    return history
      .filter((_, i) => i % step === 0)
      .map((p, i) => ({
        i,
        block: p.blockNumber,
        gwei: parseFloat(p.baseFeeGwei.toFixed(5)),
      }));
  }, [history]);

  const maxGwei = useMemo(() => Math.max(...data.map(d => d.gwei), currentGwei) * 1.15, [data, currentGwei]);
  const minGwei = useMemo(() => Math.max(0, Math.min(...data.map(d => d.gwei), currentGwei) * 0.85), [data, currentGwei]);

  if (data.length === 0) {
    return (
      <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 14 }}>
        Loading fee history…
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>Fee history</div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>Last ~{history.length} blocks</div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 12, fontFamily: "var(--mono)" }}>
          <span style={{ color: "var(--text-3)" }}>avg <span style={{ color: "var(--normal)" }}>{avg24h.toFixed(4)}</span></span>
          <span style={{ color: "var(--text-3)" }}>now <span style={{ color }}>{currentGwei.toFixed(4)}</span></span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <XAxis dataKey="i" hide />
          <YAxis
            domain={[minGwei, maxGwei]}
            tickFormatter={v => `${v.toFixed(3)}`}
            tick={{ fill: "var(--text-3)", fontSize: 10, fontFamily: "var(--mono)" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-2)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontFamily: "var(--mono)",
                }}>
                  <div style={{ color: color, fontWeight: 700 }}>{d.gwei.toFixed(5)} gwei</div>
                  <div style={{ color: "var(--text-3)" }}>block #{d.block?.toLocaleString()}</div>
                </div>
              );
            }}
          />
          <ReferenceLine
            y={avg24h}
            stroke="var(--normal)"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="gwei"
            stroke={color}
            strokeWidth={2}
            fill="url(#gasGrad)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
