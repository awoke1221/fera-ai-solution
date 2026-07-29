"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { tools, toolCategories, integrationEdges } from ".";
import type { ToolOption } from "./types";

// ─── Props ──────────────────────────────────────────────
interface StackDiagramProps {
  selections: Record<string, string>;
}

// ─── Color palette ─────────────────────────────────────
const categoryColors: Record<
  string,
  { bg: string; border: string; glow: string }
> = {
  frontend: { bg: "#0f2a1e", border: "#1fb4b8", glow: "rgba(31,180,184,0.15)" },
  backend: { bg: "#1a1a2e", border: "#0b7fd4", glow: "rgba(11,127,212,0.15)" },
  database: { bg: "#1e1a0f", border: "#f4b24b", glow: "rgba(244,178,75,0.15)" },
  auth: { bg: "#1a0f1e", border: "#c792ea", glow: "rgba(199,146,234,0.15)" },
  storage: { bg: "#0f1a1e", border: "#22c55e", glow: "rgba(34,197,94,0.15)" },
  deploy_frontend: {
    bg: "#0f0f1e",
    border: "#38bdf8",
    glow: "rgba(56,189,248,0.15)",
  },
  deploy_backend: {
    bg: "#1e0f0f",
    border: "#d9614f",
    glow: "rgba(217,97,79,0.15)",
  },
  cicd: { bg: "#1e1a0f", border: "#f4b24b", glow: "rgba(244,178,75,0.15)" },
  payment: { bg: "#0f1a1e", border: "#22c55e", glow: "rgba(34,197,94,0.15)" },
  email: { bg: "#1e0f1a", border: "#e879f9", glow: "rgba(232,121,249,0.15)" },
  cache: { bg: "#1e0f0f", border: "#ef4444", glow: "rgba(239,68,68,0.15)" },
  testing: { bg: "#0f1e1a", border: "#34d399", glow: "rgba(52,211,153,0.15)" },
  monitoring: {
    bg: "#1e1e0f",
    border: "#facc15",
    glow: "rgba(250,204,21,0.15)",
  },
  css_ui: { bg: "#1e1e0f", border: "#f4b24b", glow: "rgba(244,178,75,0.15)" },
  state_mgmt: {
    bg: "#1a0f1e",
    border: "#c792ea",
    glow: "rgba(199,146,234,0.15)",
  },
  search: { bg: "#0f1a1e", border: "#38bdf8", glow: "rgba(56,189,248,0.15)" },
  mobile: { bg: "#1e0f0f", border: "#22c55e", glow: "rgba(34,197,94,0.15)" },
};

const typeColors: Record<string, string> = {
  api: "#38bdf8",
  sdk: "#22c55e",
  webhook: "#f4b24b",
  direct: "#a78bfa",
  auth: "#e879f9",
  deploy: "#d9614f",
};

