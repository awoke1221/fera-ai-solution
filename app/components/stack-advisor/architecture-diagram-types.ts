/**
 * Enhanced Architecture Diagram Types
 * Represents infrastructure layers, data flow, and system components
 */

export type ArchitectureNodeType =
  | "users"
  | "web-app"
  | "mobile-app"
  | "cdn"
  | "api-gateway"
  | "authentication"
  | "database"
  | "cache"
  | "queue"
  | "object-storage"
  | "ai-service"
  | "payment"
  | "email"
  | "monitoring"
  | "analytics"
  | "service";

export type DataFlowType =
  | "request"
  | "response"
  | "event"
  | "sync"
  | "async"
  | "webhook";

export interface ArchitectureNode {
  id: string;
  type: ArchitectureNodeType;
  label: string;
  technology?: string; // e.g., "Next.js", "PostgreSQL", "Redis"
  purpose: string; // "User interface", "Data persistence", etc.
  icon: string; // emoji or icon representation
  layer: string; // "presentation", "api", "data", "infrastructure", "external"
  description: string;
  alternatives?: string[]; // Alternative technologies
  risks?: string[]; // Potential risks or considerations
  costProfile?: "free" | "freemium" | "paid";
  scalability?: number; // 0-100
}

export interface ArchitectureConnection {
  from: string; // Node ID
  to: string; // Node ID
  type: DataFlowType;
  label?: string; // "API Calls", "Database Queries", etc.
  description?: string;
}

export interface ArchitectureDiagram {
  name: string; // "MVP Architecture", "Balanced Production", etc.
  description: string;
  nodes: ArchitectureNode[];
  connections: ArchitectureConnection[];
  layers: {
    name: string;
    label: string;
    color: string;
    nodeIds: string[];
  }[];
  legend?: {
    flows: { type: DataFlowType; description: string; color: string }[];
  };
}

export interface NodeDetails {
  node: ArchitectureNode;
  relatedTechs: string[]; // Connected technologies
  alternatives: string[];
  risks: string[];
  nextSteps?: string;
}
