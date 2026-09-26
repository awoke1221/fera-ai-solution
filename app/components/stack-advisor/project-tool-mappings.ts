// ─── Per-Project-Type Tool Mappings ─────────────────
// Defines dynamic filtering rules: which categories are required,
// which tools to prioritize/hide, and custom ordering per project type.
import type { ProjectToolMapping } from "./types";

export const projectToolMappings: ProjectToolMapping[] = [
  // ─── LMS / LEARNING PLATFORM ──────────────────────
  {
    projectType: "lms",
    note: "LMS platforms need strong video/content delivery, payment for course sales, and email for student notifications.",
    forceRequiredCategories: ["payment", "storage", "email"],
    hideCategories: ["search", "mobile"],
    categoryOrder: [
      "frontend",
      "backend",
      "database",
      "auth",
      "storage",
      "payment",
      "email",
      "deploy_frontend",
      "deploy_backend",
      "cicd",
      "cache",
      "testing",
      "monitoring",
      "css_ui",
      "state_mgmt",
    ],
    categoryPriorities: {
      storage: {
        reason:
          "Prioritized for Ethiopian media delivery and lower bandwidth cost.",
        prioritize: ["bunny", "cloudinary", "supabase_storage"],
        hide: [],
        ethiopianPriority: ["bunny"],
      },
      payment: {
        reason: "Prioritized for Ethiopian mobile-money and payment support.",
        prioritize: ["chapa", "paypal", "stripe"],
        hide: ["telebirr"],
        ethiopianPriority: ["chapa"],
      },
      backend: {
        reason:
          "Prioritized for a lightweight LMS backend without unnecessary complexity.",
        prioritize: ["nextjs_api", "node", "python_fastapi"],
        hide: [],
        ethiopianPriority: [],
      },
      email: {
        reason: "Prioritized for reliable student and admin notifications.",
        prioritize: ["resend", "sendgrid"],
        hide: [],
        ethiopianPriority: ["resend"],
      },
    },
  },

  // ─── E-COMMERCE / MARKETPLACE ─────────────────────
  {
    projectType: "ecommerce",
    note: "E-commerce requires payment, storage for product images, search for product discovery, and email for order confirmations.",
    forceRequiredCategories: ["payment", "storage", "email", "search"],
    hideCategories: ["mobile"],
    categoryOrder: [
      "frontend",
      "backend",
      "database",
      "auth",
      "storage",
      "payment",
      "search",
      "email",
      "deploy_frontend",
      "deploy_backend",
      "cicd",
      "cache",
      "testing",
      "monitoring",
      "css_ui",
      "state_mgmt",
    ],
    categoryPriorities: {
      storage: {
        reason:
          "Prioritized for product media delivery and faster storefront performance.",
        prioritize: ["cloudinary", "bunny", "supabase_storage"],
        hide: [],
        ethiopianPriority: ["bunny", "cloudinary"],
      },
      payment: {
        reason:
          "Prioritized for checkout conversion and Ethiopian payment coverage.",
        prioritize: ["chapa", "stripe", "paypal", "telebirr"],
        hide: [],
        ethiopianPriority: ["chapa", "telebirr"],
      },
      search: {
        reason:
          "Prioritized for browse-heavy storefront discovery and product findability.",
        prioritize: ["meilisearch", "algolia", "typesense"],
        hide: [],
        ethiopianPriority: ["meilisearch"],
      },
      cache: {
        reason:
          "Prioritized for faster checkout and catalog reads during traffic spikes.",
        prioritize: ["redis_upstash", "redis_self"],
        hide: [],
        ethiopianPriority: ["redis_self"],
      },
    },
  },

  // ─── SAAS PLATFORM ────────────────────────────────
  {
    projectType: "saas",
    note: "SaaS needs payment subscriptions, email for onboarding, caching for performance, and monitoring for uptime.",
    forceRequiredCategories: ["payment", "email", "cache", "monitoring"],
    hideCategories: ["search", "mobile"],
    categoryOrder: [
      "frontend",
      "backend",
      "database",
      "auth",
      "storage",
      "payment",
      "email",
      "cache",
      "monitoring",
      "deploy_frontend",
      "deploy_backend",
      "cicd",
      "testing",
      "css_ui",
      "state_mgmt",
    ],
    categoryPriorities: {
      payment: {
        reason: "Prioritized for recurring billing and subscription flows.",
        prioritize: ["stripe", "chapa", "paypal"],
        hide: ["telebirr"],
        ethiopianPriority: ["chapa"],
      },
      cache: {
        reason:
          "Prioritized for session speed and dashboard performance under load.",
        prioritize: ["redis_upstash", "redis_self"],
        hide: [],
        ethiopianPriority: ["redis_upstash"],
      },
      monitoring: {
        reason:
          "Prioritized for uptime visibility and product health tracking.",
        prioritize: ["sentry", "posthog"],
        hide: [],
        ethiopianPriority: ["posthog"],
      },
      email: {
        reason: "Prioritized for onboarding and account lifecycle messaging.",
        prioritize: ["resend", "sendgrid"],
        hide: [],
        ethiopianPriority: ["resend"],
      },
    },
  },

  // ─── SOCIAL MEDIA / COMMUNITY ─────────────────────
  {
    projectType: "social",
    note: "Social platforms need real-time DB, strong auth, storage for media, caching for feeds, and mobile support.",
    forceRequiredCategories: ["storage", "cache", "email"],
    hideCategories: ["payment", "search"],
    categoryOrder: [
      "frontend",
      "backend",
      "database",
      "auth",
      "storage",
      "cache",
      "email",
      "deploy_frontend",
      "deploy_backend",
      "cicd",
      "testing",
      "monitoring",
      "css_ui",
      "state_mgmt",
      "mobile",
    ],
    categoryPriorities: {
      database: {
        reason:
          "Prioritized for real-time social data and fast feed interactions.",
        prioritize: ["supabase_db", "mongodb", "postgresql"],
        hide: [],
        ethiopianPriority: ["supabase_db"],
      },
      storage: {
        reason:
          "Prioritized for image-heavy social content and media delivery.",
        prioritize: ["supabase_storage", "cloudinary", "bunny"],
        hide: [],
        ethiopianPriority: ["bunny"],
      },
      cache: {
        reason:
          "Prioritized for feed performance and low-latency engagement loops.",
        prioritize: ["redis_upstash", "redis_self"],
        hide: [],
        ethiopianPriority: ["redis_upstash"],
      },
      mobile: {
        reason:
          "Prioritized for Android-first engagement in Ethiopian markets.",
        prioritize: ["react_native", "flutter"],
        hide: [],
        ethiopianPriority: ["react_native"],
      },
    },
  },

  // ─── ENTERPRISE ERP ───────────────────────────────
  {
    projectType: "erp",
    note: "ERP systems need robust databases, PDF/document storage, email, and often local hosting for data residency.",
    forceRequiredCategories: ["email", "cache"],
    hideCategories: ["search", "mobile"],
    categoryOrder: [
      "frontend",
      "backend",
      "database",
      "auth",
      "storage",
      "email",
      "cache",
      "deploy_frontend",
      "deploy_backend",
      "cicd",
      "testing",
      "monitoring",
      "css_ui",
      "state_mgmt",
    ],
    categoryPriorities: {
      backend: {
        reason:
          "Prioritized for enterprise-grade CRUD, compliance, and predictable operations.",
        prioritize: [
          "django",
          "python_fastapi",
          "node",
          "nextjs_api",
          "laravel",
        ],
        hide: [],
        ethiopianPriority: ["django", "laravel"],
      },
      database: {
        reason:
          "Prioritized for relational integrity and local data residency requirements.",
        prioritize: ["postgresql", "supabase_db", "neon"],
        hide: ["mongodb", "planetscale"],
        ethiopianPriority: ["postgresql"],
      },
      deploy_backend: {
        reason:
          "Prioritized for controlled hosting, security, and local deployment options.",
        prioritize: ["docker_vps", "railway", "render"],
        hide: [],
        ethiopianPriority: ["docker_vps"],
      },
      auth: {
        reason:
          "Prioritized for secure identity flows with low operational overhead.",
        prioritize: ["nextauth", "supabase_auth", "clerk"],
        hide: ["firebase_auth"],
        ethiopianPriority: ["nextauth"],
      },
    },
  },

  // ─── FINTECH / PAYMENT PLATFORM ───────────────────
  {
    projectType: "fintech",
    note: "Fintech requires strong data consistency, Ethiopian payment gateways, audit logging, and local hosting for compliance.",
    forceRequiredCategories: ["payment", "cache", "monitoring"],
    hideCategories: ["search", "mobile"],
    categoryOrder: [
      "frontend",
      "backend",
      "database",
      "auth",
      "storage",
      "payment",
      "cache",
      "monitoring",
      "deploy_frontend",
      "deploy_backend",
      "cicd",
      "testing",
      "email",
      "css_ui",
      "state_mgmt",
    ],
    categoryPriorities: {
      backend: {
        reason:
          "Prioritized for secure API performance and compliance-friendly backend operations.",
        prioritize: ["python_fastapi", "go_gin", "node", "nextjs_api"],
        hide: [],
        ethiopianPriority: ["python_fastapi"],
      },
      database: {
        reason:
          "Prioritized for strong consistency, auditability, and data residency control.",
        prioritize: ["postgresql", "supabase_db", "neon", "turso"],
        hide: ["mongodb", "planetscale"],
        ethiopianPriority: ["postgresql"],
      },
      payment: {
        reason:
          "Prioritized for Ethiopian payment rails and transaction safety.",
        prioritize: ["chapa", "telebirr", "stripe", "paypal"],
        hide: [],
        ethiopianPriority: ["chapa", "telebirr"],
      },
      cache: {
        reason: "Prioritized for faster transaction and audit-log reads.",
        prioritize: ["redis_upstash", "redis_self"],
        hide: [],
        ethiopianPriority: ["redis_self"],
      },
      monitoring: {
        reason:
          "Prioritized for fraud alerts, observability, and operational traceability.",
        prioritize: ["sentry", "posthog"],
        hide: [],
        ethiopianPriority: ["sentry"],
      },
    },
  },

  // ─── HEALTHCARE / TELEMEDICINE ────────────────────
  {
    projectType: "healthcare",
    note: "Healthcare requires HIPAA/GDPR compliance, secure data storage, email for appointments, and local data residency.",
    forceRequiredCategories: ["email", "storage", "monitoring"],
    hideCategories: ["search", "payment", "mobile"],
    categoryOrder: [
      "frontend",
      "backend",
      "database",
      "auth",
      "storage",
      "email",
      "monitoring",
      "deploy_frontend",
      "deploy_backend",
      "cicd",
      "cache",
      "testing",
      "css_ui",
      "state_mgmt",
    ],
    categoryPriorities: {
      backend: {
        reason:
          "Prioritized for secure patient workflows and healthcare-grade reliability.",
        prioritize: ["django", "python_fastapi", "node", "nextjs_api"],
        hide: [],
        ethiopianPriority: ["django", "python_fastapi"],
      },
      database: {
        reason:
          "Prioritized for privacy-sensitive records and local deployment constraints.",
        prioritize: ["postgresql", "supabase_db", "neon"],
        hide: ["mongodb", "planetscale", "turso"],
        ethiopianPriority: ["postgresql"],
      },
      deploy_backend: {
        reason:
          "Prioritized for self-hosted and regulated infrastructure control.",
        prioritize: ["docker_vps", "railway", "render"],
        hide: [],
        ethiopianPriority: ["docker_vps"],
      },
      storage: {
        reason:
          "Prioritized for confidential document storage and data-access control.",
        prioritize: ["supabase_storage", "cloudinary"],
        hide: ["bunny"],
        ethiopianPriority: ["supabase_storage"],
      },
    },
  },

  // ─── REAL ESTATE PLATFORM ─────────────────────────
  {
    projectType: "realestate",
    note: "Real estate needs image-rich storage, search for property discovery, payment for booking deposits, and email for inquiries.",
    forceRequiredCategories: ["storage", "search", "email"],
    hideCategories: ["mobile"],
    categoryOrder: [
      "frontend",
      "backend",
      "database",
      "auth",
      "storage",
      "search",
      "email",
      "payment",
      "deploy_frontend",
      "deploy_backend",
      "cicd",
      "cache",
      "testing",
      "monitoring",
      "css_ui",
      "state_mgmt",
    ],
    categoryPriorities: {
      storage: {
        reason:
          "Prioritized for visual property listings and high-quality media capture.",
        prioritize: ["cloudinary", "bunny", "supabase_storage"],
        hide: [],
        ethiopianPriority: ["cloudinary", "bunny"],
      },
      search: {
        reason:
          "Prioritized for location-driven property discovery and filtering.",
        prioritize: ["meilisearch", "algolia", "typesense"],
        hide: [],
        ethiopianPriority: ["meilisearch"],
      },
      database: {
        reason:
          "Prioritized for listing data, lead records, and fast retrieval.",
        prioritize: ["supabase_db", "postgresql", "neon"],
        hide: [],
        ethiopianPriority: ["postgresql"],
      },
    },
  },

  // ─── CONTENT / MEDIA PLATFORM ─────────────────────
  {
    projectType: "content",
    note: "Content platforms need strong CDN/delivery, search for content discovery, email for newsletters, and caching for performance.",
    forceRequiredCategories: ["storage", "search", "email", "cache"],
    hideCategories: ["payment", "mobile"],
    categoryOrder: [
      "frontend",
      "backend",
      "database",
      "auth",
      "storage",
      "search",
      "email",
      "cache",
      "deploy_frontend",
      "deploy_backend",
      "cicd",
      "testing",
      "monitoring",
      "css_ui",
      "state_mgmt",
    ],
    categoryPriorities: {
      storage: {
        reason:
          "Prioritized for CDN-heavy media delivery and fast content access.",
        prioritize: ["bunny", "cloudinary", "supabase_storage"],
        hide: [],
        ethiopianPriority: ["bunny"],
      },
      search: {
        reason: "Prioritized for content discovery and article/topic indexing.",
        prioritize: ["meilisearch", "algolia", "typesense"],
        hide: [],
        ethiopianPriority: ["meilisearch"],
      },
      cache: {
        reason:
          "Prioritized for high-volume reading and performant content feeds.",
        prioritize: ["redis_upstash", "redis_self"],
        hide: [],
        ethiopianPriority: ["redis_upstash"],
      },
      frontend: {
        reason:
          "Prioritized for a lightweight front end that works well on low-bandwidth connections.",
        prioritize: ["nextjs", "astro", "vue", "svelte"],
        hide: [],
        ethiopianPriority: ["astro"],
      },
      email: {
        reason:
          "Prioritized for newsletter and subscriber lifecycle workflows.",
        prioritize: ["resend", "sendgrid"],
        hide: [],
        ethiopianPriority: ["resend"],
      },
    },
  },

  // ─── BOOKING / RESERVATION SYSTEM ─────────────────
  {
    projectType: "booking",
    note: "Booking systems need real-time availability, payment for deposits, email for confirmations, and caching for availability checks.",
    forceRequiredCategories: ["payment", "email", "cache"],
    hideCategories: ["search", "mobile"],
    categoryOrder: [
      "frontend",
      "backend",
      "database",
      "auth",
      "storage",
      "payment",
      "email",
      "cache",
      "deploy_frontend",
      "deploy_backend",
      "cicd",
      "testing",
      "monitoring",
      "css_ui",
      "state_mgmt",
    ],
    categoryPriorities: {
      payment: {
        reason:
          "Prioritized for booking deposits and local payment convenience.",
        prioritize: ["chapa", "stripe", "paypal"],
        hide: ["telebirr"],
        ethiopianPriority: ["chapa"],
      },
      cache: {
        reason:
          "Prioritized for live availability checks and faster booking flows.",
        prioritize: ["redis_upstash", "redis_self"],
        hide: [],
        ethiopianPriority: ["redis_upstash"],
      },
      database: {
        reason:
          "Prioritized for reservation records and high-frequency booking writes.",
        prioritize: ["supabase_db", "postgresql", "neon", "turso"],
        hide: [],
        ethiopianPriority: ["supabase_db"],
      },
    },
  },
];

