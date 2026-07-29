// ─── Frontend Framework Tools ──────────────────────────
import type { ToolOption } from "../types";

export const frontendTools: ToolOption[] = [
  {
    id: "nextjs",
    name: "Next.js",
    icon: "▲",
    description:
      "React framework with SSR, SSG, API routes, and file-based routing. Best for full-stack apps.",
    category: "frontend",
    recommended: true,
    freeTier: "Fully open-source, free to use",
    pricing: "Free — Vercel hosting has pay-as-you-go plans",
    scalability:
      "Excellent — supports ISR, edge functions, CDN caching, auto-scaling on Vercel",
    config: {
      envVars: [
        "NEXT_PUBLIC_APP_URL",
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "DATABASE_URL",
      ],
      setupSteps: [
        "npx create-next-app@latest my-app --typescript --tailwind",
        "Configure next.config.js for images, rewrites, etc.",
        "Set up layout.tsx with fonts and metadata",
        "Create pages under app/ directory using App Router",
      ],
      packages: ["next", "react", "react-dom", "@types/node", "typescript"],
    },
    integration: {
      connectsTo: ["supabase", "vercel", "github_actions", "react"],
      notes:
        "Next.js integrates seamlessly with Supabase via @supabase/ssr package. Deploy on Vercel for optimal performance with automatic ISR and edge functions.",
    },
    ethiopianSupport:
      "Fully supported. Host on Vercel (global) or Ethiopian hosts like Habesha Host.",
    limitations: [
      "Serverless functions have 10s timeout on Vercel Hobby plan",
      "ISR has 60s minimum revalidation on Vercel",
    ],
    docsUrl: "https://nextjs.org/docs",
  },
  {
    id: "react",
    name: "React.js",
    icon: "⚛️",
    description: "Popular UI library for building component-based interfaces.",
    category: "frontend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Good — requires additional tooling for SSR/SSG (Next.js, Gatsby, or Remix)",
    config: {
      envVars: [
        "REACT_APP_API_URL",
        "REACT_APP_SUPABASE_URL",
        "REACT_APP_SUPABASE_ANON_KEY",
      ],
      setupSteps: [
        "npx create-react-app my-app --template typescript",
        "Configure proxy for API in package.json",
        "Set up routing with react-router-dom",
        "Configure environment variables with REACT_APP_ prefix",
      ],
      packages: ["react", "react-dom", "react-router-dom", "typescript"],
    },
    integration: {
      connectsTo: ["supabase", "netlify", "github_actions"],
      notes:
        "React pairs well with Supabase for real-time features. Deploy on Netlify or Vercel.",
    },
    ethiopianSupport:
      "Fully supported. Deploy on Netlify (free tier available) or any static host.",
    limitations: [
      "No built-in SSR — needs Next.js or Remix for SEO",
      "CRA is deprecated; use Vite for new projects",
    ],
    docsUrl: "https://react.dev",
  },
  {
    id: "vite_react",
    name: "Vite + React",
    icon: "⚡",
    description:
      "Fast build tool for React with HMR, optimized builds, and TypeScript support.",
    category: "frontend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability: "Good — fast builds and optimized production bundles",
    config: {
      envVars: ["VITE_API_URL", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
      setupSteps: [
        "npm create vite@latest my-app -- --template react-ts",
        "Configure vite.config.ts for proxy and aliases",
        "Install and configure Tailwind CSS",
        "Set up routing with react-router-dom",
      ],
      packages: ["vite", "react", "react-dom", "react-router-dom"],
    },
    integration: {
      connectsTo: ["supabase", "netlify", "github_actions"],
      notes:
        "Vite is the modern replacement for CRA. Fast dev server with HMR.",
    },
    ethiopianSupport:
      "Fully supported. Deploy on Netlify, Vercel, or Cloudflare Pages.",
    limitations: [
      "No SSR — use with a separate backend or add Astro/Next.js",
      "Smaller ecosystem than Next.js for full-stack",
    ],
    docsUrl: "https://vitejs.dev",
  },
  {
    id: "angular",
    name: "Angular",
    icon: "🅰️",
    description:
      "Full-featured framework with built-in routing, forms, HTTP client, and state management.",
    category: "frontend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Excellent — enterprise-grade with strong typing, DI, and module system",
    config: {
      envVars: ["API_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY"],
      setupSteps: [
        "ng new my-app --routing --style=scss",
        "Generate components, services, and modules",
        "Configure environment files",
        "Set up Angular Material or Tailwind CSS",
      ],
      packages: [
        "@angular/core",
        "@angular/router",
        "@angular/forms",
        "@angular/common",
      ],
    },
    integration: {
      connectsTo: ["supabase", "firebase", "github_actions"],
      notes:
        "Angular + Supabase works well for enterprise apps with complex forms.",
    },
    ethiopianSupport:
      "Fully supported. Larger bundle size — consider Ethiopian internet speeds.",
    limitations: [
      "Steeper learning curve",
      "Heavier bundle size compared to React/Vue",
    ],
    docsUrl: "https://angular.dev",
  },
];
