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
};

const typeLabels: Record<string, string> = {
  api: "API",
  sdk: "SDK",
  webhook: "Webhook",
  direct: "Direct",
  auth: "Auth",
  deploy: "Deploy",
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
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<ToolOption | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [clickedNodeId, setClickedNodeId] = useState<string | null>(null);

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

  const selectedCount = selectedTools.length;
  if (selectedCount === 0) {
    return (
      <div className="diagram-empty">
        <div className="diagram-empty-icon">🔗</div>
        <h4>No Tech Stack Selected Yet</h4>
        <p>
          Select tools from each category above to see how they connect. The
          diagram will dynamically update.
        </p>
      </div>
    );
  }

  // ─── Layout: columns by category ──────────────────────
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
  const gapY = 20;
  const padding = 40;

  const positions = new Map<string, { x: number; y: number }>();
  let colX = padding;
  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx];
    const layerW = Math.max(layer.tools.length * (nodeW + gapX) - gapX, 0);
    for (let i = 0; i < layer.tools.length; i++) {
      positions.set(layer.tools[i].id, {
        x: colX + i * (nodeW + gapX),
        y: padding + layerIdx * (nodeH + gapY + 10),
      });
    }
    colX += layerW + gapX + 50;
  }

  const svgWidth = Math.max(colX + padding, 800);
  const svgHeight = Math.max(
    padding + layers.length * (nodeH + gapY + 10) + 80,
    300,
  );

  // ─── Edge paths ──────────────────────────────────────
  const edgePaths = edges
    .map((edge) => {
      const fromPos = positions.get(edge.from);
      const toPos = positions.get(edge.to);
      if (!fromPos || !toPos) return null;
      const x1 = fromPos.x + nodeW;
      const y1 = fromPos.y + nodeH / 2;
      const x2 = toPos.x;
      const y2 = toPos.y + nodeH / 2;
      const midX = (x1 + x2) / 2;
      return {
        edge,
        path: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
        x1,
        y1,
        x2,
        y2,
        key: `${edge.from}→${edge.to}`,
      };
    })
    .filter(Boolean) as {
    edge: (typeof edges)[0];
    path: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    key: string;
  }[];

  // ─── Zoom & Pan handlers ─────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.min(Math.max(z * delta, 0.3), 3));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as Element;
      if (
        target === svgRef.current ||
        target.classList.contains("diagram-bg")
      ) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      }
    },
    [panOffset],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    },
    [isPanning, panStart],
  );

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

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
  }, []);
  const zoomIn = useCallback(() => setZoom((z) => Math.min(z * 1.3, 3)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.3, 0.3)), []);

  // ─── Node click handler ──────────────────────────────
  const handleNodeClick = useCallback((tool: ToolOption) => {
    setClickedNodeId((prev) => (prev === tool.id ? null : tool.id));
    setSelectedNode((prev) => (prev?.id === tool.id ? null : tool));
  }, []);

  const closeTooltip = useCallback(() => {
    setClickedNodeId(null);
    setSelectedNode(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTooltip();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ─── Category column headers ─────────────────────────
  const catLabels = useMemo(() => {
    const map = new Map<string, { x: number; label: string }>();
    let cx = padding;
    for (const layer of layers) {
      const layerW = Math.max(layer.tools.length * (nodeW + gapX) - gapX, 0);
      const catInfo = toolCategories.find((c) => c.id === layer.category);
      map.set(layer.category, {
        x: cx + layerW / 2,
        label: catInfo?.label || layer.category,
      });
      cx += layerW + gapX + 50;
    }
    return map;
  }, [layers]);

  return (
    <div className="stack-diagram-container">
      {/* Header with zoom controls */}
      <div className="diagram-header">
        <div className="diagram-header-left">
          <h4>📐 Architecture Diagram</h4>
          <p>Visualizing how your selected tools connect and interact.</p>
        </div>
        <div className="diagram-zoom-controls">
          <span className="diagram-zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn" onClick={zoomOut} title="Zoom Out">
            −
          </button>
          <button className="zoom-btn" onClick={zoomIn} title="Zoom In">
            +
          </button>
          <button
            className="zoom-btn reset"
            onClick={resetView}
            title="Reset View"
          >
            ⟲
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
        <span className="legend-hint">
          🖱 Scroll to zoom · Drag to pan · Click a node for details
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="diagram-svg-wrapper">
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="stack-svg"
          style={{
            cursor: isPanning ? "grabbing" : "grab",
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transformOrigin: "0 0",
            transition: isPanning ? "none" : "transform 0.1s ease",
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
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
                id={`arrow-${type}`}
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
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
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

          {/* Category column headers */}
          {Array.from(catLabels.entries()).map(([catId, info]) => (
            <text
              key={catId}
              x={info.x + nodeW / 2}
              y={18}
              textAnchor="middle"
              fill="#8b988f"
              fontSize="9"
              fontFamily="var(--mono)"
              letterSpacing="2"
            >
              {info.label.toUpperCase()}
            </text>
          ))}

          {/* Edges */}
          {edgePaths.map((item) => {
            const { edge, path, x1, y1, x2, y2, key } = item;
            const isHovered = hoveredEdge === key;
            const isConnectedToSelected =
              clickedNodeId &&
              (edge.from === clickedNodeId || edge.to === clickedNodeId);
            const dimEdges = clickedNodeId && !isConnectedToSelected;
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
                  strokeWidth="16"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredEdge(key)}
                  onMouseLeave={() => setHoveredEdge(null)}
                />
                <path
                  d={path}
                  fill="none"
                  stroke={typeColors[edge.type] || "#38bdf8"}
                  strokeWidth={isHovered ? 3.5 : 2}
                  strokeOpacity={isHovered ? 1 : 0.55}
                  strokeDasharray={
                    edge.type === "webhook"
                      ? "6,3"
                      : edge.type === "deploy"
                        ? "4,4"
                        : "none"
                  }
                  markerEnd={`url(#arrow-${edge.type})`}
                  style={{
                    transition: "stroke-width 0.2s, stroke-opacity 0.2s",
                  }}
                />
                {(isHovered || edgePaths.length <= 10) && (
                  <g>
                    <rect
                      x={(x1 + x2) / 2 - 50}
                      y={(y1 + y2) / 2 - 14}
                      width="100"
                      height="18"
                      rx="4"
                      fill={
                        isHovered ? "rgba(31,180,184,0.15)" : "rgba(0,0,0,0.5)"
                      }
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 1}
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
              </g>
            );
          })}

          {/* Nodes */}
          {Array.from(positions.entries()).map(([toolId, pos]) => {
            const tool = selectedTools.find((t) => t.id === toolId);
            if (!tool) return null;
            const colors = categoryColors[tool.category] || {
              bg: "#1a1a1a",
              border: "#666",
              glow: "rgba(100,100,100,0.1)",
            };
            const isHovered = hoveredNode === toolId;
            const isClicked = clickedNodeId === toolId;
            const dimNode =
              clickedNodeId &&
              !isClicked &&
              !edgePaths.some(
                (e) =>
                  (e.edge.from === toolId && e.edge.to === clickedNodeId) ||
                  (e.edge.to === toolId && e.edge.from === clickedNodeId),
              );
            const catLabel =
              toolCategories.find((c) => c.id === tool.category)?.label ||
              tool.category;

            return (
              <g
                key={toolId}
                opacity={dimNode ? 0.15 : 1}
                style={{ cursor: "pointer", transition: "opacity 0.3s" }}
                onClick={() => handleNodeClick(tool)}
                onMouseEnter={() => setHoveredNode(toolId)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow ring on hover/click */}
                {(isHovered || isClicked) && (
                  <rect
                    x={pos.x - 4}
                    y={pos.y - 4}
                    width={nodeW + 8}
                    height={nodeH + 8}
                    rx="13"
                    fill="none"
                    stroke={colors.border}
                    strokeWidth="2.5"
                    strokeOpacity={isClicked ? 0.6 : 0.35}
                    filter="url(#node-glow)"
                  />
                )}
                {/* Background gradient rect */}
                <defs>
                  <linearGradient
                    id={`grad-${toolId}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={colors.bg} />
                    <stop offset="100%" stopColor={colors.bg + "dd"} />
                  </linearGradient>
                </defs>
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={nodeW}
                  height={nodeH}
                  rx="10"
                  fill={`url(#grad-${toolId})`}
                  stroke={
                    isClicked
                      ? colors.border
                      : isHovered
                        ? colors.border
                        : colors.border + "99"
                  }
                  strokeWidth={isClicked ? 2.5 : isHovered ? 2 : 1.5}
                  style={{
                    transition:
                      "stroke-width 0.2s, stroke-opacity 0.2s, fill 0.2s",
                  }}
                />
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
                {/* Clicked indicator */}
                {isClicked && (
                  <text
                    x={pos.x + nodeW - 14}
                    y={pos.y + 18}
                    textAnchor="middle"
                    fill={colors.border}
                    fontSize="12"
                  >
                    ✕
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node info popup */}
      {selectedNode && (
        <div className="diagram-tooltip" onClick={closeTooltip}>
          <div
            className="diagram-tooltip-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="tooltip-close" onClick={closeTooltip}>
              ✕
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
                <span>💲 Pricing</span>
                <span>{selectedNode.pricing}</span>
              </div>
              <div className="tooltip-detail">
                <span>🎁 Free Tier</span>
                <span>{selectedNode.freeTier}</span>
              </div>
              <div className="tooltip-detail">
                <span>📈 Scalability</span>
                <span>{selectedNode.scalability}</span>
              </div>
            </div>
            <div className="tooltip-connections">
              <strong>Connections</strong>
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
                    <div key={e.key} className="tooltip-conn-row">
                      <span className={`tt-conn-dir ${isOut ? "out" : "in"}`}>
                        {isOut ? "→" : "←"}
                      </span>
                      <span className="tt-conn-label">{e.edge.label}</span>
                      <span className="tt-conn-tool">
                        {otherTool?.icon} {otherTool?.name}
                      </span>
                    </div>
                  );
                })}
            </div>
            <a
              href={selectedNode.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tooltip-docs"
            >
              📖 View Documentation →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