/** Helper: get the mapping for a given project type ID */
export function getProjectMapping(
  projectTypeId: string,
): ProjectToolMapping | undefined {
  return projectToolMappings.find((m) => m.projectType === projectTypeId);
}

/** Get ordered categories for a project type (with custom ordering applied) */
export function getOrderedCategories(
  mapping: ProjectToolMapping | undefined,
  defaultCategories: { id: string; required: boolean }[],
): { id: string; required: boolean }[] {
  if (!mapping) return defaultCategories;

  const filtered = defaultCategories.filter(
    (c) => !mapping.hideCategories.includes(c.id),
  );

  // Apply custom order if defined
  if (mapping.categoryOrder.length > 0) {
    const ordered = mapping.categoryOrder
      .map((id) => filtered.find((c) => c.id === id))
      .filter(Boolean) as { id: string; required: boolean }[];
    // Append any categories not in the custom order
    const remaining = filtered.filter(
      (c) => !mapping.categoryOrder.includes(c.id),
    );
    return [...ordered, ...remaining];
  }

  return filtered;
}

/** Check if a category is required for a given project type */
export function isCategoryRequired(
  categoryId: string,
  mapping: ProjectToolMapping | undefined,
  defaultRequired: boolean,
): boolean {
  if (!mapping) return defaultRequired;
  if (mapping.forceRequiredCategories.includes(categoryId)) return true;
  return defaultRequired;
}

