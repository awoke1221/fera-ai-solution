import React from "react";

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderLeft: "4px solid #0ea5e9",
        padding: "8px 12px",
        background: "#f0f9ff",
      }}
    >
      {children}
    </div>
  );
}

export function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        background: "#111827",
        color: "#fff",
        padding: "2px 6px",
        borderRadius: 4,
      }}
    >
      {children}
    </code>
  );
}

const components = { Callout, Highlight };

export default components;
