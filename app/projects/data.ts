export type Project = {
  slug: string;
  title: string;
  client: string;
  year: string;
  tags: string[];
  description: string;
  summary: string;
  problem: string;
  solution: string;
  outcome: string;
  metrics: string[];
  highlights: string[];
  meta: string[];
};

export const projects: Project[] = [
  {
    slug: "northstar-ai-retail-platform",
    title: "Northstar AI Retail Platform",
    client: "Northstar Retail",
    year: "2025",
    tags: ["AI", "Retail", "Next.js", "Operations"],
    description:
      "An AI-powered retail operations platform with intelligent inventory forecasting, automated order routing, and real-time team coordination.",
    summary:
      "We combined AI agents with a modern operations portal to help retail teams predict demand, coordinate orders, and manage inventory across 50+ locations.",
    problem:
      "Store managers were juggling spreadsheets, WhatsApp updates, and manual approvals — leading to stockouts, over-ordering, and a complete lack of operational visibility.",
    solution:
      "We built an AI-driven platform with predictive inventory analytics, automated reorder triggers, role-based dashboards, and mobile-first workflows designed for low-connectivity environments.",
    outcome:
      "The client eliminated stockouts across their network, reduced manual ordering time by 75%, and gained real-time visibility into operations across all locations.",
    metrics: [
      "75% faster order processing",
      "60% reduction in stockouts",
      "50+ locations connected",
      "3x faster approvals",
    ],
    highlights: [
      "AI-powered demand forecasting and inventory optimization",
      "Role-based dashboards for supervisors and field agents",
      "Offline-first design for real-world connectivity conditions",
      "Automated reorder triggers with approval workflows",
    ],
    meta: ["Launch", "2025"],
  },
  {
    slug: "lumenpay-fintech-erp",
    title: "LumenPay Fintech ERP",
    client: "LumenPay",
    year: "2024",
    tags: ["Fintech", "AI", "ERP", "Payments"],
    description:
      "A modular finance and operations platform with AI-powered reconciliation, fraud detection, and real-time audit reporting across multiple payment channels.",
    summary:
      "We engineered an intelligent finance workspace that automated reconciliation, detected anomalies, and gave leadership instant visibility into risk and cash flow.",
    problem:
      "The team processed millions in monthly payouts but relied on manual reconciliation across mobile money, bank transfers, and card payments — a slow, error-prone process with limited oversight.",
    solution:
      "We deployed an AI-enhanced ERP suite with automated transaction matching, anomaly detection, customizable approval flows, and a real-time compliance dashboard.",
    outcome:
      "Reconciliation time dropped from days to minutes, fraud detection improved by 85%, and the company passed their first regulatory audit with zero findings.",
    metrics: [
      "85% faster reconciliation",
      "Zero audit findings",
      "£4M+ processed monthly",
      "85% fraud detection improvement",
    ],
    highlights: [
      "AI-powered transaction matching and anomaly detection",
      "Unified payout, approval, and reconciliation workflows",
      "Real-time compliance and audit dashboard",
      "Multi-channel payment support (mobile money, cards, bank)",
    ],
    meta: ["Launch", "2024"],
  },
  {
    slug: "ethiologistics-ai-agent",
    title: "EthioLogistics AI Operations Agent",
    client: "EthioLogistics",
    year: "2025",
    tags: ["AI Agents", "LangGraph", "Automation"],
    description:
      "An intelligent AI agent that automates customer inquiries, optimizes delivery routing, and handles exception management for a growing logistics company.",
    summary:
      "We built a LangGraph-orchestrated AI agent that handles 70% of customer inquiries autonomously and optimizes last-mile delivery routing in real time.",
    problem:
      "The customer service team was overwhelmed with tracking inquiries, delivery rescheduling, and exception handling — leading to long wait times and missed SLAs.",
    solution:
      "We developed a multi-agent system using LangGraph: one agent handles customer inquiries via natural language, another optimizes delivery routes, and a third manages exceptions with human handoff protocols.",
    outcome:
      "Customer response time dropped by 70%, delivery efficiency improved by 25%, and the human team now focuses only on high-value exceptions.",
    metrics: [
      "70% faster customer response",
      "25% delivery efficiency gain",
      "85% automated inquiry resolution",
      "3 specialist agents deployed",
    ],
    highlights: [
      "Multi-agent LangGraph architecture for complex workflows",
      "Natural language customer interaction with context retention",
      "Real-time route optimization with traffic awareness",
      "Intelligent human handoff for exceptions",
    ],
    meta: ["Launch", "2025"],
  },
  {
    slug: "chainledger-blockchain-platform",
    title: "ChainLedger Blockchain Operations Platform",
    client: "ChainLedger",
    year: "2025",
    tags: ["Blockchain", "Web3", "Security", "Custom Software"],
    description:
      "A secure blockchain-powered operations platform for digital asset workflows, compliance monitoring, and multi-party transaction coordination.",
    summary:
      "We built a custom blockchain platform that unified asset tracking, approval workflows, and compliance reporting for a fast-moving digital operations team.",
    problem:
      "The client needed a trusted digital system to manage sensitive transaction records, approvals, and audit trails without relying on fragmented spreadsheets or brittle legacy tools.",
    solution:
      "We designed a secure platform with role-based workflows, immutable transaction logging, audit dashboards, and integrations for compliance and operational reporting.",
    outcome:
      "The team reduced reconciliation time by 60%, improved audit readiness, and launched a scalable solution capable of supporting expanding blockchain workflows.",
    metrics: [
      "60% faster reconciliation",
      "100% audit trail visibility",
      "Enterprise-grade workflow controls",
      "Scalable for multi-chain operations",
    ],
    highlights: [
      "Secure blockchain-backed workflow engine",
      "Immutable transaction and approval history",
      "Compliance-ready reporting dashboards",
      "Custom integrations for operational oversight",
    ],
    meta: ["Launch", "2025"],
  },
];
