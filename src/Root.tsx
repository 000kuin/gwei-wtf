import React from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { App } from "./App.tsx";
import { TokenPage } from "./pages/TokenPage.tsx";
import { DocsPage } from "./pages/DocsPage.tsx";
import { IconZap, IconGlobe, IconExternalLink } from "./components/Icons.tsx";

export function Root() {
  const [location] = useLocation();

  return (
    <>
      {/* Global nav */}
      <nav style={{
        height: 52, padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(5,6,14,0.94)",
        backdropFilter: "blur(24px) saturate(1.5)",
      }}>
        {/* Left: logo + links */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/">
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: "rgba(34,211,165,0.15)",
                border: "1px solid rgba(34,211,165,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--low)", boxShadow: "0 0 8px var(--low)" }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.04em" }}>gwei.wtf</span>
            </div>
          </Link>

          <div style={{ width: 1, height: 16, background: "var(--border)" }} />

          <div style={{ display: "flex", gap: 4 }}>
            {[
              { href: "/", label: "Tracker" },
              { href: "/docs", label: "Docs" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}>
                <a style={{
                  padding: "5px 12px",
                  borderRadius: "var(--r-sm)",
                  fontSize: 12, fontWeight: 500,
                  color: location === href ? "var(--text)" : "var(--text-3)",
                  background: location === href ? "var(--glass)" : "transparent",
                  border: `1px solid ${location === href ? "var(--border-2)" : "transparent"}`,
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => { if (location !== href) e.currentTarget.style.color = "var(--text-2)"; }}
                onMouseLeave={e => { if (location !== href) e.currentTarget.style.color = "var(--text-3)"; }}
                >
                  {label}
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: GAS token CTA + external links */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="https://robinhoodchain.blockscout.com" target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-3)", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-2)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
          >
            Explorer <IconExternalLink size={10} color="currentColor" />
          </a>

          {/* GAS token pill — the obvious section */}
          <Link href="/token">
            <a style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "6px 14px",
              background: location === "/token"
                ? "var(--low)"
                : "linear-gradient(135deg, rgba(34,211,165,0.15), rgba(34,211,165,0.08))",
              color: location === "/token" ? "#000" : "var(--low)",
              fontWeight: 700, fontSize: 12,
              borderRadius: 99,
              border: "1px solid rgba(34,211,165,0.3)",
              letterSpacing: "-0.01em",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 0 20px rgba(34,211,165,0.1)",
            }}
            onMouseEnter={e => {
              if (location !== "/token") {
                e.currentTarget.style.background = "var(--low)";
                e.currentTarget.style.color = "#000";
              }
            }}
            onMouseLeave={e => {
              if (location !== "/token") {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(34,211,165,0.15), rgba(34,211,165,0.08))";
                e.currentTarget.style.color = "var(--low)";
              }
            }}
            >
              <IconZap size={11} color="currentColor" />
              $GWEI Token
            </a>
          </Link>
        </div>
      </nav>

      {/* Routes */}
      <Switch>
        <Route path="/"      component={App} />
        <Route path="/token" component={TokenPage} />
        <Route path="/docs"  component={DocsPage} />
      </Switch>
    </>
  );
}
