export type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: string;
};

export const insights: Insight[] = [
  {
    slug: "ai-first-development-future-of-software",
    title: "AI-First Development: The Future of Software Engineering",
    excerpt:
      "How we leverage artificial intelligence across the entire development lifecycle — from code generation to testing, deployment, and monitoring.",
    category: "AI Engineering",
    publishedAt: "July 2026",
    readTime: "6 min read",
  },
  {
    slug: "designing-ai-agents-for-real-world-operations",
    title: "Designing AI Agents for Real-World Operations",
    excerpt:
      "Practical lessons from deploying production AI agents that handle customer inquiries, optimize logistics, and know when to escalate to humans.",
    category: "AI Systems",
    publishedAt: "June 2026",
    readTime: "7 min read",
  },
  {
    slug: "building-scalable-erp-for-emerging-markets",
    title: "Building Scalable ERP and Operations Systems for Emerging Markets",
    excerpt:
      "What we learned designing enterprise resource planning systems and custom business platforms that work reliably in low-connectivity, high-growth environments.",
    category: "Product Strategy",
    publishedAt: "May 2026",
    readTime: "5 min read",
  },
  {
    slug: "fintech-reconciliation-best-practices",
    title: "Fintech Reconciliation and Blockchain-Aware Operations",
    excerpt:
      "A technical deep dive into building audit-ready payment reconciliation systems and secure digital workflows for mobile money, cards, bank transfers, and blockchain-based operations.",
    category: "Fintech",
    publishedAt: "April 2026",
    readTime: "8 min read",
  },
];
