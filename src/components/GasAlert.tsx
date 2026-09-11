import React, { useState, useEffect } from "react";
import { IconBell, IconBellOff, IconCheck, IconX } from "./Icons.tsx";

interface Props { currentGwei: number; color: string; }

export function GasAlert({ currentGwei, color }: Props) {
  const [threshold, setThreshold] = useState("");
  const [active, setActive] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [triggered, setTriggered] = useState(false);
  const [lastNotified, setLastNotified] = useState(0);

  useEffect(() => { setPermission(Notification.permission); }, []);

  useEffect(() => {
    if (!active) return;
    const t = parseFloat(threshold);
    if (isNaN(t) || t <= 0) return;
    if (currentGwei <= t) {
      const now = Date.now();
      if (now - lastNotified < 60_000) return;
      setTriggered(true);
      setLastNotified(now);
      if (permission === "granted") {
        new Notification("Gas is below target on Robinhood Chain", {
          body: `Current: ${currentGwei.toFixed(4)} gwei · Target: ≤${t} gwei`,
          tag: "rhgas-alert",
        });
      }
    } else {
      setTriggered(false);
    }
  }, [currentGwei, active, threshold, permission]);

  const enable = async () => {
    const t = parseFloat(threshold);
    if (isNaN(t) || t <= 0) return;
    if (permission !== "granted") {
      const r = await Notification.requestPermission();
      setPermission(r);
      if (r !== "granted") return;
    }
    setActive(true);
    setTriggered(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {active
            ? <IconBell size={14} color={triggered ? "var(--low)" : color} />
            : <IconBellOff size={14} color="var(--text-3)" />}
          <span style={{ fontWeight: 600, fontSize: 13 }}>Gas alert</span>
          {active && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              color: triggered ? "var(--low)" : color,
              background: triggered ? "var(--low-dim)" : `${color}18`,
              border: `1px solid ${triggered ? "var(--low-border)" : color + "33"}`,
              borderRadius: 99, padding: "2px 7px",
            }}>
              {triggered ? "TRIGGERED" : "ACTIVE"}
            </span>
          )}
        </div>
        {active && (
          <button
            onClick={() => { setActive(false); setTriggered(false); }}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-3)", padding: "3px 8px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", background: "var(--surface-2)" }}
          >
            <IconX size={11} /> Cancel
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="number" step="0.001" min="0"
            placeholder="0.050"
            value={threshold}
            onChange={e => { setThreshold(e.target.value); if (active) setActive(false); }}
            disabled={active}
            style={{
              width: "100%", padding: "9px 46px 9px 12px",
              background: "var(--surface-2)",
              border: `1px solid ${active ? color + "44" : "var(--border-2)"}`,
              borderRadius: "var(--r-sm)",
              color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13,
              outline: "none", transition: "border-color 0.15s",
            }}
            onFocus={e => !active && (e.target.style.borderColor = color)}
            onBlur={e => e.target.style.borderColor = active ? color + "44" : "var(--border-2)"}
          />
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", pointerEvents: "none" }}>
            gwei
          </span>
        </div>
        <button
          onClick={active ? undefined : enable}
          style={{
            padding: "9px 16px",
            background: active ? "var(--surface-2)" : color,
            color: active ? "var(--text-2)" : "#000",
            fontWeight: 700, fontSize: 12,
            borderRadius: "var(--r-sm)",
            border: `1px solid ${active ? "var(--border)" : "transparent"}`,
            cursor: active ? "default" : "pointer",
            whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          {active ? <><IconCheck size={12} color="var(--low)" /> Watching</> : "Enable"}
        </button>
      </div>

      <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>
        {permission === "denied"
          ? "Notifications blocked — enable in browser settings."
          : active
          ? `Watching for ≤ ${parseFloat(threshold).toFixed(4)} gwei. Keep this tab open.`
          : "Notify when fees drop below a target. No account needed."}
      </div>
    </div>
  );
}
