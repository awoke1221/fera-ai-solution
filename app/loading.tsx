export default function Loading() {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem 0",
      }}
    >
      <div
        aria-label="Loading content"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "3px solid rgba(148, 163, 184, 0.25)",
          borderTopColor: "#8b5cf6",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
