// ─── Add-on Tools: CSS, State Management, Search, Mobile, Auth ──
import type { ToolOption } from "../types";

export const addonTools: ToolOption[] = [
  // ─── CSS & UI FRAMEWORKS ──────────────────────────
  {
    id: "tailwind",
    name: "Tailwind CSS",
    icon: "🌊",
    description:
      "Utility-first CSS framework with design system tokens, responsive breakpoints, dark mode, and JIT compilation.",
    category: "css_ui",
    recommended: true,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Excellent — JIT compiler produces tiny CSS bundles. Responsive utilities work at all breakpoints. Design system scales across teams.",
    config: {
      envVars: [],
      setupSteps: [
        "npm install -D tailwindcss postcss autoprefixer",
        "npx tailwindcss init -p",
        "Configure content paths in tailwind.config.ts",
        "Add @tailwind directives to global CSS",
        "Use utility classes in components",
      ],
      packages: ["tailwindcss", "postcss", "autoprefixer"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "vite_react", "vue", "svelte"],
      notes:
        "Tailwind is the most popular CSS framework for React/Next.js. Pairs perfectly with Shadcn/ui for pre-built components.",
    },
    ethiopianSupport:
      "Excellent — zero runtime, small CSS output. Fast loading for Ethiopian users.",
    limitations: [
      "HTML can look messy with many utility classes",
      "Learning curve for utility-first approach",
      "Requires purge configuration for small builds",
    ],
    docsUrl: "https://tailwindcss.com/docs",
  },
  {
    id: "shadcn",
    name: "Shadcn/ui",
    icon: "🧩",
    description:
      "Reusable React component library built on Radix UI and Tailwind CSS. Copy-paste components, fully customizable, tree-shakeable.",
    category: "css_ui",
    recommended: true,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Excellent — tree-shakeable, you own the code, no external dependency at runtime. Scales with your design system.",
    config: {
      envVars: [],
      setupSteps: [
        "npx shadcn@latest init",
        "Configure components.json with your styles",
        "npx shadcn@latest add button card dialog",
        "Import components from @/components/ui/",
        "Customize component styles with Tailwind classes",
      ],
      packages: [
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "lucide-react",
        "class-variance-authority",
      ],
    },
    integration: {
      connectsTo: ["nextjs", "react", "tailwind"],
      notes:
        "Shadcn/ui is not an npm package — you copy the source. Full control over styling. Built on Radix UI primitives for accessibility.",
    },
    ethiopianSupport:
      "Excellent — zero runtime overhead, lightweight. No extra dependencies for Ethiopian users to download.",
    limitations: [
      "Requires Tailwind CSS as a dependency",
      "Not a drag-and-drop component library (code-first)",
      "Limited to React-based projects",
    ],
    docsUrl: "https://ui.shadcn.com",
  },
  {
    id: "daisyui",
    name: "DaisyUI",
    icon: "🌸",
    description:
      "Tailwind CSS component library with pre-built themes, responsive components, and zero-JS interactions.",
    category: "css_ui",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Good — component classes reduce Tailwind verbosity. Theming system makes it easy to rebrand.",
    config: {
      envVars: [],
      setupSteps: [
        "npm install -D daisyui",
        "Add daisyui to tailwind.config.js plugins",
        "Choose a theme in config",
        "Use daisyui component classes (btn, card, etc.)",
        "Customize with Tailwind utilities when needed",
      ],
      packages: ["daisyui"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "vite_react", "tailwind"],
      notes:
        "DaisyUI adds component classes on top of Tailwind. Great for rapid prototyping. 30+ built-in themes.",
    },
    ethiopianSupport:
      "Good — lightweight, built on Tailwind. Component classes speed up development.",
    limitations: [
      "Adds CSS bundle size (purge unused components)",
      "Less flexible than raw Tailwind",
    ],
    docsUrl: "https://daisyui.com",
  },

  // ─── STATE MANAGEMENT & DATA FETCHING ──────────────
  {
    id: "tanstack_query",
    name: "TanStack Query",
    icon: "🔄",
    description:
      "Powerful asynchronous state management for server data — caching, background refetching, optimistic updates, and infinite queries.",
    category: "state_mgmt",
    recommended: true,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Excellent — automatic caching, deduplication, pagination, and background updates scale with app complexity.",
    config: {
      envVars: [],
      setupSteps: [
        "npm install @tanstack/react-query",
        "Create QueryClient provider in layout.tsx",
        "Use useQuery for GET requests",
        "Use useMutation for POST/PUT/DELETE",
        "Configure staleTime and cacheTime for performance",
      ],
      packages: ["@tanstack/react-query", "@tanstack/react-query-devtools"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "supabase_db", "node"],
      notes:
        "TanStack Query eliminates manual loading/error states. Works with any async data source. Devtools for debugging.",
    },
    ethiopianSupport:
      "Excellent — client-side caching reduces API calls, improving perceived performance for users with slower connections.",
    limitations: [
      "Adds ~12KB to bundle size",
      "Overkill for apps with minimal server state",
    ],
    docsUrl: "https://tanstack.com/query/latest",
  },
  {
    id: "zustand",
    name: "Zustand",
    icon: "🐻",
    description:
      "Tiny, fast state management library with hooks-based API, middleware support, and no boilerplate.",
    category: "state_mgmt",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Good — single store or multiple slices, middleware for persistence/immer/devtools, works outside React too.",
    config: {
      envVars: [],
      setupSteps: [
        "npm install zustand",
        "Create store with create() function",
        "Access state with generated hooks",
        "Add middleware (persist, immer, devtools)",
        "Use in components with useStore()",
      ],
      packages: ["zustand", "immer"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "vue"],
      notes:
        "Zustand is minimal (~1KB) compared to Redux. Perfect for client-side state that doesn't need server caching (use TanStack Query for that).",
    },
    ethiopianSupport:
      "Excellent — tiny bundle size (~1KB minified). Minimal impact on page load time.",
    limitations: [
      "Not a server-state solution (use TanStack Query)",
      "No built-in data fetching patterns",
    ],
    docsUrl: "https://zustand-demo.pmnd.rs",
  },

  // ─── SEARCH ENGINES ────────────────────────────────
  {
    id: "meilisearch",
    name: "Meilisearch",
    icon: "🔎",
    description:
      "Open-source, fast, and relevant search engine with typo tolerance, faceted filters, and instant search out of the box.",
    category: "search",
    recommended: true,
    freeTier: "Free self-hosted (open-source). Cloud: 30-day free trial",
    pricing:
      "Self-hosted: free. Cloud: from $29/mo (250K docs, 10K searches/mo)",
    scalability:
      "Good — horizontal scaling with replica sets, indexing up to 100K docs/second, sub-50ms search times",
    config: {
      envVars: ["MEILI_MASTER_KEY", "MEILI_HOST", "MEILI_PORT"],
      setupSteps: [
        "curl -L https://install.meilisearch.com | sh",
        "Run ./meilisearch --master-key=<key>",
        "Install @meilisearch/instant-meilisearch",
        "Configure index with searchable attributes",
        "Add documents to index",
      ],
      packages: ["@meilisearch/instant-meilisearch", "meilisearch"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "node", "docker_vps"],
      notes:
        "Meilisearch is the easiest search engine to set up. Typo tolerance and instant search work out of the box. Great for e-commerce and content sites.",
    },
    ethiopianSupport:
      "Excellent — self-hosted on Ethiopian VPS for low latency. No external API costs.",
    limitations: [
      "Not as scalable as Elasticsearch for very large datasets",
      "Self-hosted requires server resources",
    ],
    docsUrl: "https://docs.meilisearch.com",
  },
  {
    id: "algolia",
    name: "Algolia",
    icon: "🔦",
    description:
      "Hosted search API with AI-powered relevance, instant search widgets, analytics, and A/B testing.",
    category: "search",
    recommended: false,
    freeTier: "Free: 10K records, 10K search operations/mo, 100K API keys",
    pricing:
      "Build: $0.50/1K search ops. Pro: $0.75/1K search ops. Enterprise: custom",
    scalability:
      "Excellent — global CDN distribution, 10ms median response time, handles billions of searches/month",
    config: {
      envVars: [
        "NEXT_PUBLIC_ALGOLIA_APP_ID",
        "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY",
        "ALGOLIA_ADMIN_KEY",
      ],
      setupSteps: [
        "Create Algolia account",
        "Create index and configure searchable attributes",
        "Install algoliasearch and react-instantsearch",
        "Push records to index",
        "Add InstantSearch widgets to frontend",
      ],
      packages: ["algoliasearch", "react-instantsearch"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "node"],
      notes:
        "Algolia is the gold standard for hosted search. InstantSearch UI components work with React. AI-powered relevance ranking.",
    },
    ethiopianSupport:
      "Good — global CDN. Free tier is generous for MVPs. Paid tiers can be expensive for high-volume Ethiopian apps.",
    limitations: [
      "Can be expensive at scale",
      "Not self-hostable — data leaves your infrastructure",
    ],
    docsUrl: "https://www.algolia.com/doc/",
  },
  {
    id: "typesense",
    name: "Typesense",
    icon: "⚡",
    description:
      "Open-source, typo-tolerant search engine with instant search, faceted filtering, and sorting. Self-hosted or cloud.",
    category: "search",
    recommended: false,
    freeTier: "Free self-hosted. Cloud: 14-day free trial",
    pricing:
      "Self-hosted: free. Cloud: from $70/mo (1M docs, 100K searches/day)",
    scalability:
      "Excellent — built for speed (sub-10ms), horizontal sharding, concurrent indexing, and read replicas",
    config: {
      envVars: ["TYPESENSE_API_KEY", "TYPESENSE_HOST", "TYPESENSE_PORT"],
      setupSteps: [
        "Install Typesense via Docker: docker run -d typesense/typesense",
        "Create API key with appropriate permissions",
        "Install typesense-instantsearch-adapter",
        "Define schema and import documents",
        "Add search UI components",
      ],
      packages: ["typesense", "typesense-instantsearch-adapter"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "node", "docker_vps"],
      notes:
        "Typesense is a faster, easier alternative to Elasticsearch. Excellent for e-commerce, documentation, and content search.",
    },
    ethiopianSupport:
      "Excellent — self-hosted on Ethiopian VPS. Docker image makes deployment simple.",
    limitations: [
      "Smaller ecosystem than Elasticsearch or Algolia",
      "Self-hosted requires server management",
    ],
    docsUrl: "https://typesense.org/docs",
  },

  // ─── MOBILE FRAMEWORKS ─────────────────────────────
  {
    id: "react_native",
    name: "React Native + Expo",
    icon: "📱",
    description:
      "Build native mobile apps for iOS and Android using React. Expo provides managed workflow, OTA updates, and 50+ pre-built modules.",
    category: "mobile",
    recommended: true,
    freeTier: "Free and open-source",
    pricing:
      "Free — Expo EAS Build has free tier (30 builds/mo). Apple Developer $99/yr + Google Play $25 one-time",
    scalability:
      "Excellent — CodePush for OTA updates, Hermes engine for performance, React Native at Scale patterns from Meta/Shopify",
    config: {
      envVars: [
        "EXPO_PUBLIC_SUPABASE_URL",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY",
        "EXPO_PUBLIC_API_URL",
      ],
      setupSteps: [
        "npx create-expo-app my-app --template blank-typescript",
        "Install navigation: expo-router or react-navigation",
        "Set up Supabase client",
        "Configure EAS Build for app store deployment",
        "Test on Expo Go during development",
      ],
      packages: [
        "expo",
        "react-native",
        "@supabase/supabase-js",
        "expo-router",
      ],
    },
    integration: {
      connectsTo: ["supabase_db", "node", "nextjs_api", "python_fastapi"],
      notes:
        "Expo is the recommended way to build React Native apps. Supabase provides auth, database, and real-time sync for mobile. OTA updates with EAS Update.",
    },
    ethiopianSupport:
      "Good — React Native apps run natively on Ethiopian Android devices (90%+ Android market share). Expo simplifies updates without app store.",
    limitations: [
      "Not a web framework — separate codebase from web app",
      "Apple Developer ($99/yr) + Google Play ($25) fees apply",
      "Complex native modules require development builds",
    ],
    docsUrl: "https://docs.expo.dev",
  },
  {
    id: "flutter",
    name: "Flutter",
    icon: "💙",
    description:
      "Google's UI toolkit for building cross-platform apps (iOS, Android, Web, Desktop) from a single Dart codebase.",
    category: "mobile",
    recommended: false,
    freeTier: "Free and open-source",
    pricing:
      "Free — no framework fees. App store fees apply: Apple $99/yr, Google $25 one-time",
    scalability:
      "Excellent — Dart compiles to native ARM code, Skia rendering engine, Flutter on Desktop and Web from same codebase",
    config: {
      envVars: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "API_BASE_URL"],
      setupSteps: [
        "flutter create my_app",
        "Add supabase_flutter dependency",
        "Configure Supabase client in main.dart",
        "Build UI with Flutter widgets",
        "Compile for iOS, Android, and Web",
      ],
      packages: ["flutter", "supabase_flutter", "dart"],
    },
    integration: {
      connectsTo: ["supabase_db", "node", "python_fastapi"],
      notes:
        "Flutter has excellent Supabase support via supabase_flutter. Single codebase for mobile + web + desktop. Hot reload for fast development.",
    },
    ethiopianSupport:
      "Good — single codebase reduces development costs. Flutter web can also serve as a PWA for Ethiopian users.",
    limitations: [
      "Dart language — learning curve for JS/TS developers",
      "Larger app size than React Native",
      "Web support is still maturing",
    ],
    docsUrl: "https://docs.flutter.dev",
  },

  // ─── AUTH (EXTRA) ──────────────────────────────────
  {
    id: "clerk",
    name: "Clerk",
    icon: "🪪",
    description:
      "Drop-in authentication with pre-built UI components, multi-factor auth, organization management, and 10+ social providers.",
    category: "auth",
    recommended: false,
    freeTier:
      "Free: 10K MAU, 5 organizations, email/sms 100/mo, all social providers",
    pricing: "Pro: $25/mo (25K MAU). Enterprise: custom",
    scalability:
      "Excellent — global edge network, webhooks for sync, organization scaling, and enterprise SSO",
    config: {
      envVars: [
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
        "CLERK_SECRET_KEY",
        "CLERK_WEBHOOK_SECRET",
      ],
      setupSteps: [
        "Create Clerk application",
        "Install @clerk/nextjs",
        "Wrap app with ClerkProvider",
        "Add middleware for protected routes",
        "Use UserButton, SignIn, SignUp components",
      ],
      packages: ["@clerk/nextjs", "@clerk/clerk-sdk-node"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "node"],
      notes:
        "Clerk provides beautiful auth UI components that work out of the box. 10+ social logins, MFA, and organization management.",
    },
    ethiopianSupport:
      "Good — works globally. Free tier (10K MAU) is generous for Ethiopian startups.",
    limitations: [
      "Free tier limited to 10K MAU",
      "Data hosted on Clerk's infrastructure (US/EU)",
      "Less control than self-hosted auth (NextAuth)",
    ],
    docsUrl: "https://clerk.com/docs",
  },
  {
    id: "auth0",
    name: "Auth0",
    icon: "🔑",
    description:
      "Enterprise-grade auth platform with 30+ social connections, passwordless, MFA, SSO, and breach password detection.",
    category: "auth",
    recommended: false,
    freeTier:
      "Free: 7K MAU, 2 social connections, 1 SSO integration, 1 MFA factor",
    pricing: "B2C: $36/mo (1K MAU). B2B: $36/mo (1K MAU). Enterprise: custom",
    scalability:
      "Excellent — 99.99% uptime SLA, global edge network, 50M+ MAU supported, enterprise compliance (SOC2, HIPAA, GDPR)",
    config: {
      envVars: [
        "AUTH0_SECRET",
        "AUTH0_BASE_URL",
        "AUTH0_ISSUER_BASE_URL",
        "AUTH0_CLIENT_ID",
        "AUTH0_CLIENT_SECRET",
      ],
      setupSteps: [
        "Create Auth0 tenant",
        "Configure application (SPA, Regular Web, or Machine-to-Machine)",
        "Install @auth0/nextjs-auth0",
        "Set up callback and logout URLs",
        "Implement login/logout with Auth0 SDK",
      ],
      packages: ["@auth0/nextjs-auth0", "auth0"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "node", "vue", "angular"],
      notes:
        "Auth0 is the most feature-rich auth platform. Best for enterprise apps needing SSO, compliance, and advanced security.",
    },
    ethiopianSupport:
      "Good — global infrastructure. Free tier is limited compared to Clerk or Supabase Auth.",
    limitations: [
      "Can be expensive at scale",
      "Complex configuration for simple use cases",
      "7K MAU free tier is lower than competitors",
    ],
    docsUrl: "https://auth0.com/docs",
  },
];