// ─── SVG Diagram Component ──────────────────────────────
export function StackDiagram({ selections }: StackDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<ToolOption | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [clickedNodeId, setClickedNodeId] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    nodeX: 0,
    nodeY: 0,
  });
  const [nodePositions, setNodePositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // ─── Build selected tools & edges ──────────────────
  const selectedTools = useMemo(() => {
    return Object.values(selections)
      .map((id) => tools.find((t) => t.id === id))
      .filter(Boolean) as ToolOption[];
  }, [selections]);

  const edges = useMemo(() => {
    const selectedIds = new Set(Object.values(selections));
    return integrationEdges.filter(
      (edge) => selectedIds.has(edge.from) && selectedIds.has(edge.to),
    );
  }, [selections]);

  // Entrance animation trigger
  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedCount = selectedTools.length;
  if (selectedCount === 0) {
    return (
      <div className="diagram-empty">
        <div className="diagram-empty-icon">&#x1f517;</div>
        <h4>No Tech Stack Selected Yet</h4>
        <p>Select tools from each category above to see how they connect.</p>
      </div>
    );
  }

  // ─── Layout computation ─────────────────────────────
  const categoryOrder = [
    "frontend",
    "auth",
    "backend",
    "database",
    "storage",
    "payment",
    "email",
    "cache",
    "testing",
    "cicd",
    "deploy_frontend",
    "deploy_backend",
    "monitoring",
    "css_ui",
    "state_mgmt",
    "search",
    "mobile",
  ];
  const catMap = new Map<string, ToolOption[]>();
  for (const tool of selectedTools) {
    if (!catMap.has(tool.category)) catMap.set(tool.category, []);
    catMap.get(tool.category)!.push(tool);
  }
  const layers = categoryOrder
    .filter((cat) => catMap.has(cat))
    .map((cat) => ({ category: cat, tools: catMap.get(cat)! }));

  const nodeW = 180;
  const nodeH = 68;
  const gapX = 60;
  const padY = 12;
  const padding = 40;
  const headerH = 44;

  // ─── Smart connection-based layout ───────────────────
  const defaultPositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const colCenters: { x: number; width: number; category: string }[] = [];
    const colY = headerH + padding;

    // Build connection graph
    const connGraph = new Map<string, { in: Set<string>; out: Set<string> }>();
    for (const t of selectedTools)
      connGraph.set(t.id, { in: new Set(), out: new Set() });
    for (const e of edges) {
      connGraph.get(e.from)?.out.add(e.to);
      connGraph.get(e.to)?.in.add(e.from);
    }

    // Step 1: Compute ideal Y positions per layer
    const idealY = new Map<string, number>();
    for (const layer of layers) {
      const n = layer.tools.length;
      for (let i = 0; i < n; i++) {
        const t = layer.tools[i];
        const c = connGraph.get(t.id);
        const conns = (c?.in.size || 0) + (c?.out.size || 0);
        // Evenly spaced base + connection pull toward center
        const baseY =
          colY + (i / Math.max(n - 1, 1)) * (n - 1) * (nodeH + padY);
        let adj = 0;
        if (conns > 0 && n > 1) {
          const mid = (n - 1) / 2;
          adj = Math.min(conns / 2, 1) * (mid - i) * (nodeH + padY) * 0.1;
        }
        idealY.set(t.id, baseY + adj);
      }
    }

    // Step 2: Align connected nodes vertically
    for (const e of edges) {
      const fy = idealY.get(e.from);
      const ty = idealY.get(e.to);
      if (fy === undefined || ty === undefined) continue;
      const avg = (fy + ty) / 2;
      idealY.set(e.from, fy + (avg - fy) * 0.25);
      idealY.set(e.to, ty + (avg - ty) * 0.25);
    }

    // Step 3: Assign X + final Y with minimum spacing
    let colX = padding;
    for (const layer of layers) {
      const n = layer.tools.length;
      const sorted = [...layer.tools].sort(
        (a, b) => (idealY.get(a.id) || 0) - (idealY.get(b.id) || 0),
      );
      const totalW = n * (nodeW + gapX) - gapX;
      for (let i = 0; i < n; i++) {
        const t = sorted[i];
        let y = Math.max(
          idealY.get(t.id) || colY,
          colY + i * (nodeH + padY) - (i > 0 ? nodeH + padY : 0),
        );
        if (i > 0) {
          const prevY = pos[sorted[i - 1].id]?.y || 0;
          y = Math.max(y, prevY + nodeH + 8);
        }
        pos[t.id] = { x: colX + i * (nodeW + gapX), y };
      }
      colCenters.push({
        x: colX + totalW / 2 + nodeW / 2,
        width: totalW + nodeW,
        category: layer.category,
      });
      colX += (n > 0 ? totalW + nodeW : 0) + 80;
    }
    return {
      positions: pos,
      colCenters,
      totalWidth: Math.max(colX + padding, 900),
    };
  }, [layers, selectedTools, edges]);

  // ─── Merge default with user drags ───────────────────
  const positions = useMemo(
    () => ({ ...defaultPositions.positions, ...nodePositions }),
    [defaultPositions, nodePositions],
  );
  const colCenters = defaultPositions.colCenters;
  const svgWidth = defaultPositions.totalWidth;

  // ─── Dynamic SVG height from actual positions ────────
  const svgHeight = useMemo(() => {
    let maxY = 0;
    for (const p of Object.values(positions)) {
      if (p.y + nodeH + 80 > maxY) maxY = p.y + nodeH + 80;
    }
    return Math.max(maxY, 450);
  }, [positions]);

  // ─── Smart edge paths (smooth bezier routing) ────────
  const edgePaths = edges
    .map((edge) => {
      const fp = positions[edge.from],
        tp = positions[edge.to];
      if (!fp || !tp) return null;
      const x1 = fp.x + nodeW,
        y1 = fp.y + nodeH / 2;
      const x2 = tp.x,
        y2 = tp.y + nodeH / 2;
      const mx = (x1 + x2) / 2,
        my = (y1 + y2) / 2;
      const dx = (x2 - x1) * 0.35;
      return {
        edge,
        key: edge.from + "\u2192" + edge.to,
        x1,
        y1,
        x2,
        y2,
        midX: mx,
        midY: my,
        path:
          "M " +
          x1 +
          " " +
          y1 +
          " C " +
          (x1 + dx) +
          " " +
          y1 +
          ", " +
          (x2 - dx) +
          " " +
          y2 +
          ", " +
          x2 +
          " " +
          y2,
      };
    })
    .filter(Boolean) as {
    edge: (typeof edges)[0];
    key: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    midX: number;
    midY: number;
    path: string;
  }[];

  // ─── Connected node IDs for pulse ────────────────────
  const connectedNodeIds = useMemo(() => {
    if (!clickedNodeId) return new Set<string>();
    const set = new Set<string>();
    for (const e of edgePaths) {
      if (e.edge.from === clickedNodeId) set.add(e.edge.to);
      if (e.edge.to === clickedNodeId) set.add(e.edge.from);
    }
    return set;
  }, [clickedNodeId, edgePaths]);

  // ─── Search filtering ────────────────────────────────
  const searchLower = searchQuery.toLowerCase();
  const highlightedNodes = useMemo(() => {
    if (!searchLower) return new Set<string>();
    return new Set(
      selectedTools
        .filter(
          (t) =>
            t.name.toLowerCase().includes(searchLower) ||
            t.category.toLowerCase().includes(searchLower),
        )
        .map((t) => t.id),
    );
  }, [searchLower, selectedTools]);

  // ─── Zoom & Pan handlers ─────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    setZoom((z) => Math.min(Math.max(z * (e.deltaY > 0 ? 0.9 : 1.1), 0.3), 3));
  }, []);

  const handleBackgroundMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as Element;
      if (
        (target === svgRef.current ||
          target.classList.contains("diagram-bg") ||
          target.classList.contains("category-group-bg")) &&
        !draggingNode
      ) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      }
    },
    [panOffset, draggingNode],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingNode) {
        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;
        setNodePositions((prev) => ({
          ...prev,
          [draggingNode]: { x: dragStart.nodeX + dx, y: dragStart.nodeY + dy },
        }));
        return;
      }
      if (!isPanning) return;
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    },
    [isPanning, panStart, draggingNode, dragStart, zoom],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNode(null);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        setIsPanning(true);
        setPanStart({
          x: e.touches[0].clientX - panOffset.x,
          y: e.touches[0].clientY - panOffset.y,
        });
      }
    },
    [panOffset],
  );
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPanning || e.touches.length !== 1) return;
      setPanOffset({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    },
    [isPanning, panStart],
  );
  const handleTouchEnd = useCallback(() => setIsPanning(false), []);
  const resetView = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setNodePositions({});
  }, []);
  const zoomIn = useCallback(() => setZoom((z) => Math.min(z * 1.3, 3)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.3, 0.3)), []);

  // ─── Node drag handlers ──────────────────────────────
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, toolId: string) => {
      e.stopPropagation();
      const pos = positions[toolId];
      if (!pos) return;
      setDraggingNode(toolId);
      setDragStart({ x: e.clientX, y: e.clientY, nodeX: pos.x, nodeY: pos.y });
    },
    [positions],
  );

  const handleNodeClick = useCallback(
    (tool: ToolOption) => {
      if (draggingNode) return;
      setClickedNodeId((prev) => (prev === tool.id ? null : tool.id));
      setSelectedNode((prev) => (prev?.id === tool.id ? null : tool));
    },
    [draggingNode],
  );

  const closeTooltip = useCallback(() => {
    setClickedNodeId(null);
    setSelectedNode(null);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTooltip();
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // ─── Download ────────────────────────────────────────
  const downloadDiagram = useCallback(() => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      canvas.width = svgWidth * 2;
      canvas.height = svgHeight * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = "#0a0f0c";
      ctx.fillRect(0, 0, svgWidth, svgHeight);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = "stack-architecture.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  }, [svgWidth, svgHeight]);

  const catCount = layers.length;
  const connCount = edgePaths.length;

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="stack-diagram-container">
      {/* Header */}
      <div className="diagram-header">
        <div className="diagram-header-left">
          <h4>&#x1f4d0; Architecture Diagram</h4>
          <p>
            {selectedCount} tools &middot; {catCount} categories &middot;{" "}
            {connCount} connections &mdash; Drag nodes to rearrange &middot;
            Scroll to zoom &middot; Click for details
          </p>
          {/* Search bar */}
          <div className="diagram-search">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="diagram-search-input"
            />
            {searchQuery && (
              <button
                className="diagram-search-clear"
                onClick={() => setSearchQuery("")}
              >
                &#x2715;
              </button>
            )}
          </div>
        </div>
        <div className="diagram-zoom-controls">
          <span className="diagram-zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn" onClick={zoomOut} title="Zoom Out">
            &minus;
          </button>
          <button className="zoom-btn" onClick={zoomIn} title="Zoom In">
            +
          </button>
          <button
            className="zoom-btn reset"
            onClick={resetView}
            title="Reset View"
          >
            &olarr;
          </button>
          <button
            className="zoom-btn download"
            onClick={downloadDiagram}
            title="Download as PNG"
          >
            &darr;
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="diagram-legend">
        <span className="legend-item">
          <span className="legend-line type-api" /> API
        </span>
        <span className="legend-item">
          <span className="legend-line type-sdk" /> SDK
        </span>
        <span className="legend-item">
          <span className="legend-line type-webhook" /> Webhook
        </span>
        <span className="legend-item">
          <span className="legend-line type-direct" /> Direct
        </span>
        <span className="legend-item">
          <span className="legend-line type-auth" /> Auth
        </span>
        <span className="legend-item">
          <span className="legend-line type-deploy" /> Deploy
        </span>
        <span className="legend-item">
          <span className="legend-line legend-drag" /> Draggable
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="diagram-svg-wrapper" ref={containerRef}>
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          viewBox={"0 0 " + svgWidth + " " + svgHeight}
          className="stack-svg"
          style={{
            cursor: draggingNode ? "grabbing" : isPanning ? "grabbing" : "grab",
            transform:
              "scale(" +
              zoom +
              ") translate(" +
              panOffset.x / zoom +
              "px, " +
              panOffset.y / zoom +
              "px)",
            transformOrigin: "0 0",
            transition:
              isPanning || draggingNode ? "none" : "transform 0.1s ease",
          }}
          onWheel={handleWheel}
          onMouseDown={handleBackgroundMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <defs>
            {(
              ["api", "sdk", "webhook", "direct", "auth", "deploy"] as const
            ).map((type) => (
              <marker
                key={type}
                id={"arrow-" + type}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={typeColors[type]} />
              </marker>
            ))}
            <filter id="node-shadow">
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="rgba(0,0,0,0.4)"
              />
            </filter>
            <filter id="node-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="node-glow-intense">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="bg-blur">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Background */}
          <rect
            className="diagram-bg"
            x="0"
            y="0"
            width={svgWidth}
            height={svgHeight}
            fill="rgba(0,0,0,0.2)"
          />

          {/* Category column backgrounds */}
          {layers.map((layer) => {
            const toolsInLayer = layer.tools;
            if (toolsInLayer.length === 0) return null;
            const firstPos = positions[toolsInLayer[0].id];
            const lastPos = positions[toolsInLayer[toolsInLayer.length - 1].id];
            if (!firstPos || !lastPos) return null;
            // Compute dynamic height from actual node positions
            let minY = Infinity,
              maxY = -Infinity;
            for (const t of toolsInLayer) {
              const p = positions[t.id];
              if (p) {
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
              }
            }
            const catColor = categoryColors[layer.category]?.border || "#666";
            return (
              <rect
                key={"bg-" + layer.category}
                className="category-group-bg"
                x={firstPos.x - 14}
                y={minY - 14}
                width={lastPos.x - firstPos.x + nodeW + 28}
                height={maxY - minY + nodeH + 28}
                rx="14"
                fill={catColor + "06"}
                stroke={catColor + "15"}
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Category column headers */}
          {layers.map((layer) => {
            const catInfo = toolCategories.find((c) => c.id === layer.category);
            const col = colCenters.find((c) => c.category === layer.category);
            if (!col) return null;
            const colors = categoryColors[layer.category];
            return (
              <g key={"hdr-" + layer.category}>
                <rect
                  x={col.x - col.width / 2 - 10}
                  y={headerH + padding - 36}
                  width={col.width + 20}
                  height="24"
                  rx="12"
                  fill={(colors?.border || "#666") + "12"}
                />
                <text
                  x={col.x}
                  y={headerH + padding - 20}
                  textAnchor="middle"
                  fill={colors?.border || "#8b988f"}
                  fontSize="10"
                  fontFamily="var(--mono)"
                  letterSpacing="2"
                  fontWeight="600"
                >
                  {(catInfo?.label || layer.category).toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Edges */}
          {edgePaths.map((item) => {
            const { edge, path, midX, midY, key } = item;
            const isHovered = hoveredEdge === key;
            const isConnectedToSelected =
              clickedNodeId &&
              (edge.from === clickedNodeId || edge.to === clickedNodeId);
            const dimEdges = clickedNodeId && !isConnectedToSelected;
            const edgeColor = typeColors[edge.type] || "#38bdf8";
            return (
              <g
                key={key}
                opacity={dimEdges ? 0.08 : 1}
                style={{ transition: "opacity 0.3s" }}
              >
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="18"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredEdge(key)}
                  onMouseLeave={() => setHoveredEdge(null)}
                />
                <path
                  d={path}
                  fill="none"
                  stroke={edgeColor}
                  strokeWidth={isHovered ? 3.5 : 2}
                  strokeOpacity={isHovered ? 1 : 0.55}
                  strokeDasharray={
                    edge.type === "webhook"
                      ? "6,3"
                      : edge.type === "deploy"
                        ? "4,4"
                        : "none"
                  }
                  markerEnd={"url(#arrow-" + edge.type + ")"}
                  style={{
                    transition: "stroke-width 0.2s, stroke-opacity 0.2s",
                  }}
                />
                {(isHovered || connCount <= 12) && (
                  <g>
                    <rect
                      x={midX - 50}
                      y={midY - 14}
                      width="100"
                      height="20"
                      rx="4"
                      fill={
                        isHovered ? "rgba(31,180,184,0.15)" : "rgba(0,0,0,0.55)"
                      }
                    />
                    <text
                      x={midX}
                      y={midY + 1}
                      textAnchor="middle"
                      fill={isHovered ? "#eceee7" : "#8b988f"}
                      fontSize="9"
                      fontFamily="var(--mono)"
                      fontWeight={isHovered ? "600" : "400"}
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
                {/* Animated flow particles */}
                <circle r="3" fill={edgeColor} opacity="0.7">
                  <animateMotion
                    dur="2.5s"
                    repeatCount="indefinite"
                    path={path}
                  />
                </circle>
                <circle r="2" fill={edgeColor} opacity="0.4">
                  <animateMotion
                    dur="2.5s"
                    repeatCount="indefinite"
                    path={path}
                    begin="0.8s"
                  />
                </circle>
              </g>
            );
          })}

          {/* Nodes */}
          {Array.from(Object.entries(positions)).map(([toolId, pos], idx) => {
            const tool = selectedTools.find((t) => t.id === toolId);
            if (!tool) return null;
            const colors = categoryColors[tool.category] || {
              bg: "#1a1a1a",
              border: "#666",
              glow: "rgba(100,100,100,0.1)",
            };
            const isHovered = hoveredNode === toolId;
            const isClicked = clickedNodeId === toolId;
            const isConnected = connectedNodeIds.has(toolId);
            const isHighlighted = !searchQuery || highlightedNodes.has(toolId);
            const isBeingDragged = draggingNode === toolId;
            const dimNode =
              (clickedNodeId && !isClicked && !isConnected) ||
              (searchQuery && !isHighlighted);
            const catLabel =
              toolCategories.find((c) => c.id === tool.category)?.label ||
              tool.category;
            const shouldPulse = isConnected && clickedNodeId;
            const animDelay = idx * 0.05;
            const isDraggable = true;

            return (
              <g
                key={toolId}
                opacity={dimNode ? 0.12 : 1}
                style={{
                  cursor: isBeingDragged ? "grabbing" : "pointer",
                  transition: isBeingDragged ? "none" : "opacity 0.3s",
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, toolId)}
                onClick={() => handleNodeClick(tool)}
                onMouseEnter={() => setHoveredNode(toolId)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Connected pulse ring */}
                {shouldPulse && (
                  <rect
                    x={pos.x - 6}
                    y={pos.y - 6}
                    width={nodeW + 12}
                    height={nodeH + 12}
                    rx="13"
                    fill="none"
                    stroke={colors.border}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    filter="url(#node-glow-intense)"
                  >
                    <animate
                      attributeName="strokeOpacity"
                      values="0.4;0.8;0.4"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="strokeWidth"
                      values="1.5;3;1.5"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}
                {/* Hover/click glow */}
                {(isHovered || isClicked || isBeingDragged) && (
                  <rect
                    x={pos.x - 5}
                    y={pos.y - 5}
                    width={nodeW + 10}
                    height={nodeH + 10}
                    rx="13"
                    fill="none"
                    stroke={colors.border}
                    strokeWidth={isBeingDragged ? "3" : isClicked ? "2.5" : "2"}
                    strokeOpacity={
                      isBeingDragged ? 0.8 : isClicked ? 0.6 : 0.35
                    }
                    filter="url(#node-glow)"
                  />
                )}
                {/* Node background with shadow */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={nodeW}
                  height={nodeH}
                  rx="10"
                  fill={"url(#grad-" + toolId + ")"}
                  stroke={
                    isBeingDragged
                      ? colors.border
                      : isClicked
                        ? colors.border
                        : isHovered
                          ? colors.border
                          : colors.border + "99"
                  }
                  strokeWidth={
                    isBeingDragged ? 3 : isClicked ? 2.5 : isHovered ? 2 : 1.5
                  }
                  filter="url(#node-shadow)"
                  style={{ transition: "stroke-width 0.2s, stroke 0.2s" }}
                />
                <defs>
                  <linearGradient
                    id={"grad-" + toolId}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={colors.bg} />
                    <stop offset="100%" stopColor={colors.bg + "dd"} />
                  </linearGradient>
                </defs>
                {/* Icon */}
                <text
                  x={pos.x + 22}
                  y={pos.y + nodeH / 2 + 6}
                  textAnchor="middle"
                  fill={colors.border}
                  fontSize="22"
                >
                  {tool.icon}
                </text>
                {/* Name */}
                <text
                  x={pos.x + 66}
                  y={pos.y + 28}
                  textAnchor="start"
                  fill="#eceee7"
                  fontSize="11"
                  fontFamily="var(--display)"
                  fontWeight="600"
                >
                  {tool.name}
                </text>
                {/* Category tag */}
                <rect
                  x={pos.x + 66}
                  y={pos.y + 38}
                  width={Math.max(catLabel.length * 7 + 14, 50)}
                  height="18"
                  rx="4"
                  fill={colors.border + "22"}
                />
                <text
                  x={pos.x + 66 + 7}
                  y={pos.y + 50}
                  textAnchor="start"
                  fill={colors.border}
                  fontSize="7"
                  fontFamily="var(--mono)"
                  letterSpacing="0.5"
                >
                  {catLabel.toUpperCase()}
                </text>
                {/* Drag hint */}
                <text
                  x={pos.x + nodeW - 10}
                  y={pos.y + 10}
                  textAnchor="end"
                  fill={colors.border + "44"}
                  fontSize="8"
                  fontFamily="var(--mono)"
                  opacity={isHovered ? 1 : 0}
                  style={{ transition: "opacity 0.2s" }}
                >
                  &#x2630;
                </text>
                {/* Clicked X */}
                {isClicked && (
                  <text
                    x={pos.x + nodeW - 14}
                    y={pos.y + 18}
                    textAnchor="middle"
                    fill={colors.border}
                    fontSize="12"
                  >
                    &#x2715;
                  </text>
                )}
                {/* Entrance animation */}
                {mounted && (
                  <animate
                    attributeName="opacity"
                    from="0"
                    to={dimNode ? 0.12 : 1}
                    dur="0.4s"
                    begin={animDelay + "s"}
                    fill="freeze"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node tooltip */}
      {selectedNode && (
        <div className="diagram-tooltip" onClick={closeTooltip}>
          <div
            className="diagram-tooltip-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="tooltip-close" onClick={closeTooltip}>
              &#x2715;
            </button>
            <div className="tooltip-header">
              <span className="tooltip-icon">{selectedNode.icon}</span>
              <div>
                <strong>{selectedNode.name}</strong>
                <span className="tooltip-category">
                  {
                    toolCategories.find((c) => c.id === selectedNode.category)
                      ?.label
                  }
                </span>
              </div>
            </div>
            <p className="tooltip-desc">{selectedNode.description}</p>
            <div className="tooltip-details">
              <div className="tooltip-detail">
                <span>&#x1f4b2; Pricing</span>
                <span>{selectedNode.pricing}</span>
              </div>
              <div className="tooltip-detail">
                <span>&#x1f381; Free Tier</span>
                <span>{selectedNode.freeTier}</span>
              </div>
              <div className="tooltip-detail">
                <span>&#x1f4c8; Scalability</span>
                <span>{selectedNode.scalability}</span>
              </div>
              <div className="tooltip-detail">
                <span>&#x1f1ea;&#x1f1f9; Ethiopian Support</span>
                <span>{selectedNode.ethiopianSupport}</span>
              </div>
            </div>
            {edgePaths.filter(
              (e) =>
                e.edge.from === selectedNode.id ||
                e.edge.to === selectedNode.id,
            ).length > 0 && (
              <div className="tooltip-connections">
                <strong>
                  Connections (
                  {
                    edgePaths.filter(
                      (e) =>
                        e.edge.from === selectedNode.id ||
                        e.edge.to === selectedNode.id,
                    ).length
                  }
                  )
                </strong>
                {edgePaths
                  .filter(
                    (e) =>
                      e.edge.from === selectedNode.id ||
                      e.edge.to === selectedNode.id,
                  )
                  .map((e) => {
                    const otherId =
                      e.edge.from === selectedNode.id ? e.edge.to : e.edge.from;
                    const otherTool = tools.find((t) => t.id === otherId);
                    const isOut = e.edge.from === selectedNode.id;
                    return (
                      <div
                        key={e.key}
                        className="tooltip-conn-row"
                        onClick={() => {
                          if (otherTool) handleNodeClick(otherTool);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <span
                          className={"tt-conn-dir " + (isOut ? "out" : "in")}
                        >
                          {isOut ? "\u2192" : "\u2190"}
                        </span>
                        <span className="tt-conn-label">{e.edge.label}</span>
                        <span className="tt-conn-tool">
                          {otherTool?.icon} {otherTool?.name}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
            <a
              href={selectedNode.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tooltip-docs"
            >
              &#x1f4d6; View Documentation &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
