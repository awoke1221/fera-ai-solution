import { ImageResponse } from "next/og";

export const runtime = "edge";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "linear-gradient(135deg, #0a0f0c 0%, #0d1a15 100%)",
        color: "white",
        padding: 60,
        fontFamily: "Inter",
      }}
    >
      <div style={{ fontSize: 28, color: "#4fd1a5", marginBottom: 16 }}>
        Fera AI Solutions
      </div>
      <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
        Intelligent Software Engineering for Modern Teams
      </div>
      <div style={{ fontSize: 24, color: "#eceee7", marginTop: 20 }}>
        AI Agents • Web Platforms • ERP • Fintech • Mobile Apps
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
