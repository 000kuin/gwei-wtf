import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { IconClock, IconTrendingDown } from "./Icons.tsx";

interface Props {
  cheapestHourUtc: number;
  currentHourAvg: number;
  cheapestHourAvg: number;
  savingsPct: number;
  recommendation: string;
  color: string;
  level: string;
}

export function PredictionPanel({ cheapestHourUtc, currentHourAvg, cheapestHourAvg, savingsPct, recommendation, color }: Props) {
  const currentHour = new Date().getUTCHours();

  const data = Array.from({ length: 24 }, (_, h) => {
    const distFromPeak = Math.min(
      Math.abs(h - ((cheapestHourUtc + 12) % 24)),
      24 - Math.abs(h - ((cheapestHourUtc + 12) % 24))
    );
    const relCost = 0.4 + 0.6 * (1 - distFromPeak / 12);
    return { hour: h, relCost: parseFloat(relCost.toFixed(3)) };
  });

  const hoursUntil = ((cheapestHourUtc - currentHour) + 24) % 24;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32, alignItems: "center" }}>

      {/* Left: summary */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
          <IconClock size={14} color="var(--text-3)" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Best time to transact</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 6 }}>
            {hoursUntil === 0 ? "Now" : `In ~${hoursUntil}h`}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
            {recommendation}
          </div>
        </div>

        {cheapestHourAvg > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>Cheapest hour</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: "var(--low)" }}>
                {cheapestHourUtc}:00 UTC · {cheapestHourAvg.toFixed(4)} gwei
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>Current hour avg</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color }}>
                {currentHour}:00 UTC · {currentHourAvg.toFixed(4)} gwei
              </span>
            </div>
            {savingsPct > 5 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--low)", padding: "6px 0" }}>
                <IconTrendingDown size={12} color="var(--low)" />
                Wait for cheapest window to save ~{savingsPct}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: full-width chart */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Estimated fee pattern by UTC hour
          </span>
          <div style={{ display: "flex", gap: 14, fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: 2, background: "var(--low)", display: "inline-block" }} />
              Cheapest ({cheapestHourUtc}:00)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: 2, background: color, display: "inline-block" }} />
              Now ({currentHour}:00)
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data} barCategoryGap="6%" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="hour"
              tickFormatter={h => h % 6 === 0 ? `${h}h` : ""}
              tick={{ fill: "var(--text-3)", fontSize: 10, fontFamily: "var(--mono)" }}
              axisLine={false} tickLine={false}
            />
            <YAxis hide domain={[0, 1.1]} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-2)",
                    borderRadius: "var(--r-sm)",
                    padding: "6px 10px",
                    fontSize: 11, fontFamily: "var(--mono)",
                  }}>
                    <div style={{ color: "var(--text-2)", marginBottom: 2 }}>{d.hour}:00 UTC</div>
                    <div style={{ color: d.hour === cheapestHourUtc ? "var(--low)" : d.hour === currentHour ? color : "var(--text-3)", fontSize: 10 }}>
                      {d.hour === cheapestHourUtc ? "Cheapest window" : d.hour === currentHour ? "Right now" : "Estimated"}
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="relCost" radius={[3, 3, 0, 0]} isAnimationActive={false} maxBarSize={32}>
              {data.map(entry => (
                <Cell
                  key={entry.hour}
                  fill={
                    entry.hour === cheapestHourUtc ? "var(--low)"
                    : entry.hour === currentHour   ? color
                    : "var(--surface-3)"
                  }
                  opacity={entry.hour === cheapestHourUtc || entry.hour === currentHour ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
