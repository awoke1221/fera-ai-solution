// ─── Extra Frontend Frameworks ─────────────────────────
import type { ToolOption } from "../types";

export const frontendExtraTools: ToolOption[] = [
  {
    id: "vue",
    name: "Vue.js + Nuxt",
    icon: "💚",
    description:
      "Progressive JavaScript framework with Nuxt for SSR, SSG, file-based routing, and auto-imports. Great for content sites and SPAs.",
    category: "frontend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free — hosting costs apply",
    scalability:
      "Excellent — Nuxt 3 supports SSR, SSG, ISR, edge rendering, and CDN deployment",
    config: {
      envVars: [
        "NUXT_PUBLIC_SITE_URL",
        "NUXT_PUBLIC_SUPABASE_URL",
        "NUXT_PUBLIC_SUPABASE_ANON_KEY",
        "DATABASE_URL",
      ],
      setupSteps: [
        "npx nuxi@latest init my-app",
        "Choose your package manager and install dependencies",
        "Configure nuxt.config.ts for modules and runtime config",
        "Create pages under pages/ directory",
        "Deploy on Vercel, Netlify, or Cloudflare Pages",
      ],
      packages: ["nuxt", "vue", "@pinia/nuxt", "@nuxtjs/supabase"],
    },
    integration: {
      connectsTo: [
        "supabase_db",
        "vercel",
        "netlify",
        "cloudflare_pages",
        "node",
      ],
      notes:
        "Nuxt 3 has excellent Supabase integration via @nuxtjs/supabase. Pinia for state management. Auto-imports reduce boilerplate.",
    },
    ethiopianSupport:
      "Fully supported. Nuxt sites are lightweight. Deploy on Vercel (free) or Cloudflare Pages (unlimited bandwidth).",
    limitations: [
      "Smaller ecosystem than Next.js",
      "Fewer Ethiopian developers compared to React/Next.js",
    ],
    docsUrl: "https://nuxt.com/docs",
  },
  {
    id: "svelte",
    name: "Svelte + SvelteKit",
    icon: "🧡",
    description:
      "Compiler-driven UI framework with minimal boilerplate. SvelteKit provides SSR, SSG, API routes, and adapter-based deployment.",
    category: "frontend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free — hosting costs apply",
    scalability:
      "Excellent — compiled output is tiny and fast. SvelteKit supports serverless, edge, and static adapters.",
    config: {
      envVars: [
        "PUBLIC_SUPABASE_URL",
        "PUBLIC_SUPABASE_ANON_KEY",
        "DATABASE_URL",
      ],
      setupSteps: [
        "npx sv create my-app",
        "Select SvelteKit demo app with TypeScript",
        "Configure svelte.config.js with adapter",
        "Create routes under src/routes/",
        "Install Supabase client for auth and DB",
      ],
      packages: [
        "@sveltejs/kit",
        "@sveltejs/adapter-vercel",
        "@supabase/supabase-js",
      ],
    },
    integration: {
      connectsTo: ["supabase_db", "vercel", "node"],
      notes:
        "SvelteKit compiles to tiny JS bundles. Adapter-based deployment works with Vercel, Netlify, Cloudflare, and Node.",
    },
    ethiopianSupport:
      "Excellent — compiled output is lightweight, ideal for slower Ethiopian internet connections.",
    limitations: [
      "Smaller community and ecosystem than React",
      "Fewer job opportunities for Svelte devs in Ethiopia",
    ],
    docsUrl: "https://kit.svelte.dev/docs",
  },
  {
    id: "remix",
    name: "Remix",
    icon: "🧶",
    description:
      "Full-stack React framework focused on web fundamentals: nested routes, data loading, forms, and progressive enhancement.",
    category: "frontend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free — Remix is free. Hosting on Fly.io or Vercel (costs apply)",
    scalability:
      "Excellent — HTTP caching, nested routes load data in parallel, optimized for CDN caching",
    config: {
      envVars: [
        "REMIX_APP_URL",
        "DATABASE_URL",
        "SESSION_SECRET",
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY",
      ],
      setupSteps: [
        "npx create-remix@latest my-app",
        "Choose Vercel or Fly.io deployment",
        "Configure remix.config.js for routes",
        "Set up database with Prisma",
        "Implement auth with remix-auth or Supabase",
      ],
      packages: [
        "@remix-run/react",
        "@remix-run/node",
        "@remix-run/vercel",
        "prisma",
      ],
    },
    integration: {
      connectsTo: ["postgresql", "supabase_db", "vercel", "node"],
      notes:
        "Remix embraces web standards — forms work without JS. Great for SEO. Nested routes enable parallel data loading.",
    },
    ethiopianSupport:
      "Good — progressive enhancement means forms work even on slow connections.",
    limitations: [
      "Smaller ecosystem than Next.js",
      "Learning curve for nested route patterns",
    ],
    docsUrl: "https://remix.run/docs",
  },
  {
    id: "astro",
    name: "Astro",
    icon: "🚀",
    description:
      "Content-first web framework with zero-JS output by default. Supports multiple UI frameworks (React, Vue, Svelte) in one project.",
    category: "frontend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free — hosting costs apply",
    scalability:
      "Excellent — static output by default, partial hydration, edge-ready with Astro Islands",
    config: {
      envVars: [
        "PUBLIC_SITE_URL",
        "PUBLIC_SUPABASE_URL",
        "PUBLIC_SUPABASE_ANON_KEY",
      ],
      setupSteps: [
        "npm create astro@latest my-app",
        "Select template (blog, portfolio, docs)",
        "Add integrations: React, Tailwind, Supabase",
        "Create pages in src/pages/",
        "Deploy on Vercel, Netlify, or Cloudflare",
      ],
      packages: [
        "astro",
        "@astrojs/react",
        "@astrojs/vercel",
        "@astrojs/tailwind",
      ],
    },
    integration: {
      connectsTo: ["supabase_db", "vercel", "netlify", "cloudflare_pages"],
      notes:
        "Astro shines for content-heavy sites (blogs, marketing, docs). Use Astro Islands for interactive components with React/Vue/Svelte.",
    },
    ethiopianSupport:
      "Excellent — zero-JS output by default means fast loading for Ethiopian users on slow connections.",
    limitations: [
      "Not ideal for highly interactive web apps",
      "Limited API route support compared to Next.js",
    ],
    docsUrl: "https://docs.astro.build",
  },
  {
    id: "nextjs_pages",
    name: "Next.js (Pages Router)",
    icon: "▲",
    description:
      "Classic Next.js with Pages Router — stable, battle-tested, with getStaticProps, getServerSideProps, and API routes.",
    category: "frontend",
    recommended: false,
    freeTier: "Fully open-source, free to use",
    pricing: "Free — Vercel hosting has pay-as-you-go plans",
    scalability:
      "Excellent — ISR, CDN caching, edge functions, auto-scaling on Vercel",
    config: {
      envVars: [
        "NEXT_PUBLIC_APP_URL",
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "DATABASE_URL",
      ],
      setupSteps: [
        "npx create-next-app@latest my-app --typescript",
        "Choose Pages Router option",
        "Set up getStaticProps/getServerSideProps for pages",
        "Create API routes under pages/api/",
        "Configure next.config.js for images and rewrites",
      ],
      packages: ["next", "react", "react-dom", "typescript"],
    },
    integration: {
      connectsTo: ["supabase_db", "vercel", "node"],
      notes:
        "Pages Router is stable and well-documented. Good for projects that don't need the latest App Router features.",
    },
    ethiopianSupport:
      "Fully supported. Stable and battle-tested. Host on Vercel or any Node.js server.",
    limitations: [
      "App Router is the future — Pages Router is in maintenance mode",
      "No React Server Components (available in App Router)",
    ],
    docsUrl: "https://nextjs.org/docs/pages",
  },
];
