import React from "react";

type IconProps = { size?: number; color?: string; style?: React.CSSProperties };

const icon = (path: React.ReactNode, viewBox = "0 0 16 16") =>
  ({ size = 16, color = "currentColor", style }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
    >
      {path}
    </svg>
  );

export const IconActivity    = icon(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" viewBox="0 0 24 24" /><line x1="22" y1="12" x2="2" y2="12" /></>, "0 0 24 24");
export const IconAlertTriangle = icon(<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, "0 0 24 24");
export const IconArrowRight  = icon(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>, "0 0 24 24");
export const IconBarChart    = icon(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/></>, "0 0 24 24");
export const IconBell        = icon(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>, "0 0 24 24");
export const IconBellOff     = icon(<><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></>, "0 0 24 24");
export const IconBox         = icon(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>, "0 0 24 24");
export const IconCheck       = icon(<polyline points="20 6 9 17 4 12" viewBox="0 0 24 24" />, "0 0 24 24");
export const IconClock       = icon(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, "0 0 24 24");
export const IconCopy        = icon(<><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>, "0 0 24 24");
export const IconExternalLink = icon(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>, "0 0 24 24");
export const IconFlame       = icon(<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>, "0 0 24 24");
export const IconGlobe       = icon(<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>, "0 0 24 24");
export const IconLayers      = icon(<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>, "0 0 24 24");
export const IconSearch      = icon(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>, "0 0 24 24");
export const IconServer      = icon(<><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></>, "0 0 24 24");
export const IconShare2      = icon(<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>, "0 0 24 24");
export const IconShield      = icon(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, "0 0 24 24");
export const IconTrendingUp  = icon(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>, "0 0 24 24");
export const IconTrendingDown = icon(<><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>, "0 0 24 24");
export const IconWallet      = icon(<><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="17" cy="13" r="1" fill="currentColor" stroke="none"/></>, "0 0 24 24");
export const IconWifi        = icon(<><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/></>, "0 0 24 24");
export const IconX           = icon(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>, "0 0 24 24");
export const IconZap         = icon(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>, "0 0 24 24");

// Custom: sandwich / MEV icon
export const IconSandwich = ({ size = 16, color = "currentColor", style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, ...style }}>
    <path d="M3 8h18M3 12h18M3 16h18" />
    <rect x="2" y="6" width="20" height="12" rx="3" />
  </svg>
);

// Custom: gas pump icon
export const IconGas = ({ size = 16, color = "currentColor", style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    <path d="M3 22V8l4-6h8l4 6v14H3z"/>
    <path d="M3 12h14"/>
    <path d="M17 8h2a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-1"/>
    <path d="M20 14v4"/>
  </svg>
);

// Custom: market bell / trading bell
export const IconMarket = ({ size = 16, color = "currentColor", style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <line x1="2" y1="21" x2="22" y2="21"/>
    <line x1="2" y1="3" x2="2" y2="21"/>
  </svg>
);

// Live pulse dot (not emoji, SVG animated)
export const LiveDot = ({ color = "var(--accent)", size = 8 }: { color?: string; size?: number }) => (
  <span style={{ position: "relative", display: "inline-flex", width: size, height: size, flexShrink: 0 }}>
    <span style={{
      position: "absolute", inset: 0, borderRadius: "50%",
      background: color, animation: "pulse-ring 2s ease-out infinite", opacity: 0.6,
    }} />
    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }} />
  </span>
);
