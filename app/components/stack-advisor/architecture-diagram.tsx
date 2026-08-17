"use client";

import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import type {
  ArchitectureDiagram,
  ArchitectureNode,
  DataFlowType,
} from "./architecture-diagram-types";

interface ArchitectureDiagramProps {
  diagram: ArchitectureDiagram;
}

const flowTypeColors: Record<DataFlowType, string> = {
  request: "#38bdf8",
  response: "#34d399",
  event: "#a78bfa",
  sync: "#22c55e",
  async: "#f4b24b",
  webhook: "#e879f9",
};

export function ArchitectureDiagramComponent({
  diagram,
}: ArchitectureDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLegend, setShowLegend] = useState(false);
  const [exportFormat, setExportFormat] = useState<
    "png" | "svg" | "json" | null
  >(null);

  const selectedNode = useMemo(
    () => diagram.nodes.find((n) => n.id === selectedNodeId),
    [selectedNodeId, diagram.nodes],
  );

  // Layout: arrange nodes in layers
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const nodeWidth = 160;
    const nodeHeight = 60;
    const layerGapX = 200;
    const nodeGapY = 80;
    const startX = 40;
    const startY = 40;

    let currentX = startX;

    for (const layer of diagram.layers) {
      const nodesInLayer = diagram.nodes.filter((n) =>
        layer.nodeIds.includes(n.id),
      );
      const layerHeight = nodesInLayer.length * nodeGapY;
      const startYForLayer = startY + (300 - layerHeight) / 2;

      nodesInLayer.forEach((node, idx) => {
        positions[node.id] = {
          x: currentX,
          y: startYForLayer + idx * nodeGapY,
        };
      });

      currentX += layerGapX;
    }

    return positions;
  }, [diagram.layers, diagram.nodes]);

  // Compute SVG dimensions
  const svgDims = useMemo(() => {
    const positions = Object.values(nodePositions);
    if (positions.length === 0) return { width: 800, height: 600 };

    const maxX = Math.max(...positions.map((p) => p.x)) + 180;
    const maxY = Math.max(...positions.map((p) => p.y)) + 80;
    return {
      width: Math.max(maxX, 800),
      height: Math.max(maxY, 600),
    };
  }, [nodePositions]);

  // Event handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) =>
      Math.min(Math.max(z * (e.deltaY > 0 ? 0.9 : 1.1), 0.5), 2.5),
    );
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as Element).closest(".arch-node")) return;
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    },
    [panOffset],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    },
    [isPanning, panStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z * 1.3, 2.5)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.3, 0.5)), []);

  // Export handlers
  const downloadSVG = useCallback(() => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagram.name.replace(/\s+/g, "-").toLowerCase()}-architecture.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [diagram.name]);

  const downloadPNG = useCallback(() => {
    if (!svgRef.current) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = svgDims.width * 2;
    canvas.height = svgDims.height * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = "#0a0f0c";
    ctx.fillRect(0, 0, svgDims.width, svgDims.height);

    const img = new Image();
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = `${diagram.name.replace(/\s+/g, "-").toLowerCase()}-architecture.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  }, [diagram.name, svgDims]);

  const downloadJSON = useCallback(() => {
    const json = JSON.stringify(diagram, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagram.name.replace(/\s+/g, "-").toLowerCase()}-architecture.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [diagram]);

  // Render node
  const renderNode = (node: ArchitectureNode) => {
    const pos = nodePositions[node.id];
    if (!pos) return null;

    const isSelected = selectedNodeId === node.id;
    const isHighlighted =
      searchQuery &&
      (node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.technology?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <g
        key={node.id}
        className="arch-node"
        onClick={() => handleNodeClick(node.id)}
      >
        <defs>
          <filter id={`glow-${node.id}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Node background */}
        <rect
          x={pos.x - 80}
          y={pos.y - 30}
          width="160"
          height="60"
          rx="6"
          fill={isSelected ? "#0f2a1e" : "#1a1a2e"}
          stroke={isSelected ? "#1fb4b8" : isHighlighted ? "#38bdf8" : "#444"}
          strokeWidth={isSelected ? "2" : "1"}
          filter={isSelected ? `url(#glow-${node.id})` : undefined}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
        />

        {/* Icon */}
        <text
          x={pos.x - 60}
          y={pos.y - 5}
          fontSize="20"
          textAnchor="middle"
          fill="#fff"
        >
          {node.icon}
        </text>

        {/* Label */}
        <text
          x={pos.x}
          y={pos.y - 5}
          fontSize="12"
          fontWeight="600"
          fill="#fff"
          textAnchor="middle"
        >
          {node.label}
        </text>

        {/* Type badge */}
        <text
          x={pos.x}
          y={pos.y + 12}
          fontSize="10"
          fill="#aaa"
          textAnchor="middle"
        >
          {node.type.replace(/-/g, " ")}
        </text>
      </g>
    );
  };

  // Render connection
  const renderConnection = (connectionIndex: number) => {
    const conn = diagram.connections[connectionIndex];
    const fromPos = nodePositions[conn.from];
    const toPos = nodePositions[conn.to];

    if (!fromPos || !toPos) return null;

    const x1 = fromPos.x + 80;
    const y1 = fromPos.y;
    const x2 = toPos.x - 80;
    const y2 = toPos.y;
    const color = flowTypeColors[conn.type] || "#999";

    // Bezier curve
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = (x2 - x1) * 0.2;
    const path = `M ${x1} ${y1} Q ${x1 + dx} ${y1}, ${mx} ${my} T ${x2} ${y2}`;

    return (
      <g key={`conn-${connectionIndex}`}>
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.6"
          strokeDasharray={conn.type === "async" ? "5,5" : undefined}
        />
        {/* Arrow head */}
        <polygon
          points={`${x2},${y2} ${x2 - 8},${y2 - 6} ${x2 - 8},${y2 + 6}`}
          fill={color}
        />
        {/* Label */}
        {conn.label && (
          <text
            x={mx}
            y={my - 8}
            fontSize="10"
            fill={color}
            textAnchor="middle"
            fontWeight="600"
            style={{ pointerEvents: "none" }}
          >
            {conn.label}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="arch-diagram-container" ref={containerRef}>
      {/* Header */}
      <div className="arch-diagram-header">
        <div className="arch-header-left">
          <h3>🏗️ {diagram.name}</h3>
          <p>{diagram.description}</p>
        </div>
        <div className="arch-header-controls">
          <div className="arch-search">
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="arch-search-input"
            />
          </div>
          <div className="arch-control-buttons">
            <button
              onClick={() => setShowLegend(!showLegend)}
              title="Show legend"
              className="arch-ctrl-btn"
            >
              📋 Legend
            </button>
            <button
              onClick={() => setExportFormat(exportFormat ? null : "png")}
              title="Export diagram"
              className="arch-ctrl-btn"
            >
              💾 Export
            </button>
            {exportFormat && (
              <div className="arch-export-menu">
                <button onClick={downloadPNG}>📸 PNG</button>
                <button onClick={downloadSVG}>🎨 SVG</button>
                <button onClick={downloadJSON}>📄 JSON</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && diagram.legend && (
        <div className="arch-legend">
          <h4>Data Flow Types</h4>
          <div className="arch-legend-items">
            {diagram.legend.flows.map((flow) => (
              <div key={flow.type} className="arch-legend-item">
                <div
                  className="arch-legend-color"
                  style={{ borderColor: flow.color }}
                />
                <span className="arch-legend-label">{flow.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagram canvas */}
      <div
        className="arch-diagram-canvas"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width={svgDims.width}
          height={svgDims.height}
          viewBox={`0 0 ${svgDims.width} ${svgDims.height}`}
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: "0 0",
            transition: isPanning ? "none" : "transform 0.2s",
          }}
        >
          <defs>
            {/* Layer backgrounds */}
            {diagram.layers.map((layer) => (
              <rect
                key={`layer-bg-${layer.name}`}
                x="0"
                y="0"
                width={svgDims.width}
                height={svgDims.height}
                fill={layer.color}
                opacity="0.02"
              />
            ))}
          </defs>

          {/* Background */}
          <rect width={svgDims.width} height={svgDims.height} fill="#0a0f0c" />

          {/* Connections (drawn first so they appear behind nodes) */}
          {diagram.connections.map((_, idx) => renderConnection(idx))}

          {/* Nodes */}
          {diagram.nodes.map((node) => renderNode(node))}
        </svg>
      </div>

      {/* Zoom controls */}
      <div className="arch-zoom-controls">
        <button onClick={zoomOut} title="Zoom out">
          −
        </button>
        <span className="arch-zoom-level">{Math.round(zoom * 100)}%</span>
        <button onClick={zoomIn} title="Zoom in">
          +
        </button>
        <button onClick={resetView} title="Reset view">
          ⊙
        </button>
      </div>

      {/* Node details panel */}
      {selectedNode && (
        <div className="arch-details-panel">
          <button
            className="arch-details-close"
            onClick={() => setSelectedNodeId(null)}
          >
            ✕
          </button>
          <h4>
            {selectedNode.icon} {selectedNode.label}
          </h4>
          <div className="arch-details-content">
            {selectedNode.technology && (
              <div className="arch-detail-row">
                <span className="arch-detail-label">Technology:</span>
                <span className="arch-detail-value">
                  {selectedNode.technology}
                </span>
              </div>
            )}
            <div className="arch-detail-row">
              <span className="arch-detail-label">Purpose:</span>
              <span className="arch-detail-value">{selectedNode.purpose}</span>
            </div>
            <div className="arch-detail-row">
              <span className="arch-detail-label">Description:</span>
              <span className="arch-detail-value">
                {selectedNode.description}
              </span>
            </div>

            {selectedNode.alternatives &&
              selectedNode.alternatives.length > 0 && (
                <div className="arch-detail-section">
                  <h5>Alternatives</h5>
                  <ul>
                    {selectedNode.alternatives.map((alt, i) => (
                      <li key={i}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}

            {selectedNode.risks && selectedNode.risks.length > 0 && (
              <div className="arch-detail-section">
                <h5>⚠️ Risks & Considerations</h5>
                <ul>
                  {selectedNode.risks.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedNode.costProfile && (
              <div className="arch-detail-row">
                <span className="arch-detail-label">Cost:</span>
                <span className="arch-detail-value">
                  {selectedNode.costProfile}
                </span>
              </div>
            )}

            {selectedNode.scalability !== undefined && (
              <div className="arch-detail-row">
                <span className="arch-detail-label">Scalability:</span>
                <div className="arch-scalability-bar">
                  <div
                    className="arch-scalability-fill"
                    style={{ width: `${selectedNode.scalability}%` }}
                  />
                </div>
                <span className="arch-scalability-value">
                  {selectedNode.scalability}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
