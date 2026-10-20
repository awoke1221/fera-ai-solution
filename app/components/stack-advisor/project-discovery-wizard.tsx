"use client";

import { useEffect, useMemo, useState } from "react";
import {
  budgetOptions,
  developerExperienceOptions,
  developmentPriorityOptions,
  discoveryWizardSteps,
  expectedUsersOptions,
  getAdvisorProjectTypeId,
  projectCategoryOptions,
  projectTypes,
  isProjectDescriptionAnalysis,
  projectRequirementsDefaults,
  requiredFeatureOptions,
  targetPlatformOptions,
  targetUsersOptions,
  teamSizeOptions,
  timeToLaunchOptions,
  validateProjectRequirements,
} from ".";
import type {
  ProjectDescriptionAnalysis,
  ProjectRequirements,
  ProjectRequirementsValidationErrors,
  RequiredFeature,
  TargetPlatform,
} from ".";

const STORAGE_KEY = "stack-advisor-discovery";

interface ProjectDiscoveryWizardProps {
  initialRequirements?: ProjectRequirements | null;
  onRequirementsChange: (requirements: ProjectRequirements) => void;
  onProjectTypeChange?: (projectTypeId: string | null) => void;
  onProjectAnalysisChange?: (
    analysis: ProjectDescriptionAnalysis | null,
  ) => void;
  onComplete?: () => void;
}

