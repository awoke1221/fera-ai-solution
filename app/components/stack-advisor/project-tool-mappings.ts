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
        prioritize: ["bunny", "cloudinary", "supabase_storage"],
        hide: [],
        ethiopianPriority: ["bunny"],
      },
      payment: {
        prioritize: ["chapa", "paypal", "stripe"],
        hide: ["telebirr"],
        ethiopianPriority: ["chapa"],
      },
      backend: {
        prioritize: ["nextjs_api", "node", "python_fastapi"],
        hide: [],
        ethiopianPriority: [],
      },
      email: {
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
        prioritize: ["cloudinary", "bunny", "supabase_storage"],
        hide: [],
        ethiopianPriority: ["bunny", "cloudinary"],
      },
      payment: {
        prioritize: ["chapa", "stripe", "paypal", "telebirr"],
        hide: [],
        ethiopianPriority: ["chapa", "telebirr"],
      },
      search: {
        prioritize: ["meilisearch", "algolia", "typesense"],
        hide: [],
        ethiopianPriority: ["meilisearch"],
      },
      cache: {
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
        prioritize: ["stripe", "chapa", "paypal"],
        hide: ["telebirr"],
        ethiopianPriority: ["chapa"],
      },
      cache: {
        prioritize: ["redis_upstash", "redis_self"],
        hide: [],
        ethiopianPriority: ["redis_upstash"],
      },
      monitoring: {
        prioritize: ["sentry", "posthog"],
        hide: [],
        ethiopianPriority: ["posthog"],
      },
      email: {
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
        prioritize: ["supabase_db", "mongodb", "postgresql"],
        hide: [],
        ethiopianPriority: ["supabase_db"],
      },
      storage: {
        prioritize: ["supabase_storage", "cloudinary", "bunny"],
        hide: [],
        ethiopianPriority: ["bunny"],
      },
      cache: {
        prioritize: ["redis_upstash", "redis_self"],
        hide: [],
        ethiopianPriority: ["redis_upstash"],
      },
      mobile: {
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
        prioritize: ["postgresql", "supabase_db", "neon"],
        hide: ["mongodb", "planetscale"],
        ethiopianPriority: ["postgresql"],
      },
      deploy_backend: {
        prioritize: ["docker_vps", "railway", "render"],
        hide: [],
        ethiopianPriority: ["docker_vps"],
      },
      auth: {
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
        prioritize: ["python_fastapi", "go_gin", "node", "nextjs_api"],
        hide: [],
        ethiopianPriority: ["python_fastapi"],
      },
      database: {
        prioritize: ["postgresql", "supabase_db", "neon", "turso"],
        hide: ["mongodb", "planetscale"],
        ethiopianPriority: ["postgresql"],
      },
      payment: {
        prioritize: ["chapa", "telebirr", "stripe", "paypal"],
        hide: [],
        ethiopianPriority: ["chapa", "telebirr"],
      },
      cache: {
        prioritize: ["redis_upstash", "redis_self"],
        hide: [],
        ethiopianPriority: ["redis_self"],
      },
      monitoring: {
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
        prioritize: ["django", "python_fastapi", "node", "nextjs_api"],
        hide: [],
        ethiopianPriority: ["django", "python_fastapi"],
      },
      database: {
        prioritize: ["postgresql", "supabase_db", "neon"],
        hide: ["mongodb", "planetscale", "turso"],
        ethiopianPriority: ["postgresql"],
      },
      deploy_backend: {
        prioritize: ["docker_vps", "railway", "render"],
        hide: [],
        ethiopianPriority: ["docker_vps"],
      },
      storage: {
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
        prioritize: ["cloudinary", "bunny", "supabase_storage"],
        hide: [],
        ethiopianPriority: ["cloudinary", "bunny"],
      },
      search: {
        prioritize: ["meilisearch", "algolia", "typesense"],
        hide: [],
        ethiopianPriority: ["meilisearch"],
      },
      database: {
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
        prioritize: ["bunny", "cloudinary", "supabase_storage"],
        hide: [],
        ethiopianPriority: ["bunny"],
      },
      search: {
        prioritize: ["meilisearch", "algolia", "typesense"],
        hide: [],
        ethiopianPriority: ["meilisearch"],
      },
      cache: {
        prioritize: ["redis_upstash", "redis_self"],
        hide: [],
        ethiopianPriority: ["redis_upstash"],
      },
      frontend: {
        prioritize: ["nextjs", "astro", "vue", "svelte"],
        hide: [],
        ethiopianPriority: ["astro"],
      },
      email: {
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
        prioritize: ["chapa", "stripe", "paypal"],
        hide: ["telebirr"],
        ethiopianPriority: ["chapa"],
      },
      cache: {
        prioritize: ["redis_upstash", "redis_self"],
        hide: [],
        ethiopianPriority: ["redis_upstash"],
      },
      database: {
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
