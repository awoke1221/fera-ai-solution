/**
 * Architecture Diagram Generator
 * Converts recommendations into interactive architecture diagrams
 */

import type {
  ArchitectureStrategy,
  ArchitectureLayer,
} from "./architecture-strategy-types";
import type {
  ArchitectureDiagram,
  ArchitectureNode,
  ArchitectureConnection,
} from "./architecture-diagram-types";

/**
 * Map technology names to node information
 */
const techNodeMap: Record<
  string,
  {
    type:
      | "database"
      | "cache"
      | "api-gateway"
      | "service"
      | "cdn"
      | "authentication"
      | "queue"
      | "object-storage"
      | "ai-service"
      | "payment"
      | "email"
      | "monitoring";
    icon: string;
    purpose: string;
  }
> = {
  // Databases
  PostgreSQL: {
    type: "database",
    icon: "🗄️",
    purpose: "Primary relational data storage",
  },
  MongoDB: {
    type: "database",
    icon: "🗄️",
    purpose: "Document-oriented data storage",
  },
  "Supabase (PostgreSQL)": {
    type: "database",
    icon: "🗄️",
    purpose: "Managed PostgreSQL with built-in auth",
  },
  "Firebase Realtime Database": {
    type: "database",
    icon: "🗄️",
    purpose: "Real-time NoSQL database",
  },

  // Caches
  Redis: {
    type: "cache",
    icon: "⚡",
    purpose: "In-memory caching and sessions",
  },
  "Redis Cluster": {
    type: "cache",
    icon: "⚡",
    purpose: "Distributed in-memory caching",
  },
  Memcached: {
    type: "cache",
    icon: "⚡",
    purpose: "High-performance distributed memory caching",
  },

  // APIs & Gateways
  Express: {
    type: "api-gateway",
    icon: "🔌",
    purpose: "API server and routing",
  },
  "Node.js": { type: "service", icon: "🔌", purpose: "JavaScript runtime" },
  FastAPI: {
    type: "api-gateway",
    icon: "🔌",
    purpose: "Python API framework",
  },
  Go: { type: "service", icon: "🔌", purpose: "High-performance backend" },
  "API Gateway": {
    type: "api-gateway",
    icon: "🔌",
    purpose: "Request routing and rate limiting",
  },

  // Frontend
  "Next.js": {
    type: "service",
    icon: "⚛️",
    purpose: "Full-stack React framework",
  },
  "Next.js 14": {
    type: "service",
    icon: "⚛️",
    purpose: "Full-stack React framework",
  },
  React: { type: "service", icon: "⚛️", purpose: "UI library" },
  Vue: { type: "service", icon: "💚", purpose: "Progressive UI framework" },

  // CDN
  Vercel: { type: "cdn", icon: "🌐", purpose: "Deployment and CDN" },
  "Vercel CDN": { type: "cdn", icon: "🌐", purpose: "Edge CDN and caching" },
  CloudFront: {
    type: "cdn",
    icon: "🌐",
    purpose: "AWS global content delivery",
  },
  "Bunny.net": { type: "cdn", icon: "🌐", purpose: "Performance CDN" },

  // Auth
  "Supabase Auth": {
    type: "authentication",
    icon: "🔐",
    purpose: "User authentication and sessions",
  },
  Auth0: {
    type: "authentication",
    icon: "🔐",
    purpose: "Enterprise authentication platform",
  },
  "Firebase Auth": {
    type: "authentication",
    icon: "🔐",
    purpose: "Quick authentication setup",
  },

  // Payment
  Stripe: { type: "payment", icon: "💳", purpose: "Payment processing" },
  Chapa: { type: "payment", icon: "💳", purpose: "Ethiopian payment provider" },
  PayPal: { type: "payment", icon: "💳", purpose: "Global payment platform" },

  // Email
  Resend: { type: "email", icon: "📧", purpose: "Transactional email" },
  SendGrid: { type: "email", icon: "📧", purpose: "Email delivery platform" },
  Mailgun: { type: "email", icon: "📧", purpose: "Email API service" },

  // Queue
  "Bull Queue": {
    type: "queue",
    icon: "📋",
    purpose: "Job queue for background tasks",
  },
  RabbitMQ: {
    type: "queue",
    icon: "📋",
    purpose: "Message broker for async processing",
  },
  "AWS SQS": { type: "queue", icon: "📋", purpose: "Cloud message queue" },

  // Storage
  "AWS S3": { type: "object-storage", icon: "📦", purpose: "Object storage" },
  Cloudinary: {
    type: "object-storage",
    icon: "📦",
    purpose: "Image and media storage",
  },
  R2: { type: "object-storage", icon: "📦", purpose: "Object storage" },

  // AI
  OpenAI: { type: "ai-service", icon: "🤖", purpose: "AI language models" },
  "Anthropic Claude": {
    type: "ai-service",
    icon: "🤖",
    purpose: "AI assistant API",
  },

  // Monitoring
  Sentry: { type: "monitoring", icon: "📊", purpose: "Error tracking" },
  Datadog: {
    type: "monitoring",
    icon: "📊",
    purpose: "Monitoring and analytics",
  },
  Prometheus: {
    type: "monitoring",
    icon: "📊",
    purpose: "Metrics collection",
  },
};