export function ProjectDiscoveryWizard({
  initialRequirements,
  onRequirementsChange,
  onProjectTypeChange,
  onProjectAnalysisChange,
  onComplete,
}: ProjectDiscoveryWizardProps) {
  const [draft, setDraft] = useState<ProjectRequirements>(
    initialRequirements ?? projectRequirementsDefaults,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<ProjectRequirementsValidationErrors>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [projectAnalysis, setProjectAnalysis] =
    useState<ProjectDescriptionAnalysis | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<
    "idle" | "analyzing" | "error"
  >("idle");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisAttempt, setAnalysisAttempt] = useState(0);
  const [analyzedDescription, setAnalyzedDescription] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ProjectRequirements>;
        if (parsed && typeof parsed === "object") {
          setDraft({
            ...projectRequirementsDefaults,
            ...parsed,
            targetPlatforms: Array.isArray(parsed.targetPlatforms)
              ? parsed.targetPlatforms.filter(Boolean)
              : projectRequirementsDefaults.targetPlatforms,
            requiredFeatures: Array.isArray(parsed.requiredFeatures)
              ? parsed.requiredFeatures.filter(Boolean)
              : projectRequirementsDefaults.requiredFeatures,
          });
        }
      }
    } catch {
      // Ignore invalid cached data and reset to defaults.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    const description = draft.projectDescription.trim();
    if (description.length < 20) {
      setProjectAnalysis(null);
      setAnalyzedDescription(null);
      setAnalysisStatus("idle");
      setAnalysisError(null);
      return;
    }
    if (description === analyzedDescription && projectAnalysis) return;

    setProjectAnalysis(null);
    setAnalysisError(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setAnalysisStatus("analyzing");

      try {
        const response = await fetch("/api/ai-stack-recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ projectDescription: description }),
        });
        if (!response.ok) {
          const result = (await response.json()) as { error?: string };
          throw new Error(result.error || "Project analysis failed.");
        }

        const result = (await response.json()) as {
          type?: string;
          analysis?: unknown;
        };
        if (
          result.type !== "project-analysis" ||
          !isProjectDescriptionAnalysis(result.analysis)
        ) {
          throw new Error("The project analysis response was invalid.");
        }

        const analysis: ProjectDescriptionAnalysis = {
          ...result.analysis,
          source:
            "source" in result.analysis && result.analysis.source === "ai"
              ? "ai"
              : "local",
        };
        setProjectAnalysis(analysis);
        onProjectAnalysisChange?.(analysis);
        setAnalyzedDescription(description);
        setAnalysisStatus("idle");
        setDraft((previous) => ({
          ...previous,
          projectCategory: analysis.projectCategory,
          requiredFeatures: analysis.requiredFeatures,
          targetPlatforms: analysis.targetPlatforms,
        }));
        onProjectTypeChange?.(analysis.projectType);
      } catch (error) {
        if (controller.signal.aborted) return;
        setAnalysisStatus("error");
        setAnalysisError(
          error instanceof Error ? error.message : "Project analysis failed.",
        );
      }
    }, 900);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [
    analyzedDescription,
    draft.projectDescription,
    isHydrated,
    analysisAttempt,
    onProjectAnalysisChange,
    onProjectTypeChange,
    projectAnalysis,
  ]);

  const totalSteps = discoveryWizardSteps.length;
  const currentStep = discoveryWizardSteps[stepIndex];
  const isFinalStep = stepIndex === totalSteps - 1;

  const currentStepSummary = useMemo(() => {
    switch (currentStep.id) {
      case "basics":
        return "Basic product information";
      case "audience":
        return "Audience and scale";
      case "delivery":
        return "Delivery constraints";
      case "features":
        return "Product features and growth context";
      default:
        return "Discovery";
    }
  }, [currentStep.id]);

  const updateField = <K extends keyof ProjectRequirements>(
    field: K,
    value: ProjectRequirements[K],
  ) => {
    if (field === "projectDescription") {
      setProjectAnalysis(null);
      setAnalyzedDescription(null);
      onProjectAnalysisChange?.(null);
      onProjectTypeChange?.(null);
    }
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleArrayValue = <
    K extends keyof Pick<
      ProjectRequirements,
      "targetPlatforms" | "requiredFeatures"
    >,
  >(
    field: K,
    value: TargetPlatform | RequiredFeature,
  ) => {
    setDraft((prev) => {
      const values = [...(prev[field] as string[])];
      const exists = values.includes(value as string);
      const nextValues = exists
        ? values.filter((item) => item !== value)
        : [...values, value as string];

      return { ...prev, [field]: nextValues as ProjectRequirements[K] };
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateCurrentStep = () => {
    const currentErrors: Record<string, string> = {};

    if (currentStep.id === "basics") {
      if (!draft.projectName.trim())
        currentErrors.projectName = "Project name is required.";
      if (!draft.projectDescription.trim())
        currentErrors.projectDescription = "Project description is required.";
      if (!projectAnalysis)
        currentErrors.projectDescription =
          analysisError ||
          "Describe your project in at least 20 characters and wait for the analysis.";
    }

    if (currentStep.id === "audience") {
      if (!draft.targetPlatforms.length)
        currentErrors.targetPlatforms = "Select at least one target platform.";
      if (!draft.targetUsers)
        currentErrors.targetUsers = "Select the target users.";
      if (!draft.expectedUsers)
        currentErrors.expectedUsers = "Select the expected user range.";
    }

    if (currentStep.id === "delivery") {
      if (!draft.teamSize) currentErrors.teamSize = "Select a team size.";
      if (!draft.developerExperience)
        currentErrors.developerExperience = "Select the developer experience.";
      if (!draft.developmentPriority)
        currentErrors.developmentPriority = "Select a development priority.";
      if (!draft.budget) currentErrors.budget = "Select a budget range.";
      if (!draft.timeToLaunch)
        currentErrors.timeToLaunch = "Select a launch timeline.";
    }

    if (currentStep.id === "features") {
      if (!draft.targetMarketCountry.trim())
        currentErrors.targetMarketCountry =
          "Target market or country is required.";
      if (!draft.expectedGrowth.trim())
        currentErrors.expectedGrowth = "Expected growth is required.";
    }

    return currentErrors;
  };

  const goNext = () => {
    const stepErrors = validateCurrentStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      return;
    }

    if (isFinalStep) {
      const validationErrors = validateProjectRequirements(draft);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      onRequirementsChange(draft);
      onComplete?.();
      return;
    }

    setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const goBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case "basics":
        return (
          <div className="discovery-form-grid">
            <label className="field-group">
              <span>Project name</span>
              <input
                aria-invalid={Boolean(errors.projectName)}
                value={draft.projectName}
                onChange={(event) =>
                  updateField("projectName", event.target.value)
                }
                placeholder="e.g. Nibiro Logistics"
              />
              {errors.projectName && <small>{errors.projectName}</small>}
            </label>

            <label className="field-group full-width">
              <span>Project description</span>
              <textarea
                aria-invalid={Boolean(errors.projectDescription)}
                rows={5}
                maxLength={6000}
                value={draft.projectDescription}
                onChange={(event) =>
                  updateField("projectDescription", event.target.value)
                }
                placeholder="Describe your product, its problem, and what success looks like."
              />
              {errors.projectDescription && (
                <small>{errors.projectDescription}</small>
              )}
            </label>

            <div className="field-group full-width">
              <span>AI project analysis</span>
              {analysisStatus === "analyzing" ? (
                <div className="stack-ai-project-analysis" role="status">
                  <strong>Analyzing your project description…</strong>
                  <p>
                    Identifying the closest project type and the features your
                    product actually needs.
                  </p>
                </div>
              ) : projectAnalysis ? (
                <div className="stack-ai-project-analysis" role="status">
                  <div className="stack-ai-project-analysis-heading">
                    <strong>
                      {projectTypes.find(
                        (project) => project.id === projectAnalysis.projectType,
                      )?.label ?? "Recommended project type"}
                    </strong>
                    <span>
                      {projectAnalysis.source === "ai"
                        ? "AI analyzed"
                        : "Local suggestion"}
                    </span>
                  </div>
                  <p>{projectAnalysis.summary}</p>
                  <small>{projectAnalysis.rationale}</small>
                  <div className="stack-ai-feature-suggestions">
                    {projectAnalysis.requiredFeatures.map((feature) => (
                      <span key={feature}>
                        {requiredFeatureOptions.find(
                          (option) => option.value === feature,
                        )?.label ?? feature}
                      </span>
                    ))}
                  </div>
                </div>
              ) : analysisStatus === "error" ? (
                <div className="stack-ai-project-analysis error" role="alert">
                  <strong>Project analysis could not finish.</strong>
                  <p>{analysisError}</p>
                  <small>
                    Edit the description to retry, or check your connection
                    and membership session.
                  </small>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setAnalysisAttempt((attempt) => attempt + 1)}
                  >
                    Retry analysis
                  </button>
                </div>
              ) : (
                <div className="stack-ai-project-analysis">
                  <strong>AI will identify one best-fit project type</strong>
                  <p>
                    Add more detail—at least 20 characters—to get tailored
                    project and feature suggestions.
                  </p>
                </div>
              )}
              <label className="field-group stack-ai-category-override">
                <span>Correct the category if needed</span>
                <select
                  value={draft.projectCategory}
                  onChange={(event) => {
                    const category = event.target
                      .value as ProjectRequirements["projectCategory"];
                    updateField("projectCategory", category);
                    onProjectAnalysisChange?.(null);
                    onProjectTypeChange?.(getAdvisorProjectTypeId(category));
                  }}
                >
                  {projectCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {errors.projectCategory && (
                <small>{errors.projectCategory}</small>
              )}
            </div>
          </div>
        );

      case "audience":
        return (
          <div className="discovery-form-grid">
            <div className="field-group full-width">
              <span>Target platforms</span>
              <div className="option-grid compact">
                {targetPlatformOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      "option-pill " +
                      (draft.targetPlatforms.includes(option.value)
                        ? "selected"
                        : "")
                    }
                    onClick={() =>
                      toggleArrayValue("targetPlatforms", option.value)
                    }
                    aria-pressed={draft.targetPlatforms.includes(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.targetPlatforms && (
                <small>{errors.targetPlatforms}</small>
              )}
            </div>

            <div className="field-group full-width">
              <span>Target users</span>
              <div className="option-grid compact">
                {targetUsersOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      "option-pill " +
                      (draft.targetUsers === option.value ? "selected" : "")
                    }
                    onClick={() => updateField("targetUsers", option.value)}
                    aria-pressed={draft.targetUsers === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.targetUsers && <small>{errors.targetUsers}</small>}
            </div>

            <div className="field-group full-width">
              <span>Expected users</span>
              <div className="option-grid compact">
                {expectedUsersOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      "option-pill " +
                      (draft.expectedUsers === option.value ? "selected" : "")
                    }
                    onClick={() => updateField("expectedUsers", option.value)}
                    aria-pressed={draft.expectedUsers === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.expectedUsers && <small>{errors.expectedUsers}</small>}
            </div>
          </div>
        );

      case "delivery":
        return (
          <div className="discovery-form-grid">
            <div className="field-group full-width">
              <span>Team size</span>
              <div className="option-grid compact">
                {teamSizeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      "option-pill " +
                      (draft.teamSize === option.value ? "selected" : "")
                    }
                    onClick={() => updateField("teamSize", option.value)}
                    aria-pressed={draft.teamSize === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.teamSize && <small>{errors.teamSize}</small>}
            </div>

            <div className="field-group full-width">
              <span>Developer experience</span>
              <div className="option-grid compact">
                {developerExperienceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      "option-pill " +
                      (draft.developerExperience === option.value
                        ? "selected"
                        : "")
                    }
                    onClick={() =>
                      updateField("developerExperience", option.value)
                    }
                    aria-pressed={draft.developerExperience === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.developerExperience && (
                <small>{errors.developerExperience}</small>
              )}
            </div>

            <div className="field-group full-width">
              <span>Development priority</span>
              <div className="option-grid compact">
                {developmentPriorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      "option-pill " +
                      (draft.developmentPriority === option.value
                        ? "selected"
                        : "")
                    }
                    onClick={() =>
                      updateField("developmentPriority", option.value)
                    }
                    aria-pressed={draft.developmentPriority === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.developmentPriority && (
                <small>{errors.developmentPriority}</small>
              )}
            </div>

            <div className="field-group full-width">
              <span>Budget</span>
              <div className="option-grid compact">
                {budgetOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      "option-pill " +
                      (draft.budget === option.value ? "selected" : "")
                    }
                    onClick={() => updateField("budget", option.value)}
                    aria-pressed={draft.budget === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.budget && <small>{errors.budget}</small>}
            </div>

            <div className="field-group full-width">
              <span>Time to launch</span>
              <div className="option-grid compact">
                {timeToLaunchOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      "option-pill " +
                      (draft.timeToLaunch === option.value ? "selected" : "")
                    }
                    onClick={() => updateField("timeToLaunch", option.value)}
                    aria-pressed={draft.timeToLaunch === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.timeToLaunch && <small>{errors.timeToLaunch}</small>}
            </div>
          </div>
        );

      case "features":
        return (
          <div className="discovery-form-grid">
            <div className="field-group full-width">
              <span>Required features</span>
              <div className="option-grid compact">
                {requiredFeatureOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      "option-pill " +
                      (draft.requiredFeatures.includes(option.value)
                        ? "selected"
                        : "")
                    }
                    onClick={() =>
                      toggleArrayValue("requiredFeatures", option.value)
                    }
                    aria-pressed={draft.requiredFeatures.includes(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.requiredFeatures && (
                <small>{errors.requiredFeatures}</small>
              )}
            </div>

            <label className="field-group">
              <span>Target market / country</span>
              <input
                aria-invalid={Boolean(errors.targetMarketCountry)}
                value={draft.targetMarketCountry}
                onChange={(event) =>
                  updateField("targetMarketCountry", event.target.value)
                }
                placeholder="e.g. Ethiopia, Kenya, global"
              />
              {errors.targetMarketCountry && (
                <small>{errors.targetMarketCountry}</small>
              )}
            </label>

            <label className="field-group">
              <span>Expected growth</span>
              <input
                aria-invalid={Boolean(errors.expectedGrowth)}
                value={draft.expectedGrowth}
                onChange={(event) =>
                  updateField("expectedGrowth", event.target.value)
                }
                placeholder="e.g. 10x growth in 12 months"
              />
              {errors.expectedGrowth && <small>{errors.expectedGrowth}</small>}
            </label>

            <label className="field-group full-width">
              <span>Existing technology preferences</span>
              <textarea
                rows={4}
                value={draft.existingTechnologyPreferences}
                onChange={(event) =>
                  updateField(
                    "existingTechnologyPreferences",
                    event.target.value,
                  )
                }
                placeholder="Any stacks, languages, tooling, or constraints you already prefer?"
              />
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="project-discovery-shell" aria-live="polite">
      <div className="project-discovery-header">
        <div>
          <div className="eyebrow">Project discovery</div>
          <h3>Understand the project before choosing the stack</h3>
        </div>
        <div className="project-discovery-step-indicator">
          Step {stepIndex + 1} of {totalSteps}
        </div>
      </div>

      <div className="project-discovery-stepper" aria-label="Wizard progress">
        {discoveryWizardSteps.map((step, index) => (
          <div
            key={step.id}
            className={
              "discovery-step " +
              (index === stepIndex ? "active" : "") +
              (index < stepIndex ? "complete" : "")
            }
          >
            <span>{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <small>{step.description}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="project-discovery-panel">
        <div className="project-discovery-panel-header">
          <div>
            <span className="discovery-current-step-label">
              {currentStepSummary}
            </span>
            <h4>{currentStep.title}</h4>
          </div>
        </div>

        {renderStepContent()}
      </div>

      <div className="project-discovery-actions">
        <button
          type="button"
          className="btn"
          onClick={goBack}
          disabled={stepIndex === 0}
        >
          ← Back
        </button>

        <button type="button" className="btn solid" onClick={goNext}>
          {isFinalStep ? "Analyze My Project" : "Next →"}
        </button>
      </div>
    </div>
  );
}