/** Sort tools based on project type priorities */
export function sortToolsForProject(
  tools: { id: string; recommended: boolean }[],
  categoryId: string,
  mapping: ProjectToolMapping | undefined,
  isEthiopianContext: boolean = true,
): { id: string; recommended: boolean }[] {
  if (!mapping) return tools;

  const priorities = mapping.categoryPriorities[categoryId];
  if (!priorities) return tools;

  // Filter out hidden tools
  let visible = tools.filter((t) => !priorities.hide.includes(t.id));

  // Sort: prioritized first, then recommended, then alphabetical by id
  return [...visible].sort((a, b) => {
    const aPri = priorities.prioritize.indexOf(a.id);
    const bPri = priorities.prioritize.indexOf(b.id);
    // Prioritized tools come first
    if (aPri !== -1 && bPri !== -1) return aPri - bPri;
    if (aPri !== -1) return -1;
    if (bPri !== -1) return 1;
    // Then recommended
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    // Ethiopian priority boost
    if (isEthiopianContext) {
      const aEth = priorities.ethiopianPriority.indexOf(a.id);
      const bEth = priorities.ethiopianPriority.indexOf(b.id);
      if (aEth !== -1 && bEth !== -1) return aEth - bEth;
      if (aEth !== -1) return -1;
      if (bEth !== -1) return 1;
    }
    return a.id.localeCompare(b.id);
  });
}
