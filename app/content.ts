/** A single service offering (icon, title, description) */
export type Service = {
  title: string;
  description: string;
  icon: string;
};

/** Client testimonial with quote, attribution, and avatar initials */
export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  avatar: string;
};

/** Company value or principle */
export type Value = {
  title: string;
  description: string;
};

/** A team member profile card */
export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  initials: string;
  image?: string;
};

// ─── Services ─────────────────────────────────────────
export const services: Service[] = [
  {
    title: "Advanced Websites & Web Platforms",
    description:
      "High-performance websites, customer portals, SaaS products, and scalable web applications engineered for speed, usability, and long-term growth.",
    icon: "🌐",
  },
  {
    title: "AI-Based Software & Intelligent Agents",
    description:
      "Custom AI software, copilots, automation flows, and autonomous agents that analyze data, execute tasks, and enhance operational decision-making.",
    icon: "🤖",
  },
  {
    title: "Custom Enterprise Software",
    description:
      "Tailored software systems for unique business processes, internal operations, compliance workflows, reporting, and complex automation requirements.",
    icon: "⚙️",
  },
  {
    title: "ERP, CRM & Business Operations",
    description:
      "Advanced ERP, CRM, inventory, finance, and operations platforms that unify teams, automate work, and deliver real-time visibility across the business.",
    icon: "📊",
  },
  {
    title: "LMS & Learning Platforms",
    description:
      "Modern learning management systems, training portals, and education software designed for learners, instructors, and enterprise training programs.",
    icon: "🎓",
  },
  {
    title: "Blockchain & Web3 Solutions",
    description:
      "Secure blockchain-based systems, smart contract integrations, digital asset workflows, and decentralized applications built with enterprise-grade architecture.",
    icon: "⛓️",
  },
  {
    title: "Mobile & Cross-Platform Apps",
    description:
      "Native and cross-platform applications that connect directly to your web platform, AI workflows, and business systems for a unified experience.",
    icon: "📱",
  },
  {
    title: "Fintech & Payment Systems",
    description:
      "Robust fintech products, payment integrations, reconciliation engines, and compliance-ready solutions for fast-moving digital businesses.",
    icon: "💳",
  },
];

// ─── Testimonials ─────────────────────────────────────
export const testimonials: Testimonial[] = [
  {
    quote:
      "Fera AI Solutions took our concept and turned it into a fully operational platform in under 8 weeks. Their AI-powered approach to development is genuinely game-changing.",
    author: "Amina H.",
    role: "COO, Northstar Retail",
    avatar: "AH",
  },
  {
    quote:
      "Their team brought structure to a chaotic operation without slowing us down. The ERP suite they built transformed how we manage payments across the continent.",
    author: "Daniel K.",
    role: "Founder, LumenPay",
    avatar: "DK",
  },
  {
    quote:
      "Every release was polished, well-documented, and perfectly aligned with our growth strategy. This is the most professional engineering team we have worked with.",
    author: "Nedya S.",
    role: "Director, BlueLake Health",
    avatar: "NS",
  },
  {
    quote:
      "The AI agent they built for our customer operations reduced response time by 70% while maintaining a personal touch. Exceptional work.",
    author: "Yonas A.",
    role: "CTO, EthioLogistics",
    avatar: "YA",
  },
];

// ─── Company stats / highlights ───────────────────────
export const companyHighlights = [
  {
    number: "50+",
    label: "Digital products shipped",
    detail:
      "From internal tools to public platforms serving thousands of users.",
  },
  {
    number: "15+",
    label: "Markets served",
    detail: "Africa, Europe, Middle East, and North America.",
  },
  {
    number: "98%",
    label: "Client retention rate",
    detail: "Long-term partners built through trust and recurring support.",
  },
  {
    number: "4.9/5",
    label: "Client satisfaction score",
    detail: "Across all projects delivered in the last 3 years.",
  },
];

// ─── Company values / principles ──────────────────────
export const values: Value[] = [
  {
    title: "Advanced AI-First Engineering",
    description:
      "We leverage artificial intelligence at every stage of development — from product strategy to delivery and optimization — accelerating execution without sacrificing quality.",
  },
  {
    title: "Enterprise-Grade Architecture",
    description:
      "Every platform is designed for scale, resilience, security, and maintainability so it can grow with your business from day one.",
  },
  {
    title: "Secure by Design",
    description:
      "We build with security, compliance, and operational reliability in mind, ensuring that production systems are dependable from launch onward.",
  },
  {
    title: "Partnership Over Contracts",
    description:
      "We invest in understanding your business deeply and stay engaged long after launch to support growth, iteration, and continuous improvement.",
  },
];

// ─── Team members ─────────────────────────────────────
export const teamMembers: TeamMember[] = [
  {
    name: "Awoke Zemenu",
    role: "Software Developer",
    bio: "Builds reliable web platforms, modern user interfaces, and scalable product experiences with a strong focus on clean architecture and maintainable code.",
    initials: "AZ",
    image: "/Awoke%20Zemenu.png",
  },
  {
    name: "Fiseha Lidetu",
    role: "Software Developer",
    bio: "Builds reliable web platforms, modern user interfaces, and scalable product experiences with a strong focus on clean architecture and maintainable code.",
    initials: "FL",
    image: "/Fiseha%20Lidetu.png",
  },
  {
    name: "Kedir Kassa",
    role: "Marketing",
    bio: "Leads strategy, positioning, and growth messaging to help ambitious companies connect their technology with the right audiences and outcomes.",
    initials: "KK",
    image: "/Kedir%20kassa.jpg",
  },
  {
    name: "Tamirat Woldekidan",
    role: "Cybersecurity",
    bio: "Protects digital products and operations through security-first design, risk assessment, and resilient implementation practices.",
    initials: "TW",
    image: "/Tamirat%20Woldekidan.jpg",
  },
];

// ─── Industries we serve ──────────────────────────────
export const industries = [
  "Retail & E-commerce",
  "Logistics & Fleet Operations",
  "Healthcare & Clinics",
  "Construction & Field Services",
  "Fintech & Payments",
  "Education & Learning Platforms",
  "Blockchain & Web3",
  "Enterprise Operations & Custom Software",
];

export const partners = [
  "Supabase",
  "Vercel",
  "OpenAI",
  "LangChain",
  "Stripe",
  "Google Cloud",
];