/**
 * Generate architecture diagram from strategy
 */
export function generateArchitectureDiagram(
  strategy: ArchitectureStrategy,
): ArchitectureDiagram {
  const nodes: ArchitectureNode[] = [];
  const connections: ArchitectureConnection[] = [];
  let nodeIdCounter = 0;

  // Helper to create unique node ID
  const createNodeId = (prefix: string) => `${prefix}-${nodeIdCounter++}`;

  // 1. Users entry point
  const usersNodeId = createNodeId("users");
  nodes.push({
    id: usersNodeId,
    type: "users",
    label: "Users",
    purpose: "End users accessing the application",
    icon: "👥",
    layer: "external",
    description: "Users interacting with your application via web or mobile",
  });

  // 2. CDN/Frontend layer
  const cdnNodeId = createNodeId("cdn");
  nodes.push({
    id: cdnNodeId,
    type: "cdn",
    label: strategy.techStack.deployment[0] || "Vercel",
    technology: strategy.techStack.deployment[0],
    purpose: "Serve static assets and frontend",
    icon: "🌐",
    layer: "presentation",
    description: "Serves your web application globally with low latency",
  });

  // Users → CDN
  connections.push({
    from: usersNodeId,
    to: cdnNodeId,
    type: "request",
    label: "HTTPS Requests",
    description: "Users access the web application",
  });

  // 3. Frontend/Web App
  const frontendNodeId = createNodeId("frontend");
  const frontendTech = strategy.techStack.frontend[0] || "Next.js";
  nodes.push({
    id: frontendNodeId,
    type: "web-app",
    label: frontendTech,
    technology: frontendTech,
    purpose: "User interface and client-side logic",
    icon: "⚛️",
    layer: "presentation",
    description: "Renders the UI and handles user interactions",
    alternatives: ["React", "Vue", "Svelte"],
    risks: ["Browser compatibility issues", "Performance optimization needed"],
  });

  // CDN → Frontend (implicit, but Frontend is the app served by CDN)

  // 4. API/Backend layer
  const apiNodeId = createNodeId("api");
  const backendTech = strategy.techStack.backend[0] || "Node.js";
  nodes.push({
    id: apiNodeId,
    type: "api-gateway",
    label: backendTech,
    technology: backendTech,
    purpose: "Business logic and API endpoints",
    icon: "🔌",
    layer: "api",
    description: "Processes requests and manages application logic",
    alternatives:
      backendTech === "Node.js"
        ? ["Python/FastAPI", "Go", "Java/Spring"]
        : [backendTech === "Python" ? "Node.js" : "Python"],
    risks: ["Scalability bottlenecks", "Error handling"],
    scalability: strategy.scalability === "unlimited" ? 100 : 70,
  });

  // Frontend → API
  connections.push({
    from: frontendNodeId,
    to: apiNodeId,
    type: "request",
    label: "API Calls",
    description: "Frontend fetches data and submits actions",
  });

  // 5. Authentication
  if (strategy.techStack.backend.some((t) => t.includes("Auth"))) {
    const authNodeId = createNodeId("auth");
    const authTech =
      strategy.techStack.backend.find((t) => t.includes("Auth")) ||
      "Supabase Auth";
    nodes.push({
      id: authNodeId,
      type: "authentication",
      label: authTech,
      technology: authTech,
      purpose: "User authentication and authorization",
      icon: "🔐",
      layer: "api",
      description: "Manages user sessions and permissions",
      risks: ["Token expiration handling", "Security vulnerabilities"],
    });

    connections.push({
      from: apiNodeId,
      to: authNodeId,
      type: "sync",
      label: "Verify Sessions",
    });
  }

  // 6. Database layer
  const dbNodeId = createNodeId("database");
  const dbTech = strategy.techStack.database[0] || "PostgreSQL";
  nodes.push({
    id: dbNodeId,
    type: "database",
    label: dbTech,
    technology: dbTech,
    purpose: "Persistent data storage",
    icon: "🗄️",
    layer: "data",
    description: "Stores application data reliably",
    alternatives:
      dbTech === "PostgreSQL" ? ["MongoDB", "MySQL"] : ["PostgreSQL"],
    risks: ["Data loss if not backed up", "Performance degradation at scale"],
    scalability: 85,
  });

  // API → Database
  connections.push({
    from: apiNodeId,
    to: dbNodeId,
    type: "sync",
    label: "Queries",
    description: "Read and write application data",
  });

  // 7. Cache layer
  if (strategy.techStack.cache && strategy.techStack.cache.length > 0) {
    const cacheNodeId = createNodeId("cache");
    const cacheTech = strategy.techStack.cache[0];
    nodes.push({
      id: cacheNodeId,
      type: "cache",
      label: cacheTech,
      technology: cacheTech,
      purpose: "High-speed data caching and sessions",
      icon: "⚡",
      layer: "data",
      description: "Reduces database load and improves response times",
      risks: ["Stale data", "Cache invalidation complexity"],
      scalability: 90,
    });

    // API → Cache (bidirectional)
    connections.push({
      from: apiNodeId,
      to: cacheNodeId,
      type: "sync",
      label: "Cache Hits/Misses",
    });
  }

  // 8. External services
  // Payment
  if (
    strategy.techStack.other?.some(
      (t) => t.includes("Stripe") || t.includes("Chapa"),
    )
  ) {
    const paymentNodeId = createNodeId("payment");
    const paymentTech =
      strategy.techStack.other.find(
        (t) => t.includes("Stripe") || t.includes("Chapa"),
      ) || "Stripe";
    nodes.push({
      id: paymentNodeId,
      type: "payment",
      label: paymentTech,
      technology: paymentTech,
      purpose: "Payment processing",
      icon: "💳",
      layer: "external",
      description: "Handles payment transactions securely",
      risks: ["PCI compliance", "Transaction failures"],
      costProfile: "paid",
    });

    connections.push({
      from: apiNodeId,
      to: paymentNodeId,
      type: "async",
      label: "Process Payments",
    });
  }

  // Email
  if (
    strategy.techStack.other?.some(
      (t) => t.includes("Resend") || t.includes("SendGrid"),
    )
  ) {
    const emailNodeId = createNodeId("email");
    const emailTech =
      strategy.techStack.other.find(
        (t) => t.includes("Resend") || t.includes("SendGrid"),
      ) || "Resend";
    nodes.push({
      id: emailNodeId,
      type: "email",
      label: emailTech,
      technology: emailTech,
      purpose: "Transactional email delivery",
      icon: "📧",
      layer: "external",
      description: "Sends user notifications and transactional emails",
      risks: ["Email deliverability", "Bounce handling"],
      costProfile: "freemium",
    });

    connections.push({
      from: apiNodeId,
      to: emailNodeId,
      type: "async",
      label: "Send Emails",
    });
  }

  // Monitoring
  if (
    strategy.techStack.monitoring &&
    strategy.techStack.monitoring.length > 0
  ) {
    const monitorNodeId = createNodeId("monitoring");
    const monitorTech = strategy.techStack.monitoring[0];
    nodes.push({
      id: monitorNodeId,
      type: "monitoring",
      label: monitorTech,
      technology: monitorTech,
      purpose: "System health and error monitoring",
      icon: "📊",
      layer: "infrastructure",
      description: "Tracks errors, performance metrics, and system health",
      risks: ["Alert fatigue", "Log storage costs"],
    });

    // All components → Monitoring (observability)
    [apiNodeId, dbNodeId].forEach((nodeId) => {
      connections.push({
        from: nodeId,
        to: monitorNodeId,
        type: "event",
        label: "Metrics & Logs",
      });
    });
  }

  // Organize by layers
  const layers = [
    {
      name: "presentation",
      label: "Presentation Layer",
      color: "rgba(31,180,184,0.1)",
      nodeIds: nodes.filter((n) => n.layer === "presentation").map((n) => n.id),
    },
    {
      name: "api",
      label: "API Layer",
      color: "rgba(11,127,212,0.1)",
      nodeIds: nodes.filter((n) => n.layer === "api").map((n) => n.id),
    },
    {
      name: "data",
      label: "Data Layer",
      color: "rgba(244,178,75,0.1)",
      nodeIds: nodes.filter((n) => n.layer === "data").map((n) => n.id),
    },
    {
      name: "infrastructure",
      label: "Infrastructure Layer",
      color: "rgba(250,204,21,0.1)",
      nodeIds: nodes
        .filter((n) => n.layer === "infrastructure")
        .map((n) => n.id),
    },
    {
      name: "external",
      label: "External Services",
      color: "rgba(232,121,249,0.1)",
      nodeIds: nodes.filter((n) => n.layer === "external").map((n) => n.id),
    },
  ].filter((layer) => layer.nodeIds.length > 0);

  return {
    name: strategy.name,
    description: strategy.description,
    nodes,
    connections,
    layers,
    legend: {
      flows: [
        {
          type: "request",
          description: "HTTP/HTTPS Requests",
          color: "#38bdf8",
        },
        {
          type: "sync",
          description: "Synchronous Operations",
          color: "#22c55e",
        },
        { type: "async", description: "Asynchronous Events", color: "#f4b24b" },
        { type: "event", description: "Event Streaming", color: "#a78bfa" },
        { type: "webhook", description: "Webhooks", color: "#e879f9" },
        { type: "response", description: "Responses", color: "#34d399" },
      ],
    },
  };
}
