import type {
  ProjectRequirements,
  ProjectRequirementsValidationErrors,
} from "./types";

export const projectRequirementsDefaults: ProjectRequirements = {
  projectName: "",
  projectDescription: "",
  projectCategory: "other",
  targetPlatforms: ["web"],
  targetUsers: "startup",
  expectedUsers: "100-1000",
  teamSize: "2-5",
  developerExperience: "intermediate",
  developmentPriority: "fast-mvp",
  budget: "50-200",
  timeToLaunch: "2-4-weeks",
  requiredFeatures: ["authentication"],
  targetMarketCountry: "",
  expectedGrowth: "",
  existingTechnologyPreferences: "",
};

export const projectCategoryOptions = [
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "lms", label: "LMS" },
  { value: "marketplace", label: "Marketplace" },
  { value: "social", label: "Social platform" },
  { value: "mobile-app", label: "Mobile application" },
  { value: "ai-app", label: "AI application" },
  { value: "internal-business", label: "Internal business application" },
  { value: "portfolio", label: "Portfolio" },
  { value: "api-backend", label: "API / backend" },
  { value: "other", label: "Other" },
] as const;

export const targetPlatformOptions = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "desktop", label: "Desktop" },
  { value: "api", label: "API" },
  { value: "multiple", label: "Multiple" },
] as const;

export const targetUsersOptions = [
  { value: "personal-project", label: "Personal project" },
  { value: "small-business", label: "Small business" },
  { value: "startup", label: "Startup" },
  { value: "enterprise", label: "Enterprise" },
] as const;

export const expectedUsersOptions = [
  { value: "under-100", label: "<100" },
  { value: "100-1000", label: "100–1,000" },
  { value: "1000-10000", label: "1,000–10,000" },
  { value: "10000-100000", label: "10,000–100,000" },
  { value: "100000-plus", label: "100,000+" },
] as const;

export const teamSizeOptions = [
  { value: "solo", label: "Solo" },
  { value: "2-5", label: "2–5" },
  { value: "6-15", label: "6–15" },
  { value: "16-plus", label: "16+" },
] as const;

export const developerExperienceOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
] as const;

export const developmentPriorityOptions = [
  { value: "fast-mvp", label: "Fast MVP" },
  { value: "balanced", label: "Balanced" },
  { value: "max-scalability", label: "Maximum scalability" },
  { value: "lowest-cost", label: "Lowest cost" },
  { value: "max-performance", label: "Maximum performance" },
] as const;

export const budgetOptions = [
  { value: "free", label: "Free / $0" },
  { value: "under-50", label: "<$50/month" },
  { value: "50-200", label: "$50–$200/month" },
  { value: "200-1000", label: "$200–$1,000/month" },
  { value: "1000-plus", label: "$1,000+/month" },
] as const;

export const timeToLaunchOptions = [
  { value: "under-2-weeks", label: "<2 weeks" },
  { value: "2-4-weeks", label: "2–4 weeks" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "6-plus-months", label: "6+ months" },
] as const;

export const requiredFeatureOptions = [
  { value: "authentication", label: "Authentication" },
  { value: "payments", label: "Payments" },
  { value: "file-uploads", label: "File uploads" },
  { value: "video", label: "Video" },
  { value: "real-time-communication", label: "Real-time communication" },
  { value: "notifications", label: "Notifications" },
  { value: "search", label: "Search" },
  { value: "analytics", label: "Analytics" },
  { value: "ai", label: "AI" },
  { value: "background-jobs", label: "Background jobs" },
  { value: "admin-dashboard", label: "Admin dashboard" },
  { value: "multi-tenancy", label: "Multi-tenancy" },
  { value: "other", label: "Other" },
] as const;

export const discoveryWizardSteps = [
  {
    id: "basics",
    title: "Project basics",
    description: "Tell us what you are building and for whom.",
  },
  {
    id: "audience",
    title: "Audience & scale",
    description: "Define the target user, market, and expected growth.",
  },
  {
    id: "delivery",
    title: "Delivery constraints",
    description: "Share your team, budget, timeline, and priorities.",
  },
  {
    id: "features",
    title: "Features & context",
    description:
      "Capture missing product requirements before recommending a stack.",
  },
] as const;

export function validateProjectRequirements(
  requirements: ProjectRequirements,
): ProjectRequirementsValidationErrors {
  const errors: ProjectRequirementsValidationErrors = {};

  if (!requirements.projectName.trim()) {
    errors.projectName = "Project name is required.";
  }

  if (!requirements.projectDescription.trim()) {
    errors.projectDescription = "Project description is required.";
  }

  if (!requirements.projectCategory) {
    errors.projectCategory = "Please choose a project category.";
  }

  if (!requirements.targetPlatforms.length) {
    errors.targetPlatforms = "Select at least one target platform.";
  }

  if (!requirements.targetUsers) {
    errors.targetUsers = "Select a target user segment.";
  }

  if (!requirements.expectedUsers) {
    errors.expectedUsers = "Select the expected user range.";
  }

  if (!requirements.teamSize) {
    errors.teamSize = "Select the team size.";
  }

  if (!requirements.developerExperience) {
    errors.developerExperience = "Select the developer experience level.";
  }

  if (!requirements.developmentPriority) {
    errors.developmentPriority = "Select the development priority.";
  }

  if (!requirements.budget) {
    errors.budget = "Select a budget range.";
  }

  if (!requirements.timeToLaunch) {
    errors.timeToLaunch = "Select your launch target.";
  }

  if (!requirements.requiredFeatures.length) {
    errors.requiredFeatures = "Select at least one required feature.";
  }

  if (!requirements.targetMarketCountry.trim()) {
    errors.targetMarketCountry = "Tell us your target market or country.";
  }

  if (!requirements.expectedGrowth.trim()) {
    errors.expectedGrowth = "Describe the growth expectation.";
  }

  return errors;
}

export function prepareProjectRequirementsForRecommendation(
  requirements: ProjectRequirements,
): Record<string, string | string[] | null> {
  return {
    projectName: requirements.projectName,
    projectDescription: requirements.projectDescription,
    projectCategory: requirements.projectCategory,
    targetPlatforms: requirements.targetPlatforms,
    targetUsers: requirements.targetUsers,
    expectedUsers: requirements.expectedUsers,
    teamSize: requirements.teamSize,
    developerExperience: requirements.developerExperience,
    developmentPriority: requirements.developmentPriority,
    budget: requirements.budget,
    timeToLaunch: requirements.timeToLaunch,
    requiredFeatures: requirements.requiredFeatures,
    targetMarketCountry: requirements.targetMarketCountry,
    expectedGrowth: requirements.expectedGrowth,
    existingTechnologyPreferences: requirements.existingTechnologyPreferences,
  };
}
