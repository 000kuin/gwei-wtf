import React, { useState, useEffect } from "react";
import { getMarketSession } from "../lib/analysis.ts";
import { IconMarket, IconAlertTriangle } from "./Icons.tsx";

export function MarketClock() {
  const [session, setSession] = useState(getMarketSession);

  useEffect(() => {
    const iv = setInterval(() => setSession(getMarketSession()), 1000);
    return () => clearInterval(iv);
  }, []);

  const ms = Math.max(0, session.nextEventMs);
  const hours   = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const urgent  = ms < 5 * 60_000;
  const warning = ms < 15 * 60_000;

  const statusColor = session.surgeExpected
    ? urgent ? "var(--danger)" : "var(--high)"
    : session.isOpen ? "var(--low)" : "var(--text-3)";

  return (
    <div style={{
      padding: "20px 20px",
      background: session.surgeExpected ? (urgent ? "var(--danger-dim)" : "var(--high-dim)") : "var(--surface)",
      border: `1px solid ${session.surgeExpected ? (urgent ? "var(--danger-border)" : "var(--high-border)") : "var(--border)"}`,
      borderRadius: "var(--r-lg)",
      transition: "all 0.4s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <IconMarket size={14} color={statusColor} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>US Markets</span>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          color: statusColor, background: `${statusColor}18`,
          border: `1px solid ${statusColor}33`,
          borderRadius: 99, padding: "2px 8px",
          textTransform: "uppercase",
        }}>
          {session.sessionName}
        </div>
      </div>

      {/* Countdown */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Until {session.nextEvent === "open" ? "open" : "close"}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {hours > 0 && <TimeUnit value={hours} label="h" color={statusColor} />}
          <TimeUnit value={minutes} label="m" color={statusColor} />
          <TimeUnit value={seconds} label="s" color={statusColor} urgent={urgent} />
        </div>
      </div>

      {/* Warning */}
      {session.surgeExpected ? (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: "10px 12px",
          background: urgent ? "var(--danger-dim)" : "var(--high-dim)",
          border: `1px solid ${urgent ? "var(--danger-border)" : "var(--high-border)"}`,
          borderRadius: "var(--r-sm)",
          fontSize: 12, color: statusColor, lineHeight: 1.4,
        }}>
          <IconAlertTriangle size={13} color={statusColor} style={{ marginTop: 1, flexShrink: 0 }} />
          {session.surgeReason}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>
          {session.isOpen
            ? "Markets active. Stock token trading may affect gas."
            : "Markets closed. Gas is typically lower off-hours."}
        </div>
      )}

      {/* 24h bar */}
      <SessionBar />
    </div>
  );
}

function TimeUnit({ value, label, color, urgent }: { value: number; label: string; color: string; urgent?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
      <span style={{
        fontFamily: "var(--mono)", fontSize: 28, fontWeight: 800,
        color, letterSpacing: "-0.04em", lineHeight: 1,
        animation: urgent ? "blink 0.6s infinite" : "none",
      }}>
        {String(value).padStart(2, "0")}
      </span>
      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)", marginRight: 4 }}>{label}</span>
    </div>
  );
}

function SessionBar() {
  const now = new Date();
  const etOffset = (now.getUTCMonth() >= 2 && now.getUTCMonth() <= 10) ? -4 : -5;
  const etHour = (now.getUTCHours() + etOffset + 24) % 24;
  const etMin  = now.getUTCMinutes();
  const pos = ((etHour + etMin / 60) / 24) * 100;

  const segments = [
    { start: 0, end: 4/24,    color: "var(--text-3)", opacity: 0.2 },
    { start: 4/24, end: 9.5/24, color: "var(--normal)", opacity: 0.3 },
    { start: 9.5/24, end: 16/24, color: "var(--low)", opacity: 0.35 },
    { start: 16/24, end: 20/24, color: "var(--normal)", opacity: 0.3 },
    { start: 20/24, end: 1,    color: "var(--text-3)", opacity: 0.2 },
  ];

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        ET session
      </div>
      <div style={{ position: "relative", height: 6, display: "flex", borderRadius: 99, overflow: "visible", background: "var(--surface-2)" }}>
        {segments.map((s, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${s.start * 100}%`,
            width: `${(s.end - s.start) * 100}%`,
            top: 0, height: "100%",
            background: s.color, opacity: s.opacity,
            borderRadius: i === 0 ? "99px 0 0 99px" : i === segments.length - 1 ? "0 99px 99px 0" : 0,
          }} />
        ))}
        {/* cursor */}
        <div style={{
          position: "absolute", left: `${pos}%`, top: "50%",
          transform: "translate(-50%,-50%)",
          width: 10, height: 10, borderRadius: "50%",
          background: "var(--text)", border: "2px solid var(--bg)",
          boxShadow: "0 0 0 1px var(--border-2)",
          zIndex: 1,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-3)" }}>
        <span>12a</span><span>4a</span><span>9:30a</span><span>4p</span><span>8p</span><span>12a</span>
      </div>
    </div>
  );
}
