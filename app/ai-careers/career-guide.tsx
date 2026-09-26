"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  skillProjectModules,
  type SkillProjectModule,
  type SkillProjectStep,
} from "./skill-projects";

type Phase = {
  title: string;
  focus: string;
  learn: string[];
  build: string;
  evidence: string;
};

type Project = {
  title: string;
  brief: string;
  proof: string;
  level?: string;
  buildGuide?: BuildLabStep[];
  architectureChoices?: {
    decision: string;
    recommended: string;
    alternatives: string;
  }[];
};

type BuildLabStep = {
  concept: string;
  task: string;
  deliverable: string;
  acceptance: string;
  architectureChoice?: string;
};

type CareerTrack = {
  id: string;
  number: string;
  title: string;
  family: string;
  summary: string;
  bestFor: string;
  work: string;
  tools: string[];
  phases: Phase[];
  projects: Project[];
  jobTitles: string[];
};

const tracks: CareerTrack[] = [
  {
    id: "ai-engineer",
    number: "01",
    title: "AI application engineer",
    family: "Software engineering + AI",
    summary:
      "Build useful products around models: assistants, search, extraction, recommendations, and workflows that connect AI to real software.",
    bestFor:
      "People who like building user-facing software and iterating quickly.",
    work: "Design APIs and interfaces, connect models and tools, evaluate outputs, and make the whole feature reliable in production.",
    tools: [
      "Python or TypeScript",
      "model APIs",
      "SQL",
      "retrieval",
      "testing",
      "cloud deployment",
    ],
    phases: [
      {
        title: "Become a dependable software builder",
        focus: "Programming, data, and web-service fundamentals",
        learn: [
          "Python fundamentals, functions, modules, and tests",
          "Git, HTTP, JSON, SQL, and API design",
          "One backend framework and enough frontend to ship a usable interface",
        ],
        build:
          "Create a small service that accepts structured input, validates it, stores it, and exposes a documented API.",
        evidence:
          "A clean repository, setup instructions, tests, and a deployed demo.",
      },
      {
        title: "Learn model behavior and evaluation",
        focus:
          "Model selection, prompting, structured output, and failure analysis",
        learn: [
          "Tokens, context limits, latency, and inference cost",
          "Embeddings and when retrieval is better than fine-tuning",
          "A test set, task-specific metrics, and human review for ambiguous cases",
        ],
        build:
          "Add a model-powered capability to the service and compare at least two approaches against a small labeled test set.",
        evidence:
          "A results table with examples of successes, failures, and the decision you made from them.",
      },
      {
        title: "Make the feature robust",
        focus: "Retrieval, tool use, orchestration, and graceful failure",
        learn: [
          "Chunking, metadata filters, retrieval quality, and citations",
          "Retries, timeouts, rate limits, caching, and deterministic fallbacks",
          "Prompt-injection risks, access control, privacy, and data retention",
        ],
        build:
          "Build a source-grounded assistant over a bounded document set with citations, refusal behavior, and an evaluation suite.",
        evidence:
          "A threat model, retrieval tests, and clear behavior when the source does not contain an answer.",
      },
      {
        title: "Ship, observe, and improve",
        focus: "Production operations and product-quality feedback loops",
        learn: [
          "Tracing, structured logs, user feedback, and quality monitoring",
          "Deployment, secrets management, and safe schema changes",
          "Cost and latency budgets plus a plan for regressions",
        ],
        build:
          "Deploy the complete feature and run a documented release review using real or carefully simulated usage.",
        evidence:
          "A live demo, architecture note, evaluation report, and a short walkthrough of trade-offs.",
      },
    ],
    projects: [
      {
        title: "Evidence-first knowledge assistant",
        brief:
          "Answer questions from a small, public document collection. Include source links, abstain when evidence is missing, and let reviewers flag weak answers.",
        proof:
          "Publish retrieval and answer-quality results, failure examples, and a basic privacy and prompt-injection review.",
      },
      {
        title: "Structured intake and triage workflow",
        brief:
          "Turn messy requests into a validated schema, route them by explicit rules, and keep a human approval step for consequential actions.",
        proof:
          "Show a baseline, schema validation, safe failure behavior, and a short demo from input to review.",
      },
      {
        title: "Production RAG support-operations copilot",
        level: "Advanced / production systems project",
        brief:
          "Build an internal assistant for a fictional multi-region support organization. It searches versioned product manuals, approved troubleshooting runbooks, and policy documents; respects team and region access; cites the exact source passages; asks a clarifying question when the request is underspecified; and hands off unresolved or high-risk cases to a human with a compact evidence bundle.",
        proof:
          "Deliver an architecture diagram, ingestion and deletion pipeline, retrieval benchmark, answer evaluation report, authorization tests, adversarial test suite, latency/cost report, operations runbook, and a recorded demo using synthetic or explicitly public documents.",
        architectureChoices: [
          {
            decision: "Retrieval strategy",
            recommended:
              "Establish keyword retrieval first, then compare dense retrieval and a hybrid rank-fusion approach on the same labeled queries.",
            alternatives:
              "Keyword search is strong for exact IDs and error codes; vectors help with paraphrases; hybrid search can combine them but adds tuning and operational work. Keep whichever wins measurable task quality.",
          },
          {
            decision: "Chunking and context shape",
            recommended:
              "Preserve document structure and metadata; compare structure-aware chunks with a parent/child strategy on boundary-sensitive questions.",
            alternatives:
              "Fixed-size chunks are a useful baseline; semantic chunking may help coherent prose but costs more to build and does not guarantee better retrieval. Tune overlap using evidence, not folklore.",
          },
          {
            decision: "Vector storage",
            recommended:
              "For a portfolio-scale system, use PostgreSQL with pgvector and relational access metadata if the team can operate it.",
            alternatives:
              "A managed vector service can reduce operational burden at scale; compare filtering guarantees, tenant isolation, backup/deletion behavior, cost, and portability before choosing.",
          },
          {
            decision: "Reranking and query rewriting",
            recommended:
              "Begin without either, measure retrieval misses, then add one component at a time and keep it only if held-out evaluation improves.",
            alternatives:
              "Rerankers can improve top-k ordering at extra latency/cost. Rewriting can recover alternate phrasing but may distort IDs or intent; preserve the original query and test both paths.",
          },
          {
            decision: "Orchestration",
            recommended:
              "Keep the first retrieval-answer-evaluate flow explicit and typed; introduce a framework only when it removes proven integration complexity.",
            alternatives:
              "Frameworks speed up prototypes and integrations; a small custom pipeline can make authorization, tracing, and failure behavior easier to audit.",
          },
        ],
        buildGuide: [
          {
            concept: "1. Define a bounded support workflow and threat model",
            task: "Create a fictional product-support scenario. Define users, supported regions, document owners, allowed questions, prohibited advice, escalation conditions, and a measurable success target. Create 30-50 representative questions, including answerable, ambiguous, unanswerable, conflicting-version, and restricted-document cases. Use synthetic or explicitly public documents only.",
            deliverable:
              "A product requirements brief, data inventory, threat model, and versioned golden question set with expected source documents and expected actions.",
            acceptance:
              "Every question has an expected answerability/route label; sensitive and out-of-scope cases have explicit safe behavior; the brief names what the system must never do.",
            architectureChoice:
              "Start with one bounded workflow and a deterministic FAQ/keyword baseline. Do not begin with agents, many tools, or an unrestricted company-wide corpus.",
          },
          {
            concept: "2. Build an idempotent, access-aware ingestion pipeline",
            task: "Implement source connectors or a local importer. Parse text while retaining page/section/URL anchors; normalize and deduplicate documents; attach version, effective date, region, team/role ACL, owner, and source ID. Record ingestion status and support re-ingest, document replacement, and deletion.",
            deliverable:
              "A repeatable ingestion command/job, document/chunk schema, source manifest, and fixtures for changed, duplicate, malformed, and deleted files.",
            acceptance:
              "Re-running ingestion does not create duplicate active versions; superseded/deleted content stops being retrievable; every indexed chunk has provenance and access metadata.",
            architectureChoice:
              "For a portfolio implementation, begin with a scheduled batch import. Add event-driven sync only when freshness requirements justify the added failure modes.",
          },
          {
            concept: "3. Create strong retrieval baselines before tuning",
            task: "Implement lexical search and a dense-vector baseline over the same corpus. Preserve metadata filters and access constraints. Use the golden set to measure Recall@k and MRR/nDCG for expected evidence; inspect misses by query type, exact identifiers, document length, and ACL.",
            deliverable:
              "Two reproducible retrievers, a benchmark script, and a query-by-query retrieval error report.",
            acceptance:
              "Metrics are calculated against labeled relevant passages, not judged from a few demos; access filtering is applied before results are exposed; baseline results can be reproduced.",
            architectureChoice:
              "Compare keyword, dense, and hybrid retrieval with reciprocal-rank fusion. Do not assume embeddings replace exact search for product codes, versions, or error identifiers.",
          },
          {
            concept: "4. Tune chunking, metadata, and ranking as experiments",
            task: "Compare structure-aware and fixed-size chunking with at least two chunk sizes/overlap settings. Add metadata filters, then evaluate optional query rewriting or reranking one change at a time. Record retrieval quality, latency, and cost for each experiment.",
            deliverable:
              "An experiment matrix, selected retrieval configuration, and examples of improved and regressed queries.",
            acceptance:
              "The selected configuration improves held-out retrieval quality without unacceptable access leaks, latency, or cost; changes are supported by recorded comparisons.",
            architectureChoice:
              "Use a held-out query set to decide whether hierarchy, reranking, or rewriting earns its complexity. Keep a simple fallback path for failures.",
          },
          {
            concept:
              "5. Generate grounded answers with citations and abstention",
            task: "Build a typed answer contract containing answer, citations (source/version/section), confidence or answerability state, and next action. Instruct the model to use only supplied evidence, treat retrieved text as untrusted data, cite supporting passages, surface source conflicts, and abstain or clarify when needed.",
            deliverable:
              "An answer service, citation renderer, prompt/version record, and tests for missing, conflicting, stale, and insufficient evidence.",
            acceptance:
              "Every material claim maps to a returned authorized passage; fabricated citations fail tests; unsupported questions abstain or ask a useful clarification instead of guessing.",
            architectureChoice:
              "Keep retrieval and generation separate and observable. A model-generated confidence score is not calibrated evidence; derive release behavior from evaluation and explicit rules.",
          },
          {
            concept:
              "6. Evaluate retrieval, answer quality, and user outcomes separately",
            task: "Expand the golden set to cover paraphrases, multi-part questions, no-answer cases, stale/conflicting documents, and permission boundaries. Report retrieval Recall@k/MRR or nDCG separately from answer correctness, citation support, abstention quality, and human usefulness. Blind-review a sample and adjudicate disagreements.",
            deliverable:
              "A versioned offline evaluation harness, scorecard, labeled failure taxonomy, and release thresholds tied to the use case.",
            acceptance:
              "A model/prompt/retriever change cannot be called better from one aggregate score; critical ACL and unsupported-answer cases have explicit pass criteria and regression tests.",
            architectureChoice:
              "Use automated metrics to triage, not replace, expert review. Calibrate any model-graded evaluation against human judgments and publish known limitations.",
          },
          {
            concept:
              "7. Enforce security, privacy, and operational failure behavior",
            task: "Test authorization filters at ingestion and query time, cross-team access attempts, prompt injection inside documents, secret leakage, rate limits, provider timeout, malformed input, and deletion propagation. Avoid storing raw prompts by default; redact logs and define retention. Add retries/timeouts and deterministic escalation.",
            deliverable:
              "Authorization and adversarial regression tests, data-retention/deletion notes, failure-mode table, and an incident runbook.",
            acceptance:
              "Unauthorized chunks never reach the model context; prompt injection cannot override policy; provider failure fails safely; deletion and retention behavior are demonstrable.",
            architectureChoice:
              "Prefer defense in depth: identity-derived filters, database-enforced access, least privilege, and output checks. Prompt instructions alone are not an authorization boundary.",
          },
          {
            concept:
              "8. Release with observability, cost controls, and a rollback plan",
            task: "Deploy behind authentication. Trace request IDs through retrieval and generation; record latency, selected document IDs/versions, evaluation flags, token usage, error categories, and estimated cost without collecting unnecessary sensitive text. Add a feedback/report route, staged rollout, dashboard, and rollback procedure.",
            deliverable:
              "A deployed demo using safe sample data, architecture/runbook docs, evaluation report, latency/cost table, and a release decision memo.",
            acceptance:
              "A teammate can diagnose a retrieval miss, review a flagged answer, disable a bad release, and restore the prior index/configuration; the demo makes limitations and data handling visible.",
            architectureChoice:
              "Start with a single service and clear modules. Split ingestion, retrieval, or generation into separate services only when scale, isolation, or ownership requires it.",
          },
        ],
      },
    ],
    jobTitles: [
      "AI engineer",
      "Generative AI engineer",
      "Applied AI engineer",
      "Software engineer, AI products",
    ],
  },
  {
    id: "ml-engineer",
    number: "02",
    title: "Machine learning engineer",
    family: "Machine learning + software",
    summary:
      "Turn data and trained models into repeatable product capabilities, from feature pipelines and experiments to serving and monitoring.",
    bestFor:
      "People who enjoy both software systems and empirical model improvement.",
    work: "Build training and inference pipelines, improve model quality, and partner with product and data teams to operationalize predictions.",
    tools: [
      "Python",
      "SQL",
      "scikit-learn or PyTorch",
      "data pipelines",
      "model serving",
      "cloud",
    ],
    phases: [
      {
        title: "Establish the quantitative and coding base",
        focus: "Python, SQL, probability, and data handling",
        learn: [
          "Python, NumPy, pandas, packaging, and testing",
          "SQL joins, windows, data quality, and reproducible queries",
          "Probability, vectors, gradients, and uncertainty at an applied level",
        ],
        build:
          "Create a reproducible analysis-to-training pipeline on a public tabular dataset.",
        evidence:
          "Versioned data assumptions, a clean baseline, and a repeatable run from a fresh environment.",
      },
      {
        title: "Run disciplined experiments",
        focus: "Baselines, splits, metrics, and error analysis",
        learn: [
          "Train, validation, and test separation; leakage prevention",
          "Metric choice tied to the cost of false positives and false negatives",
          "Feature engineering, regularization, and model comparison",
        ],
        build:
          "Compare a simple baseline with a stronger model and analyze performance across meaningful slices.",
        evidence:
          "An experiment log and an explanation of which errors matter most to the product.",
      },
      {
        title: "Package and serve a model",
        focus: "Inference contracts, throughput, and repeatable release",
        learn: [
          "Batch versus online prediction and their trade-offs",
          "API contracts, serialization, containers, and CI checks",
          "Model and data versioning with reproducible artifacts",
        ],
        build:
          "Deploy a versioned model behind an API with input validation and a documented rollback path.",
        evidence:
          "A load-aware demo, tests for the inference contract, and measured latency.",
      },
      {
        title: "Monitor the full lifecycle",
        focus: "Drift, retraining decisions, and operational ownership",
        learn: [
          "Data quality, drift signals, and delayed-label evaluation",
          "Monitoring thresholds and alert fatigue",
          "Privacy, fairness checks, and limits on automated decisions",
        ],
        build:
          "Simulate changing input data, detect a meaningful shift, and document a safe response.",
        evidence:
          "A monitoring dashboard or report with explicit retraining and human-escalation criteria.",
      },
    ],
    projects: [
      {
        title: "Prediction service with a real baseline",
        brief:
          "Train a model for a clearly scoped public-data task, compare it with a naive baseline, and expose it through a small API.",
        proof:
          "Show leakage checks, metric rationale, error slices, latency, and how to reproduce the result.",
      },
      {
        title: "Drift and retraining simulation",
        brief:
          "Replay a time-ordered dataset with changing patterns and decide when a model should be reviewed or refreshed.",
        proof:
          "Include time-aware validation, drift signals, and a human-readable operating playbook.",
      },
    ],
    jobTitles: [
      "Machine learning engineer",
      "Applied machine learning engineer",
      "Modeling engineer",
      "ML platform engineer",
    ],
  },
  {
    id: "data-scientist",
    number: "03",
    title: "Data scientist",
    family: "Statistics + decision science",
    summary:
      "Use data to explain what is happening, estimate what may happen next, and help teams choose what to do.",
    bestFor:
      "People drawn to statistics, investigation, experiments, and explaining evidence.",
    work: "Query and analyze data, design experiments, build predictive analyses, and translate uncertainty into decisions.",
    tools: [
      "SQL",
      "Python or R",
      "statistics",
      "experimentation",
      "visualization",
      "communication",
    ],
    phases: [
      {
        title: "Get fluent in data and measurement",
        focus: "SQL, descriptive statistics, and data quality",
        learn: [
          "SQL joins, aggregations, windows, and query inspection",
          "Distributions, sampling, confidence intervals, and uncertainty",
          "Missingness, measurement bias, and how events are collected",
        ],
        build:
          "Answer a concrete business or public-policy question from a documented dataset.",
        evidence:
          "A transparent query, assumptions log, and visual summary that a non-specialist can follow.",
      },
      {
        title: "Reason about cause and effect",
        focus: "Experiment design and causal caution",
        learn: [
          "Hypotheses, randomization, power, and practical significance",
          "Confounding, selection bias, and limits of observational analysis",
          "Segment analysis without fishing for a flattering result",
        ],
        build:
          "Design an experiment or careful quasi-experimental analysis and state what it cannot establish.",
        evidence:
          "A pre-analysis outline, uncertainty range, and decision recommendation.",
      },
      {
        title: "Develop predictive judgment",
        focus: "Prediction as a decision input, not a scoreboard",
        learn: [
          "Baseline models, validation strategy, and feature leakage",
          "Calibration, ranking, and cost-sensitive metrics",
          "Interpretability and the limits of feature importance",
        ],
        build:
          "Create a prediction with a baseline and a decision threshold tied to a plausible operating cost.",
        evidence:
          "Error analysis by relevant subgroup and a clear statement of who should use the prediction.",
      },
      {
        title: "Influence a real decision",
        focus: "Communication, adoption, and ongoing measurement",
        learn: [
          "Executive summaries that distinguish facts from recommendations",
          "Dashboards with definitions and ownership",
          "Monitoring whether the recommended action produced the expected outcome",
        ],
        build:
          "Present findings as a decision memo with options, risks, and a follow-up measurement plan.",
        evidence:
          "A concise narrative, reproducible analysis, and an action whose outcome can be checked.",
      },
    ],
    projects: [
      {
        title: "Experiment decision memo",
        brief:
          "Use a public or synthetic product scenario to plan an A/B test, select a meaningful outcome, and reason through sample size and stopping rules.",
        proof:
          "Make assumptions explicit and distinguish statistical evidence from business importance.",
      },
      {
        title: "Forecast with uncertainty",
        brief:
          "Forecast a time series against a simple baseline and explain how a team should use the range of plausible outcomes.",
        proof:
          "Use time-aware validation, inspect residuals, and explain the cost of forecast error.",
      },
    ],
    jobTitles: [
      "Data scientist",
      "Product data scientist",
      "Decision scientist",
      "Experimentation analyst",
    ],
  },
  {
    id: "mlops",
    number: "04",
    title: "MLOps / AI platform engineer",
    family: "Infrastructure + ML systems",
    summary:
      "Build the reliable infrastructure that lets teams train, evaluate, deploy, observe, and govern models repeatedly.",
    bestFor:
      "People who like automation, cloud systems, developer tooling, and operational reliability.",
    work: "Create model pipelines and platform primitives, improve deployment safety, and manage data, quality, and cost observability.",
    tools: [
      "Linux",
      "containers",
      "CI/CD",
      "cloud",
      "orchestration",
      "observability",
    ],
    phases: [
      {
        title: "Build systems fluency",
        focus: "Linux, networking, scripting, and version control",
        learn: [
          "Shell, processes, permissions, DNS, HTTP, and TLS basics",
          "Git workflows, Python automation, and infrastructure concepts",
          "Logs, metrics, traces, and the difference between each",
        ],
        build:
          "Package a small service, run it locally in a container, and automate its tests.",
        evidence:
          "A repeatable developer setup and clear debugging notes for a failed run.",
      },
      {
        title: "Understand the ML lifecycle",
        focus: "Data, experiments, artifacts, and reproducibility",
        learn: [
          "Training inputs, feature pipelines, and data validation",
          "Experiment tracking and model artifact lineage",
          "Batch versus online workloads and their operating needs",
        ],
        build:
          "Automate a data validation and training workflow for a small model.",
        evidence:
          "A traceable run from input data and code version to a tested model artifact.",
      },
      {
        title: "Automate safe delivery",
        focus: "CI/CD, environments, deployment strategies, and access control",
        learn: [
          "Build and release pipelines with quality gates",
          "Secrets, identity, permissions, and environment separation",
          "Canary, shadow, or staged rollout patterns",
        ],
        build:
          "Deploy a model service through a pipeline with validation and a documented rollback.",
        evidence:
          "A release diagram, automated checks, and an example of a rejected unsafe release.",
      },
      {
        title: "Operate for quality and cost",
        focus: "Observability, incident response, and platform usability",
        learn: [
          "Latency, availability, model quality, and spend signals",
          "Drift and delayed labels as operational problems",
          "Runbooks, service ownership, and platform self-service",
        ],
        build:
          "Add dashboards and alerts for a model service and simulate a degradation incident.",
        evidence:
          "A short incident review, useful alerts, and one improvement that prevents recurrence.",
      },
    ],
    projects: [
      {
        title: "Reproducible model release pipeline",
        brief:
          "Automate tests, data checks, training, artifact versioning, and deployment for a small model.",
        proof:
          "Document lineage, access boundaries, rollback, and the quality gate that stops a bad release.",
      },
      {
        title: "Inference observability lab",
        brief:
          "Instrument a demo endpoint for latency, errors, cost proxies, and delayed quality feedback.",
        proof:
          "Show an actionable dashboard, a simulated incident, and a runbook that another engineer can follow.",
      },
    ],
    jobTitles: [
      "MLOps engineer",
      "Machine learning platform engineer",
      "AI infrastructure engineer",
      "ML reliability engineer",
    ],
  },
  {
    id: "research",
    number: "05",
    title: "AI research scientist",
    family: "Research + advanced mathematics",
    summary:
      "Develop new methods or evidence through careful experiments, mathematical reasoning, and communication with the research community.",
    bestFor:
      "People motivated by open-ended questions, deep study, and publishing reproducible results.",
    work: "Read papers, formulate hypotheses, implement experiments, analyze results, and share methods and limitations.",
    tools: [
      "linear algebra",
      "probability",
      "PyTorch or JAX",
      "experiment design",
      "paper writing",
      "reproducibility",
    ],
    phases: [
      {
        title: "Build mathematical and computing depth",
        focus:
          "Linear algebra, probability, optimization, and strong programming",
        learn: [
          "Vectors, matrices, eigen concepts, and derivatives",
          "Probability, estimation, optimization, and statistical reasoning",
          "Deep learning implementation, profiling, and numerical stability",
        ],
        build:
          "Implement a well-understood method from first principles, then compare it with a trusted library implementation.",
        evidence:
          "Correctness tests, clear derivations, and an explanation of numerical or computational limits.",
      },
      {
        title: "Learn to read and reproduce research",
        focus: "Paper analysis, baselines, and experimental controls",
        learn: [
          "Read methods, assumptions, ablations, and limitations critically",
          "Choose a tractable result with available data and compute",
          "Track seeds, versions, hardware, and failed reproductions",
        ],
        build:
          "Reproduce one result from a recent paper and report where your setup differs.",
        evidence:
          "A reproducibility report with plots, run instructions, and honest variance or mismatch analysis.",
      },
      {
        title: "Form a defensible research question",
        focus: "Novelty, literature grounding, and feasible scope",
        learn: [
          "Map adjacent work and identify what is genuinely unknown",
          "State a falsifiable hypothesis and a meaningful baseline",
          "Estimate data, compute, and evaluation requirements before implementation",
        ],
        build:
          "Propose a narrow extension and run a pilot that can disconfirm the main hypothesis.",
        evidence:
          "A short proposal that explains novelty, feasibility, and alternative explanations.",
      },
      {
        title: "Communicate and collaborate",
        focus: "Research writing, review, and responsible claims",
        learn: [
          "Write methods so another researcher can reproduce them",
          "Separate exploratory findings from confirmatory evidence",
          "Explain limitations, risks, and negative results",
        ],
        build:
          "Write a paper-style report or technical note and invite critical review from practitioners.",
        evidence:
          "A clear artifact, open limitations, and a thoughtful response to review.",
      },
    ],
    projects: [
      {
        title: "Paper reproduction",
        brief:
          "Reproduce a tractable published result, using the same evaluation where possible and noting any differences in data, code, or compute.",
        proof:
          "Provide run commands, multiple seeds where practical, plots, and a sober comparison with the reported result.",
      },
      {
        title: "Ablation study",
        brief:
          "Choose one small modeling question, define a baseline and controlled variations, and test whether the proposed change matters.",
        proof:
          "Make the hypothesis falsifiable and report negative or ambiguous results as carefully as positive ones.",
      },
    ],
    jobTitles: [
      "Research scientist",
      "Research engineer",
      "Research assistant",
      "Applied scientist",
    ],
  },
  {
    id: "evaluation",
    number: "06",
    title: "AI evaluation & safety engineer",
    family: "Quality engineering + responsible AI",
    summary:
      "Measure whether AI systems behave well across real tasks and failure conditions, then give teams evidence to improve or constrain them.",
    bestFor:
      "People who are methodical, skeptical of demos, and interested in quality, safety, or security.",
    work: "Design test datasets, adversarial evaluations, human review, release criteria, and monitoring for model behavior.",
    tools: [
      "Python",
      "statistics",
      "test design",
      "red teaming",
      "human review",
      "risk analysis",
    ],
    phases: [
      {
        title: "Learn software testing and measurement",
        focus: "Test design, Python, statistics, and clear requirements",
        learn: [
          "Unit, integration, regression, and property-based testing concepts",
          "Sampling, annotation consistency, and confidence in measured rates",
          "Translate vague quality goals into observable criteria",
        ],
        build:
          "Create an automated test harness for a small non-AI service and report its coverage limits.",
        evidence:
          "A stable test suite and a useful bug report with minimal reproduction steps.",
      },
      {
        title: "Build representative AI evaluations",
        focus: "Task coverage, data quality, and scoring methods",
        learn: [
          "Representative cases, edge cases, and data contamination risks",
          "Rubrics, exact-match metrics, pairwise judgments, and calibration",
          "When human review is needed and how to assess reviewer agreement",
        ],
        build:
          "Build a small, documented benchmark for one bounded model task with examples and a scoring guide.",
        evidence:
          "Dataset provenance, rubric, baseline results, and disagreement examples.",
      },
      {
        title: "Probe failures and misuse",
        focus: "Adversarial testing, privacy, and risk-based prioritization",
        learn: [
          "Prompt injection, data leakage, unsafe tool use, and over-reliance",
          "Threat modeling and likelihood/severity reasoning",
          "Mitigations that can be tested instead of policy-only claims",
        ],
        build:
          "Red-team a bounded assistant and turn findings into reproducible regression tests.",
        evidence:
          "A risk register with mitigations, residual risks, and retest results.",
      },
      {
        title: "Make quality part of release decisions",
        focus: "Gates, monitoring, incident response, and clear communication",
        learn: [
          "Release thresholds connected to user impact",
          "Online monitoring and feedback loops for changing behavior",
          "Escalation paths and communicating residual uncertainty",
        ],
        build:
          "Write a release-readiness report with go/no-go criteria and a plan for post-launch review.",
        evidence:
          "A concise decision memo that makes risks, evidence, and unresolved gaps visible.",
      },
    ],
    projects: [
      {
        title: "Evaluation harness for a focused task",
        brief:
          "Compare model versions on a representative, documented set of cases using explicit metrics and human review where needed.",
        proof:
          "Explain sampling limits, scoring disagreement, and why the chosen threshold is appropriate.",
      },
      {
        title: "Red-team to regression suite",
        brief:
          "Probe a demo assistant for a bounded set of misuse and reliability risks, then encode reproducible failures as tests.",
        proof:
          "Show severity rationale, mitigation tests, and residual risks without claiming the system is universally safe.",
      },
    ],
    jobTitles: [
      "AI evaluation engineer",
      "AI safety engineer",
      "AI quality engineer",
      "Model risk analyst",
    ],
  },
];

const foundations = [
  {
    number: "A",
    title: "Programming & data",
    detail:
      "Write readable code, use Git, test changes, work with APIs, and query structured data. Python is broadly useful; TypeScript is valuable for product-facing AI.",
  },
  {
    number: "B",
    title: "Math with a purpose",
    detail:
      "Build probability, statistics, vectors, and optimization as your chosen work requires. Learn enough to reason about assumptions and metrics, not to collect certificates.",
  },
  {
    number: "C",
    title: "Model literacy",
    detail:
      "Understand training versus inference, data and evaluation, generalization, uncertainty, and where a simpler non-AI solution is better.",
  },
  {
    number: "D",
    title: "Engineering practice",
    detail:
      "Use reproducible environments, versioned data and code, sensible access controls, observability, and clear documentation.",
  },
  {
    number: "E",
    title: "Responsible judgment",
    detail:
      "Consider privacy, security, accessibility, bias, consent, human oversight, and the cost of errors before deployment.",
  },
];

const startingAdvice = {
  new: "Start with one programming language, Git, and small complete programs. Learn SQL and basic statistics alongside it; do not begin by trying to train a large model.",
  software:
    "Keep your software strengths. Add Python and data handling, then learn model evaluation and AI-specific reliability. Your first advantage is shipping a whole feature, not knowing every algorithm.",
  data: "Lean into SQL, statistics, and measurement. Add software engineering habits, deployment, and APIs so your analyses or models can become dependable tools.",
};

type StartingPoint = keyof typeof startingAdvice;

const skillDimensions = [
  { id: "coding", label: "Programming & software" },
  { id: "statistics", label: "Statistics & math" },
  { id: "data", label: "Data work" },
  { id: "systems", label: "Systems & operations" },
  { id: "research", label: "Research & experimentation" },
  { id: "evaluation", label: "Evaluation & risk" },
  { id: "communication", label: "Technical communication" },
] as const;

type SkillId = (typeof skillDimensions)[number]["id"];

const skillTargets: Record<string, Record<SkillId, number>> = {
  "ai-engineer": {
    coding: 3,
    statistics: 2,
    data: 2,
    systems: 3,
    research: 1,
    evaluation: 3,
    communication: 2,
  },
  "ml-engineer": {
    coding: 3,
    statistics: 3,
    data: 3,
    systems: 3,
    research: 1,
    evaluation: 3,
    communication: 2,
  },
  "data-scientist": {
    coding: 2,
    statistics: 3,
    data: 3,
    systems: 1,
    research: 2,
    evaluation: 3,
    communication: 3,
  },
  mlops: {
    coding: 3,
    statistics: 1,
    data: 2,
    systems: 3,
    research: 1,
    evaluation: 2,
    communication: 2,
  },
  research: {
    coding: 3,
    statistics: 3,
    data: 3,
    systems: 2,
    research: 3,
    evaluation: 3,
    communication: 2,
  },
  evaluation: {
    coding: 2,
    statistics: 3,
    data: 2,
    systems: 2,
    research: 2,
    evaluation: 3,
    communication: 3,
  },
};

type LearningResource = {
  title: string;
  provider: string;
  description: string;
  prerequisites: string;
  estimatedEffort: string;
  href: string;
};

const learningResources: Record<string, LearningResource[]> = {
  "ai-engineer": [
    {
      title: "Large Language Models Course",
      provider: "Hugging Face",
      description:
        "Work through transformers, datasets, fine-tuning, and sharing models.",
      prerequisites: "Good Python; introductory deep learning helps.",
      estimatedEffort:
        "Course guidance: 6-8 hours per chapter; begin with chapters 1-4.",
      href: "https://huggingface.co/learn/llm-course",
    },
    {
      title: "Machine Learning Crash Course",
      provider: "Google for Developers",
      description:
        "Interactive foundations through models, data, LLMs, and production systems.",
      prerequisites:
        "Review the linked prerequisites; basic programming and algebra help.",
      estimatedEffort:
        "Self-paced estimate: 12-20 hours for selected core modules.",
      href: "https://developers.google.com/machine-learning/crash-course",
    },
  ],
  "ml-engineer": [
    {
      title: "Machine Learning Crash Course",
      provider: "Google for Developers",
      description:
        "Hands-on foundations, evaluation, production systems, and responsible engineering.",
      prerequisites:
        "Review the linked prerequisites; basic programming and algebra help.",
      estimatedEffort:
        "Self-paced estimate: 12-20 hours for selected core modules.",
      href: "https://developers.google.com/machine-learning/crash-course",
    },
    {
      title: "User Guide",
      provider: "scikit-learn",
      description:
        "Model selection, evaluation metrics, pipelines, common pitfalls, and persistence.",
      prerequisites: "Python basics and introductory statistics.",
      estimatedEffort: "Self-paced estimate: 6-10 hours for selected sections.",
      href: "https://scikit-learn.org/stable/user_guide.html",
    },
  ],
  "data-scientist": [
    {
      title: "Machine Learning Crash Course",
      provider: "Google for Developers",
      description:
        "Interactive model, data, evaluation, and production fundamentals.",
      prerequisites:
        "Review the linked prerequisites; basic programming and algebra help.",
      estimatedEffort:
        "Self-paced estimate: 12-20 hours for selected core modules.",
      href: "https://developers.google.com/machine-learning/crash-course",
    },
    {
      title: "User Guide",
      provider: "scikit-learn",
      description:
        "Practical model evaluation, validation, data preparation, and common pitfalls.",
      prerequisites: "Python basics and introductory statistics.",
      estimatedEffort: "Self-paced estimate: 6-10 hours for selected sections.",
      href: "https://scikit-learn.org/stable/user_guide.html",
    },
  ],
  mlops: [
    {
      title: "MLflow Tracking",
      provider: "MLflow",
      description:
        "Track parameters, code versions, metrics, artifacts, and model runs.",
      prerequisites: "Comfort with Python and a small model-training script.",
      estimatedEffort:
        "Self-paced estimate: 2-4 hours for the quickstart and core concepts.",
      href: "https://mlflow.org/docs/latest/ml/tracking/",
    },
    {
      title: "Production ML Systems",
      provider: "Google for Developers",
      description:
        "Study the components and operational concerns of production ML.",
      prerequisites: "Introductory ML concepts; systems experience is helpful.",
      estimatedEffort:
        "Self-paced estimate: 2-4 hours for this module and notes.",
      href: "https://developers.google.com/machine-learning/crash-course/production-ml-systems",
    },
  ],
  research: [
    {
      title: "Large Language Models Course",
      provider: "Hugging Face",
      description:
        "A hands-on route into transformer models, datasets, fine-tuning, and research-adjacent practice.",
      prerequisites:
        "Good Python; introductory deep learning is recommended by the course.",
      estimatedEffort:
        "Course guidance: 6-8 hours per chapter; start with the modules relevant to your question.",
      href: "https://huggingface.co/learn/llm-course",
    },
    {
      title: "Machine Learning Crash Course",
      provider: "Google for Developers",
      description:
        "Refresh model, data, evaluation, and responsible engineering fundamentals.",
      prerequisites:
        "Review the linked prerequisites; basic programming and algebra help.",
      estimatedEffort:
        "Self-paced estimate: 12-20 hours for selected core modules.",
      href: "https://developers.google.com/machine-learning/crash-course",
    },
  ],
  evaluation: [
    {
      title: "AI Risk Management Framework",
      provider: "NIST",
      description:
        "A voluntary framework and playbook for mapping, measuring, managing, and governing AI risk.",
      prerequisites:
        "No technical prerequisite; useful to pair with a concrete system.",
      estimatedEffort:
        "Self-paced estimate: 2-4 hours for the overview and selected playbook material.",
      href: "https://www.nist.gov/itl/ai-risk-management-framework",
    },
    {
      title: "GenAI Security Project",
      provider: "OWASP",
      description:
        "Community-maintained security guidance and resources for generative AI applications.",
      prerequisites: "Basic web or application security concepts help.",
      estimatedEffort:
        "Self-paced estimate: 2-4 hours to review the overview and relevant risk guidance.",
      href: "https://genai.owasp.org/",
    },
  ],
};

const interviewPrompts: Record<string, string[]> = {
  "ai-engineer": [
    "Explain how you would evaluate a source-grounded assistant and decide when it should abstain.",
    "A model feature is slow and expensive. What would you measure and change first?",
    "Describe a prompt-injection or data-access risk in one of your projects and how you tested the mitigation.",
  ],
  "ml-engineer": [
    "How would you split time-dependent data to avoid leakage?",
    "Choose a metric for an imbalanced task and explain how the error costs affect your threshold.",
    "Describe how you would roll back a model whose quality drops after deployment.",
  ],
  "data-scientist": [
    "How would you design an experiment when the primary metric can be affected by seasonality?",
    "Explain the difference between an observed association and a causal effect in a project.",
    "How would you communicate an uncertain result when a stakeholder wants a definite answer?",
  ],
  mlops: [
    "Trace a model artifact from source data through training, approval, deployment, and rollback.",
    "What signals would you monitor for an online model, and which would page someone?",
    "Describe a production incident you would simulate and the runbook you would prepare.",
  ],
  research: [
    "What is one paper result you reproduced, and where did your setup differ from the original?",
    "How would you design an experiment that could disprove your current hypothesis?",
    "How would you distinguish a meaningful improvement from noise across repeated runs?",
  ],
  evaluation: [
    "How would you create a representative evaluation set for an assistant used by different groups?",
    "Describe an adversarial finding and how you would turn it into a regression test.",
    "What evidence would you require before recommending release, and what risks would remain?",
  ],
};

const portfolioRubric = [
  "The intended user, problem, scope, and non-goals are explicit.",
  "A baseline and task-relevant evaluation method are documented.",
  "Setup, tests, data provenance, and important assumptions are reproducible.",
  "Failure cases and limitations are shown, not hidden.",
  "Privacy, security, misuse, and human-oversight risks are considered.",
  "A concise case study explains decisions, measured outcomes, and next steps.",
];

const phaseGates: Record<string, string[]> = {
  "ai-engineer": [
    "A second developer can run the service; invalid input and dependency failure have explicit, tested behavior.",
    "A held-out task set compares a baseline and the AI approach; quality, latency, and cost trade-offs are written down.",
    "Retrieved claims link to source evidence; prompt injection, permissions, abstention, and empty retrieval have regression tests.",
    "A release has traces, quality and cost signals, a rollback route, and an owner for reviewing user feedback.",
  ],
  "ml-engineer": [
    "The baseline is reproducible, the split matches the deployment setting, and leakage checks are documented.",
    "Model comparisons use the same data and metric; error slices and uncertainty inform the selection.",
    "A versioned artifact passes input-contract tests and can be loaded from a clean environment.",
    "Drift alerts lead to an explicit investigation or retraining decision, not blind automatic replacement.",
  ],
  "data-scientist": [
    "A teammate can reproduce the query and metric definitions; missingness and measurement limitations are recorded.",
    "The analysis states the estimand, assumptions, stopping rule, and practical effect size before interpretation.",
    "A predictive result is compared with a baseline and translated into thresholds, error costs, and user impact.",
    "A named decision owner, action, and follow-up measure connect the analysis to an outcome.",
  ],
  mlops: [
    "A fresh machine can build and run the service from a locked, documented environment.",
    "Every artifact links to its code, input data, parameters, and evaluation results.",
    "The release pipeline checks permissions, secrets, validation gates, staged rollout, and rollback.",
    "Alerts have thresholds, owners, and runbooks; a simulated incident demonstrates recovery.",
  ],
  research: [
    "The implementation reproduces a known small case and includes correctness and numerical-stability checks.",
    "The reproduction records versions, seeds, compute, deviations, and run-to-run variation.",
    "The proposed question has a baseline, a falsifiable hypothesis, and a pilot that could reject it.",
    "The report separates evidence from interpretation and makes negative results and limitations reviewable.",
  ],
  evaluation: [
    "The test plan covers normal, boundary, and known high-impact cases with explicit expected behavior.",
    "The scoring guide is repeatable; ambiguous examples and reviewer disagreement are visible.",
    "Threats map to reproducible tests, tested mitigations, and documented residual risk.",
    "Release criteria name owners, thresholds, escalation routes, and post-release review signals.",
  ],
};

const skillEvidence: Record<SkillId, string> = {
  coding: "Evidence: tested code another person can install, run, and review.",
  statistics:
    "Evidence: select and defend a metric, validation design, and uncertainty statement.",
  data: "Evidence: trace inputs, definitions, missingness, leakage checks, and transformations.",
  systems:
    "Evidence: deploy, observe, debug, and recover a service with documented limits.",
  research:
    "Evidence: frame a falsifiable question and report a reproducible experiment.",
  evaluation:
    "Evidence: build a representative test set, analyze failures, and justify release criteria.",
  communication:
    "Evidence: explain a decision, trade-offs, and limitations to a technical and non-technical reader.",
};

const startingPlaybook: Record<
  StartingPoint,
  { firstMove: string; avoid: string }
> = {
  new: {
    firstMove:
      "Complete one small program end-to-end before adding an AI dependency. Keep the code, tests, and README together.",
    avoid:
      "Do not confuse copying a notebook or prompt with being able to debug, test, and maintain the system.",
  },
  software: {
    firstMove:
      "Add an AI capability to software you already understand; establish a non-AI baseline and an evaluation set before tuning prompts.",
    avoid:
      "Do not stop at a successful demo. Exercise malformed input, timeouts, permissions, model changes, and cost limits.",
  },
  data: {
    firstMove:
      "Turn an analysis or model into a versioned, tested interface that a second person can rerun and critique.",
    avoid:
      "Do not treat an offline metric as proof of product impact; check leakage, uncertainty, operational limits, and the decision it supports.",
  },
};

const foundationPractice: Record<
  string,
  { practice: string; evidence: string }
> = {
  A: {
    practice:
      "Build a small, tested API or analysis tool; review a pull request and fix an issue from a clean checkout.",
    evidence:
      "A reproducible repository with tests, dependency instructions, and readable commit history.",
  },
  B: {
    practice:
      "Work through a metric or experiment by hand, then verify the calculation in code and explain its assumptions.",
    evidence:
      "A notebook or memo showing a baseline, uncertainty, and why the metric matches the decision.",
  },
  C: {
    practice:
      "Compare an AI approach with a deterministic baseline on representative and adversarial examples.",
    evidence:
      "A test set, failure analysis, and a clear explanation of when not to use the model.",
  },
  D: {
    practice:
      "Deploy a small service; add structured logs, an input contract, a health check, and a rollback note.",
    evidence:
      "Another person can operate the service and diagnose a deliberately simulated failure.",
  },
  E: {
    practice:
      "Threat-model one feature and examine privacy, accessibility, disparate impacts, misuse, and human escalation.",
    evidence:
      "A risk register maps each significant risk to a test, mitigation, owner, and residual-risk note.",
  },
};

const projectBuildSequences: Record<
  string,
  { title: string; action: string }[]
> = {
  "ai-engineer": [
    {
      title: "Bound the user task",
      action:
        "Write the user, allowed inputs, success condition, non-goals, and a deterministic fallback.",
    },
    {
      title: "Create the evaluation set",
      action:
        "Label representative, edge, and refusal cases before selecting a prompt or model.",
    },
    {
      title: "Build the smallest reliable slice",
      action:
        "Add typed inputs/outputs, retrieval or tools only when justified, and tests for failure paths.",
    },
    {
      title: "Release with evidence",
      action:
        "Measure answer quality, p95 latency, cost per task, and regressions; document rollback and data handling.",
    },
  ],
  "ml-engineer": [
    {
      title: "Define the prediction decision",
      action:
        "Specify who acts on the output, what errors cost, and what a naive baseline predicts.",
    },
    {
      title: "Design a valid experiment",
      action:
        "Choose leakage-resistant splits, metrics, slices, and repeat runs before model tuning.",
    },
    {
      title: "Package the lifecycle",
      action:
        "Version data, code, features, model artifact, and inference contract as one reproducible path.",
    },
    {
      title: "Simulate production",
      action:
        "Measure serving behavior, inject data shift, and document monitoring, escalation, and rollback.",
    },
  ],
  "data-scientist": [
    {
      title: "Frame the decision",
      action:
        "Define the stakeholder, population, outcome, time horizon, and decision that analysis could change.",
    },
    {
      title: "Audit measurement",
      action:
        "Inspect definitions, missingness, selection, seasonality, and whether the data supports the question.",
    },
    {
      title: "Test alternatives",
      action:
        "Compare a baseline, quantify uncertainty, check important slices, and avoid causal claims without assumptions.",
    },
    {
      title: "Close the loop",
      action:
        "Write a decision memo with options, owner, expected risk, and a follow-up outcome measure.",
    },
  ],
  mlops: [
    {
      title: "Map the lifecycle",
      action:
        "Draw data, training, artifact, approval, deployment, monitoring, and rollback boundaries.",
    },
    {
      title: "Automate reproducibility",
      action:
        "Track code/data lineage, validate schemas, test pipelines, and make environments repeatable.",
    },
    {
      title: "Harden delivery",
      action:
        "Add least-privilege access, secret handling, staged release, quality gates, and rollback automation.",
    },
    {
      title: "Prove operability",
      action:
        "Set service objectives, test alerts with an incident drill, and measure recovery and cost.",
    },
  ],
  research: [
    {
      title: "Reproduce a baseline",
      action:
        "Select a tractable paper result and record code, data, compute, versions, and deviations.",
    },
    {
      title: "State a falsifiable question",
      action:
        "Name the hypothesis, strongest alternative explanation, baseline, and result that would disconfirm it.",
    },
    {
      title: "Control the experiment",
      action:
        "Plan ablations, seeds, data splits, compute budget, and statistical interpretation before the run.",
    },
    {
      title: "Share a reviewable result",
      action:
        "Publish methods, artifacts, negative results, limitations, and a careful claim matched to the evidence.",
    },
  ],
  evaluation: [
    {
      title: "Define the risk boundary",
      action:
        "Describe users, intended use, prohibited use, affected groups, and consequence severity.",
    },
    {
      title: "Construct representative tests",
      action:
        "Document sampling, expected behavior, annotation rules, reviewer agreement, and blind spots.",
    },
    {
      title: "Attack and retest",
      action:
        "Probe misuse and edge cases; turn findings into reproducible tests and verify mitigations.",
    },
    {
      title: "Make a release recommendation",
      action:
        "Set evidence-based gates, escalation owners, residual-risk acceptance, and monitoring triggers.",
    },
  ],
};

const buildLabGuides: Record<string, BuildLabStep[]> = {
  "ai-engineer": [
    {
      concept: "Problem framing and deterministic baselines",
      task: "Write three realistic user questions, the allowed document set, one out-of-scope request, and what the product should do when evidence is missing. Implement a simple keyword or FAQ baseline first.",
      deliverable:
        "A one-page product brief, a small versioned question set, and a working baseline.",
      acceptance:
        "A reviewer can identify the user, success condition, allowed sources, and safe fallback without reading your code.",
    },
    {
      concept: "Retrieval and grounded generation",
      task: "Add document ingestion, metadata, retrieval, and an answer path. Keep source IDs in the response. Compare retrieved results with the baseline on the same questions.",
      deliverable:
        "A runnable assistant with source references and a result table for the fixed question set.",
      acceptance:
        "Every supported answer points to retrieved evidence; missing evidence returns a clear abstention rather than an invented answer.",
    },
    {
      concept: "Adversarial testing and application security",
      task: "Add tests for prompt injection in source text, cross-user access, empty retrieval, malformed input, model timeout, and unsafe output. Fix and retest each failure.",
      deliverable:
        "A regression suite, a small threat model, and before/after failure notes.",
      acceptance:
        "The tests fail before the fix, pass afterward, and do not expose content outside the caller's allowed sources.",
    },
    {
      concept: "Observability and product operations",
      task: "Instrument request ID, latency, retrieval outcome, errors, and estimated model cost without logging sensitive content. Add a release checklist and rollback notes.",
      deliverable:
        "A deployed or locally runnable release candidate with an operations note and evaluation report.",
      acceptance:
        "A teammate can diagnose a failed request, inspect quality/cost signals, and roll back without exposing secrets or user data.",
    },
  ],
  "ml-engineer": [
    {
      concept: "Decision framing and naive baselines",
      task: "Define the prediction user, decision, horizon, and cost of false positives/negatives. Build a naive baseline and inspect target and feature availability times.",
      deliverable:
        "A problem statement, data dictionary, baseline metric, and leakage-risk list.",
      acceptance:
        "The baseline and decision threshold are understandable, and no feature uses information unavailable at prediction time.",
    },
    {
      concept: "Validation and controlled experiments",
      task: "Create a split that reflects deployment, then compare at least two models with the same metric and repeatable configuration. Inspect important error slices.",
      deliverable:
        "An experiment table, split rationale, and error-analysis report.",
      acceptance:
        "A clean rerun reproduces the comparison; the chosen model is justified by decision costs, not a single headline score.",
    },
    {
      concept: "Inference contracts and reproducible artifacts",
      task: "Package preprocessing and model inference behind a versioned interface. Add schema checks, boundary tests, and a clean-environment load test.",
      deliverable:
        "A versioned model artifact, tested prediction API, and run instructions.",
      acceptance:
        "Training and inference transformations match; invalid inputs fail clearly, and a fresh environment can load the artifact.",
    },
    {
      concept: "Drift and lifecycle decisions",
      task: "Replay a time-ordered sample with simulated input shift. Track data quality and prediction signals; write when to investigate, retrain, or keep the current model.",
      deliverable:
        "A monitoring report, drift simulation, and human-reviewed model update policy.",
      acceptance:
        "A signal triggers investigation rather than blind retraining, and the previous model can be restored.",
    },
  ],
  "data-scientist": [
    {
      concept: "Decision questions and metric definitions",
      task: "Interview an imagined stakeholder: write the decision, unit of analysis, population, time window, primary metric, guardrails, and non-goals. Audit how each field is measured.",
      deliverable: "A metric specification, query, and data-quality note.",
      acceptance:
        "Two analysts can calculate the same metric and explain who is excluded and why.",
    },
    {
      concept: "Experiment design and causal assumptions",
      task: "Draft a test plan with hypothesis, assignment unit, outcome, guardrails, sample-size assumptions, duration, and stopping rule. Identify spillovers and confounders.",
      deliverable:
        "A pre-analysis plan and a diagram of the causal assumptions.",
      acceptance:
        "The plan separates practical significance from statistical uncertainty and names conditions that would invalidate interpretation.",
    },
    {
      concept: "Prediction, calibration, and error cost",
      task: "If prediction is useful, compare a simple baseline and model using time-appropriate validation. Examine calibration, threshold choices, and errors across relevant segments.",
      deliverable:
        "A comparison notebook and a decision table with threshold trade-offs.",
      acceptance:
        "The recommendation explains when the model changes a decision and when it should not be used.",
    },
    {
      concept: "Decision communication and follow-through",
      task: "Write a one-page decision memo with finding, uncertainty, options, recommendation, owner, and a follow-up measurement. Ask a peer to challenge the assumptions.",
      deliverable: "A reviewed memo and an outcome-monitoring plan.",
      acceptance:
        "A non-specialist can state the decision, evidence limits, next action, and how success will be checked.",
    },
  ],
  mlops: [
    {
      concept: "System boundaries and reproducible environments",
      task: "Draw the path from data to prediction. Containerize a small service, lock dependencies, and write a clean-machine setup procedure.",
      deliverable:
        "A lifecycle diagram, container build, and repeatable local run.",
      acceptance:
        "A clean checkout builds and passes a health check without undocumented machine state.",
    },
    {
      concept: "Pipeline lineage and data validation",
      task: "Automate schema/data checks, training, artifact registration, and metric capture. Tie each output to source revision and data version.",
      deliverable:
        "A pipeline run with traceable inputs, code, parameters, model, and evaluation.",
      acceptance:
        "Changing an invalid input blocks promotion and identifies the failing check.",
    },
    {
      concept: "Secure staged delivery",
      task: "Separate environments, remove credentials from code, use least privilege, gate a staged release on quality, and practice rollback.",
      deliverable:
        "A CI/CD workflow, access map, release gate, and rollback demonstration.",
      acceptance:
        "A deliberately failing candidate cannot reach production; rollback restores the previous known-good artifact.",
    },
    {
      concept: "Service objectives and incident learning",
      task: "Instrument availability, latency, errors, quality feedback, and cost proxies. Trigger a simulated incident and follow a runbook.",
      deliverable:
        "A dashboard, alert rules, runbook, and short incident review.",
      acceptance:
        "Alerts identify an actionable symptom, have an owner, and lead to a tested recovery path.",
    },
  ],
  research: [
    {
      concept: "Implementation correctness and mathematical grounding",
      task: "Implement a small known method, derive its expected behavior on a toy case, and compare outputs with a trusted library implementation.",
      deliverable:
        "A minimal implementation, correctness tests, and short derivation.",
      acceptance:
        "Toy cases match expected results within stated numerical tolerance; mismatches are explained rather than hidden.",
    },
    {
      concept: "Reproduction and experimental controls",
      task: "Reproduce one tractable paper result. Record versions, data processing, compute, random seeds, deviations, and run-to-run variance.",
      deliverable: "An executable reproduction and a deviation table.",
      acceptance:
        "Another person can follow the run steps and distinguish reproduced results from results that did not match.",
    },
    {
      concept: "Falsifiable hypothesis and ablations",
      task: "Propose one narrow change, strongest alternative explanation, baseline, ablations, and a result that would reject your hypothesis. Run a compute-bounded pilot.",
      deliverable:
        "A short research plan and pilot report including negative outcomes.",
      acceptance:
        "The evidence can disconfirm the claim; comparisons isolate the proposed change rather than changing many factors at once.",
    },
    {
      concept: "Research communication and review",
      task: "Write methods, results, uncertainty, limitations, and responsible-use considerations. Package code/configs and request peer criticism.",
      deliverable: "A reviewable technical report and reproducibility bundle.",
      acceptance:
        "Claims match the experiments, limitations are prominent, and a reviewer can reproduce the central figure or result.",
    },
  ],
  evaluation: [
    {
      concept: "Use cases, harm boundaries, and risk framing",
      task: "Map users, intended and prohibited uses, affected groups, decision authority, severity, and fallback routes for the system under review.",
      deliverable: "A scoped evaluation brief and prioritized risk register.",
      acceptance:
        "Each high-impact risk is tied to a user, failure mode, consequence, and accountable owner.",
    },
    {
      concept: "Representative test design and annotation",
      task: "Sample normal, edge, ambiguous, and high-impact cases. Write an annotation rubric, expected behavior, provenance notes, and reviewer disagreement process.",
      deliverable:
        "A versioned evaluation set, rubric, and baseline scorecard.",
      acceptance:
        "A second reviewer can apply the rubric; disagreement and sampling blind spots are measured and documented.",
    },
    {
      concept: "Red-team, mitigate, and regress",
      task: "Probe misuse and boundary failures within the allowed test scope. Convert reproducible findings into regression tests, apply mitigations, and rerun the same suite.",
      deliverable:
        "A test corpus, severity-ranked findings, mitigation diffs, and retest results.",
      acceptance:
        "Each fixed finding has a repeatable failing-before/passing-after test; remaining risks are explicitly listed.",
    },
    {
      concept: "Release decision and monitoring",
      task: "Set go/no-go thresholds, escalation owners, post-release signals, incident steps, and residual-risk acceptance conditions.",
      deliverable:
        "A release recommendation with evidence links and a monitoring plan.",
      acceptance:
        "A decision maker can see what passed, what failed, who owns residual risks, and what signal pauses or rolls back release.",
    },
  ],
};

const progressionGuides: Record<
  string,
  { entry: string; next: string; adjacent: string }
> = {
  "ai-engineer": {
    entry:
      "Ship a bounded AI feature with tests, baseline evaluation, and safe failure behavior.",
    next: "Own quality, latency, cost, privacy, and product outcomes across more than one release.",
    adjacent:
      "Applied ML, AI platform, evaluation engineering, or technical product engineering.",
  },
  "ml-engineer": {
    entry:
      "Train and serve a reproducible model with valid evaluation and an inference contract.",
    next: "Own model lifecycle decisions, monitoring, deployment trade-offs, and cross-team technical direction.",
    adjacent: "MLOps, applied science, data science, or AI infrastructure.",
  },
  "data-scientist": {
    entry:
      "Deliver reproducible analysis with a clear metric, uncertainty, and actionable recommendation.",
    next: "Shape measurement strategy, experiment quality, and decisions across a product or business area.",
    adjacent:
      "Decision science, analytics engineering, applied ML, or product strategy.",
  },
  mlops: {
    entry:
      "Automate a model workflow with lineage, quality gates, deployment, and basic observability.",
    next: "Own platform reliability, developer experience, governance, cost, and incident learning across teams.",
    adjacent:
      "AI platform engineering, SRE, data infrastructure, or ML engineering.",
  },
  research: {
    entry:
      "Implement and reproduce a method with controlled experiments and a reviewable report.",
    next: "Set a research agenda, mentor collaborators, and deliver results that survive independent scrutiny.",
    adjacent:
      "Research engineering, applied science, ML engineering, or doctoral research.",
  },
  evaluation: {
    entry:
      "Build repeatable task tests, document failure modes, and validate mitigations.",
    next: "Own risk-based release standards, incident learning, and evaluation strategy across systems.",
    adjacent:
      "AI security, model risk, quality engineering, or responsible AI governance.",
  },
};

const weeklyStudyPlans: Record<string, string[]> = {
  "2-4": [
    "Choose one small concept from the resource shelf.",
    "Apply it to one narrow slice of the selected project.",
    "Record one failure, one result, and the next question.",
  ],
  "4-6": [
    "Study one concept and reproduce a small example.",
    "Build a project slice with a test or baseline.",
    "Review evidence, write a short note, and ask for feedback.",
  ],
  "7-10": [
    "Split study across concepts, implementation, and evaluation.",
    "Reserve a focused block to test edge cases or compare alternatives.",
    "Publish a weekly progress note with the evidence and unresolved risks.",
  ],
  "10+": [
    "Plan a small weekly research/build cycle with a written hypothesis.",
    "Implement and evaluate one meaningful increment; avoid parallel tool-chasing.",
    "Reserve time for review, documentation, feedback, and recovery from blockers.",
  ],
};

const interviewFramework = [
  "Context: who needed what, and what constraint made the problem hard?",
  "Decision: what baseline and alternatives did you consider, and why this approach?",
  "Evidence: what did you measure, on what data, and what changed after review?",
  "Limits: what failed, what risks remain, and what would you do next?",
];

const marketResearchSteps = [
  "Collect a small, dated sample of current postings for one role and one seniority level; treat it as a directional sample, not the whole market.",
  "Separate must-have capabilities from named tools, preferred qualifications, and domain requirements.",
  "Count repeated requirements across the sample and note disagreements by employer, level, and work arrangement.",
  "Compare those requirements with project evidence you already have; choose one gap that can be demonstrated in a build.",
  "Recheck before applying. Job titles, requirements, and availability change; verify details with each employer.",
];

type JobProof = { signal: string; evidence: string };
type RoleJobGuide = {
  positioning: string;
  proof: JobProof[];
  interviewFocus: string[];
};

const roleJobGuides: Record<string, RoleJobGuide> = {
  "ai-engineer": {
    positioning:
      "Show that you can turn a model capability into a reliable product feature, not just write prompts.",
    proof: [
      {
        signal: "End-to-end delivery",
        evidence:
          "A deployed or runnable feature with typed API boundaries, tests, and a clear fallback.",
      },
      {
        signal: "Measured model quality",
        evidence:
          "A fixed test set, baseline comparison, representative failure examples, and a release decision.",
      },
      {
        signal: "Production judgment",
        evidence:
          "Citations or structured output, access/privacy decisions, latency and cost notes, and safe failure behavior.",
      },
    ],
    interviewFocus: [
      "Explain one model feature end to end",
      "Defend evaluation and baseline choices",
      "Debug an unreliable or costly model call",
      "Discuss one safety/privacy failure and mitigation",
    ],
  },
  "ml-engineer": {
    positioning:
      "Show that your model result is reproducible, valid for its deployment setting, and operable after release.",
    proof: [
      {
        signal: "Valid experiment",
        evidence:
          "Split rationale, leakage checks, baseline, metric choice, and error slices.",
      },
      {
        signal: "Shippable artifact",
        evidence:
          "Versioned model and data, typed inference contract, tests, and clean-environment run instructions.",
      },
      {
        signal: "Lifecycle ownership",
        evidence:
          "Serving measurements, drift response, rollback plan, and human review where decisions are consequential.",
      },
    ],
    interviewFocus: [
      "Prevent leakage and choose a deployment-valid split",
      "Select metrics and thresholds from error costs",
      "Trace a model from training to serving",
      "Respond to drift without blind retraining",
    ],
  },
  "data-scientist": {
    positioning:
      "Show that you can turn messy evidence into a decision while explaining uncertainty and assumptions.",
    proof: [
      {
        signal: "Reliable measurement",
        evidence:
          "Reproducible SQL or notebook, metric definitions, data-quality checks, and population boundaries.",
      },
      {
        signal: "Statistical judgment",
        evidence:
          "Baseline, validation or experiment design, uncertainty, and causal limits.",
      },
      {
        signal: "Decision impact",
        evidence:
          "A concise recommendation naming the owner, action, guardrails, and follow-up outcome measure.",
      },
    ],
    interviewFocus: [
      "Design an experiment and explain stopping/guardrails",
      "Separate association from causation",
      "Choose metrics for a decision",
      "Communicate an uncertain result to a stakeholder",
    ],
  },
  mlops: {
    positioning:
      "Show that you make model delivery repeatable, observable, secure, and recoverable.",
    proof: [
      {
        signal: "Reproducible pipeline",
        evidence:
          "Code/data/artifact lineage, validation gates, and a clean rerun.",
      },
      {
        signal: "Safe release",
        evidence:
          "Least privilege, secret handling, staged deployment, and a demonstrated rollback.",
      },
      {
        signal: "Operability",
        evidence:
          "Useful alerts, runbook, incident drill, recovery time notes, and cost/latency signals.",
      },
    ],
    interviewFocus: [
      "Design lineage and promotion gates",
      "Set actionable service/quality alerts",
      "Debug a failed deployment",
      "Walk through rollback and incident learning",
    ],
  },
  research: {
    positioning:
      "Show that you can ask a falsifiable question, reproduce evidence, and communicate limits honestly.",
    proof: [
      {
        signal: "Research foundation",
        evidence:
          "A paper reproduction with deviations, versions, seeds, compute, and variance documented.",
      },
      {
        signal: "Experimental discipline",
        evidence:
          "Hypothesis, baseline, ablations, held-out evaluation, and evidence that could disconfirm the claim.",
      },
      {
        signal: "Research communication",
        evidence:
          "Reviewable code/report, limitations, negative results, and a claim matched to results.",
      },
    ],
    interviewFocus: [
      "Explain one paper and its assumptions",
      "Design an experiment that can falsify your hypothesis",
      "Interpret variance and negative results",
      "Discuss compute/data trade-offs and reproducibility",
    ],
  },
  evaluation: {
    positioning:
      "Show that you can measure model behavior, find consequential failures, and turn evidence into release decisions.",
    proof: [
      {
        signal: "Representative evaluation",
        evidence:
          "Versioned cases, sampling rationale, annotation rubric, and reviewer disagreement analysis.",
      },
      {
        signal: "Failure investigation",
        evidence:
          "Severity-ranked examples, threat model, regression tests, and tested mitigations.",
      },
      {
        signal: "Release readiness",
        evidence:
          "Risk-based thresholds, residual risk, owners, escalation route, and monitoring plan.",
      },
    ],
    interviewFocus: [
      "Design an evaluation set and rubric",
      "Prioritize failures by user impact",
      "Red-team and validate mitigations",
      "Make a release recommendation with residual risks",
    ],
  },
};

const jobApplicationSteps = [
  "Collect current postings for one target title and seniority; record the source and date.",
  "Separate core capabilities from optional tools, domain preferences, and seniority signals.",
  "Map each repeated requirement to a project, test result, or honest gap.",
  "Tailor one résumé/project story with your actual contribution and measured evidence.",
  "Practice one role-specific technical question and one project trade-off explanation.",
];

const storageKey = "fera-ai-career-guide-v1";

const learningAreas = [
  { id: "all", label: "Show the full guide" },
  { id: "skill-projects", label: "Build one AI skill project" },
  { id: "career-roadmap", label: "Career + job roadmap" },
  { id: "paths", label: "Career paths + assessment" },
  { id: "starting", label: "Choose my starting point" },
  { id: "roadmap", label: "Role roadmap" },
  { id: "skills", label: "Skill-gap map" },
  { id: "foundations", label: "Core foundations" },
  { id: "resources", label: "Learning resources" },
  { id: "portfolio", label: "Portfolio + Build Lab" },
  { id: "progression", label: "Career progression" },
  { id: "interview", label: "Interview practice" },
  { id: "job-market", label: "Job-market research" },
  { id: "next", label: "Next steps + mentoring" },
] as const;

export function AICareerGuide() {
  const [selectedId, setSelectedId] = useState(tracks[0].id);
  const [startingPoint, setStartingPoint] = useState<StartingPoint>("new");
  const [completed, setCompleted] = useState<Record<string, string[]>>({});
  const [skillRatings, setSkillRatings] = useState<Record<SkillId, number>>({
    coding: 1,
    statistics: 1,
    data: 1,
    systems: 1,
    research: 1,
    evaluation: 1,
    communication: 1,
  });
  const [careerInterests, setCareerInterests] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState("4-6");
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [projectChecks, setProjectChecks] = useState<Record<string, string[]>>(
    {},
  );
  const [buildStepChecks, setBuildStepChecks] = useState<
    Record<string, string[]>
  >({});
  const [buildReflections, setBuildReflections] = useState<
    Record<string, string>
  >({});
  const [buildFocusStages, setBuildFocusStages] = useState<
    Record<string, number>
  >({});
  const [learningFocus, setLearningFocus] = useState("skill-projects");
  const [selectedSkillModuleId, setSelectedSkillModuleId] = useState("llm");
  const [skillProjectChecks, setSkillProjectChecks] = useState<
    Record<string, number[]>
  >({});
  const [skillProjectNotes, setSkillProjectNotes] = useState<
    Record<string, string>
  >({});
  const [interviewDrafts, setInterviewDrafts] = useState<
    Record<string, string>
  >({});
  const [marketRegion, setMarketRegion] = useState("");
  const [marketNotes, setMarketNotes] = useState("");
  const [marketReviewed, setMarketReviewed] = useState("");
  const [marketSampleSize, setMarketSampleSize] = useState("10");
  const [marketSeniority, setMarketSeniority] = useState("early-career");
  const [shareMessage, setShareMessage] = useState("");
  const [selectedProjectsByTrack, setSelectedProjectsByTrack] = useState<
    Record<string, number>
  >({});
  const [readyToSave, setReadyToSave] = useState(false);
  const track = tracks.find((item) => item.id === selectedId) ?? tracks[0];
  const savedSelectedProject = selectedProjectsByTrack[track.id] ?? 0;
  const selectedProject =
    Number.isInteger(savedSelectedProject) &&
    savedSelectedProject >= 0 &&
    savedSelectedProject < track.projects.length
      ? savedSelectedProject
      : 0;
  const setSelectedProject = (index: number) =>
    setSelectedProjectsByTrack((current) => ({
      ...current,
      [track.id]: Math.min(Math.max(index, 0), track.projects.length - 1),
    }));
  const done = completed[track.id] ?? [];
  const progress = Math.round((done.length / track.phases.length) * 100);
  const recommendedTracks = careerInterests
    .map((id) => tracks.find((item) => item.id === id))
    .filter((item): item is CareerTrack => Boolean(item));
  const currentProject = track.projects[selectedProject] ?? track.projects[0];
  const currentProjectKey = `${track.id}:${currentProject.title}`;
  const currentProjectChecks = projectChecks[currentProjectKey] ?? [];
  const currentBuildSteps =
    currentProject.buildGuide ?? buildLabGuides[track.id];
  const currentBuildSequence = currentBuildSteps.map((step) => ({
    title: step.concept,
    action: step.task,
  }));
  const currentBuildChecks = buildStepChecks[currentProjectKey] ?? [];
  const currentBuildReflection = buildReflections[currentProjectKey] ?? "";
  const ragGuide = tracks[0].projects.find(
    (project) => project.title === "Production RAG support-operations copilot",
  );
  const skillModules: SkillProjectModule[] = skillProjectModules.map(
    (module) =>
      module.id === "rag"
        ? {
            ...module,
            steps: (ragGuide?.buildGuide ?? []).map((step) => ({
              title: step.concept,
              implementation: step.task,
              artifact: step.deliverable,
              acceptance: step.acceptance,
              tradeoff: step.architectureChoice,
            })),
          }
        : module,
  );
  const activeSkillModule =
    skillModules.find((module) => module.id === selectedSkillModuleId) ??
    skillModules[0];
  const activeSkillChecks = skillProjectChecks[activeSkillModule.id] ?? [];
  const activeSkillNotes = skillProjectNotes[activeSkillModule.id] ?? "";
  const activeSkillPhases = activeSkillModule.phases ?? [];
  const flattenedSkillSteps = activeSkillPhases.flatMap((phase) =>
    phase.tasks.map((task, index) => ({
      ...task,
      phaseLevel: phase.level,
      phaseTitle: phase.title,
      phaseIndex: index,
    })),
  );
  const totalSkillSteps = Math.max(flattenedSkillSteps.length, 1);
  const activeSkillProgress = Math.round(
    (activeSkillChecks.length / totalSkillSteps) * 100,
  );
  const nextSkillStepIndex = flattenedSkillSteps.findIndex(
    (_, index) => !activeSkillChecks.includes(index),
  );
  const savedBuildFocus = buildFocusStages[currentProjectKey] ?? -1;
  const currentBuildFocus =
    savedBuildFocus >= 0 && savedBuildFocus < currentBuildSteps.length
      ? savedBuildFocus
      : -1;
  const visibleBuildStages =
    currentBuildFocus === -1
      ? currentBuildSteps.map((step, index) => ({ step, index }))
      : [
          {
            step: currentBuildSteps[currentBuildFocus],
            index: currentBuildFocus,
          },
        ];
  const nextBuildStepIndex = currentBuildSteps.findIndex(
    (_, index) => !currentBuildChecks.includes(String(index)),
  );
  const nextBuildStep =
    nextBuildStepIndex === -1 ? null : currentBuildSteps[nextBuildStepIndex];
  const buildProgress = Math.round(
    (currentBuildChecks.length / currentBuildSteps.length) * 100,
  );
  const trackSkillGaps = skillDimensions
    .map((skill) => ({
      ...skill,
      current: skillRatings[skill.id],
      target: skillTargets[track.id][skill.id],
    }))
    .filter((skill) => skill.current < skill.target)
    .sort(
      (left, right) =>
        right.target - right.current - (left.target - left.current),
    );
  const isLearningAreaVisible = (area: string) => {
    if (learningFocus === "all") return true;
    if (learningFocus === "career-roadmap") return area !== "skill-projects";
    return learningFocus === area;
  };

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          selectedId?: string;
          startingPoint?: StartingPoint;
          completed?: Record<string, string[]>;
          skillRatings?: Record<SkillId, number>;
          careerInterests?: string[];
          weeklyHours?: string;
          assessmentComplete?: boolean;
          projectChecks?: Record<string, string[]>;
          buildStepChecks?: Record<string, string[]>;
          buildReflections?: Record<string, string>;
          buildFocusStages?: Record<string, number>;
          learningFocus?: string;
          selectedProjectsByTrack?: Record<string, number>;
          selectedSkillModuleId?: string;
          skillProjectChecks?: Record<string, number[]>;
          skillProjectNotes?: Record<string, string>;
          interviewDrafts?: Record<string, string>;
          marketRegion?: string;
          marketNotes?: string;
          marketReviewed?: string;
          marketSampleSize?: string;
          marketSeniority?: string;
        };
        const requestedTrack = new URLSearchParams(window.location.search).get(
          "track",
        );
        if (tracks.some((item) => item.id === requestedTrack)) {
          setSelectedId(requestedTrack as string);
        } else if (tracks.some((item) => item.id === parsed.selectedId)) {
          setSelectedId(parsed.selectedId as string);
        }
        if (parsed.startingPoint && parsed.startingPoint in startingAdvice) {
          setStartingPoint(parsed.startingPoint);
        }
        if (parsed.completed && typeof parsed.completed === "object") {
          setCompleted(parsed.completed);
        }
        if (parsed.skillRatings) setSkillRatings(parsed.skillRatings);
        if (Array.isArray(parsed.careerInterests))
          setCareerInterests(parsed.careerInterests);
        if (parsed.weeklyHours) setWeeklyHours(parsed.weeklyHours);
        if (parsed.assessmentComplete) setAssessmentComplete(true);
        if (parsed.projectChecks) setProjectChecks(parsed.projectChecks);
        if (parsed.buildStepChecks) setBuildStepChecks(parsed.buildStepChecks);
        if (parsed.buildReflections)
          setBuildReflections(parsed.buildReflections);
        if (parsed.buildFocusStages)
          setBuildFocusStages(parsed.buildFocusStages);
        const savedLearningFocus =
          parsed.learningFocus === "portfolio"
            ? "skill-projects"
            : parsed.learningFocus === "all"
              ? "career-roadmap"
              : parsed.learningFocus;
        if (
          savedLearningFocus &&
          learningAreas.some((area) => area.id === savedLearningFocus)
        ) {
          setLearningFocus(savedLearningFocus);
        }
        if (parsed.selectedProjectsByTrack)
          setSelectedProjectsByTrack(parsed.selectedProjectsByTrack);
        if (
          parsed.selectedSkillModuleId &&
          skillProjectModules.some(
            (module) => module.id === parsed.selectedSkillModuleId,
          )
        ) {
          setSelectedSkillModuleId(parsed.selectedSkillModuleId);
        }
        if (parsed.skillProjectChecks)
          setSkillProjectChecks(parsed.skillProjectChecks);
        if (parsed.skillProjectNotes)
          setSkillProjectNotes(parsed.skillProjectNotes);
        if (parsed.interviewDrafts) setInterviewDrafts(parsed.interviewDrafts);
        if (typeof parsed.marketRegion === "string")
          setMarketRegion(parsed.marketRegion);
        if (typeof parsed.marketNotes === "string")
          setMarketNotes(parsed.marketNotes);
        if (typeof parsed.marketReviewed === "string")
          setMarketReviewed(parsed.marketReviewed);
        if (typeof parsed.marketSampleSize === "string")
          setMarketSampleSize(parsed.marketSampleSize);
        if (typeof parsed.marketSeniority === "string")
          setMarketSeniority(parsed.marketSeniority);
      } else {
        const requestedTrack = new URLSearchParams(window.location.search).get(
          "track",
        );
        if (tracks.some((item) => item.id === requestedTrack)) {
          setSelectedId(requestedTrack as string);
        }
      }
    } catch {
      // Browser storage can be unavailable in private or restricted contexts.
    }
    setReadyToSave(true);
  }, []);

  useEffect(() => {
    if (!readyToSave) return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          selectedId,
          startingPoint,
          completed,
          skillRatings,
          careerInterests,
          weeklyHours,
          assessmentComplete,
          projectChecks,
          buildStepChecks,
          buildReflections,
          buildFocusStages,
          learningFocus,
          selectedProjectsByTrack,
          selectedSkillModuleId,
          skillProjectChecks,
          skillProjectNotes,
          interviewDrafts,
          marketRegion,
          marketNotes,
          marketReviewed,
          marketSampleSize,
          marketSeniority,
        }),
      );
    } catch {
      // The guide remains usable when browser storage is unavailable.
    }
  }, [
    selectedId,
    startingPoint,
    completed,
    skillRatings,
    careerInterests,
    weeklyHours,
    assessmentComplete,
    projectChecks,
    buildStepChecks,
    buildReflections,
    buildFocusStages,
    learningFocus,
    selectedProjectsByTrack,
    selectedSkillModuleId,
    skillProjectChecks,
    skillProjectNotes,
    interviewDrafts,
    marketRegion,
    marketNotes,
    marketReviewed,
    marketSampleSize,
    marketSeniority,
    readyToSave,
  ]);

  const togglePhase = (phaseTitle: string) => {
    setCompleted((current) => {
      const currentTrack = current[track.id] ?? [];
      const nextTrack = currentTrack.includes(phaseTitle)
        ? currentTrack.filter((item) => item !== phaseTitle)
        : [...currentTrack, phaseTitle];
      return { ...current, [track.id]: nextTrack };
    });
  };

  const toggleInterest = (trackId: string) => {
    setCareerInterests((current) =>
      current.includes(trackId)
        ? current.filter((id) => id !== trackId)
        : current.length < 3
          ? [...current, trackId]
          : current,
    );
  };

  const toggleProjectCheck = (label: string) => {
    setProjectChecks((current) => {
      const checks = current[currentProjectKey] ?? [];
      return {
        ...current,
        [currentProjectKey]: checks.includes(label)
          ? checks.filter((item) => item !== label)
          : [...checks, label],
      };
    });
  };

  const toggleBuildStep = (index: number) => {
    setBuildStepChecks((current) => {
      const checked = current[currentProjectKey] ?? [];
      const stage = String(index);
      return {
        ...current,
        [currentProjectKey]: checked.includes(stage)
          ? checked.filter((item) => item !== stage)
          : [...checked, stage],
      };
    });
  };

  const toggleSkillProjectStep = (index: number) => {
    setSkillProjectChecks((current) => {
      const checked = current[activeSkillModule.id] ?? [];
      return {
        ...current,
        [activeSkillModule.id]: checked.includes(index)
          ? checked.filter((item) => item !== index)
          : [...checked, index],
      };
    });
  };

  const chooseTrack = (trackId: string) => {
    setSelectedId(trackId);
    const url = new URL(window.location.href);
    url.searchParams.set("track", trackId);
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  };

  const shareRoadmap = async () => {
    const url = new URL("/ai-careers", window.location.origin);
    url.searchParams.set("track", track.id);
    const shareData = {
      title: `${track.title} roadmap | Fera AI Solutions`,
      text: `Explore this AI career roadmap: ${track.title}`,
      url: url.toString(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage(
          "Roadmap shared. Your private notes and progress were not included.",
        );
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url.toString());
        setShareMessage(
          "Roadmap link copied. Your private notes and progress were not included.",
        );
      } else {
        setShareMessage(url.toString());
      }
    } catch {
      setShareMessage(url.toString());
    }
  };

  return (
    <div className="career-body">
      <div
        className={`career-focus-bar wrap ${learningFocus === "skill-projects" ? "build-mode" : "career-mode"}`}
        id="career-focus-bar"
      >
        <div>
          <span className="career-overline">Choose your learning mode</span>
          <p aria-live="polite">
            {learningFocus === "skill-projects"
              ? "Build one AI capability through its own focused project."
              : "Explore AI roles, career roadmaps, and job preparation."}
          </p>
        </div>
        <div
          className="career-mode-tabs"
          role="group"
          aria-label="Primary learning mode"
        >
          <button
            type="button"
            className={learningFocus === "skill-projects" ? "active" : ""}
            aria-pressed={learningFocus === "skill-projects"}
            onClick={() => setLearningFocus("skill-projects")}
          >
            Build by project
          </button>
          <button
            type="button"
            className={learningFocus !== "skill-projects" ? "active" : ""}
            aria-pressed={learningFocus !== "skill-projects"}
            onClick={() => setLearningFocus("career-roadmap")}
          >
            Career + job roadmap
          </button>
        </div>
        {learningFocus !== "skill-projects" && (
          <label>
            <span>Focus within career guidance</span>
            <select
              aria-label="Focus within career and job guidance"
              value={learningFocus === "all" ? "career-roadmap" : learningFocus}
              onChange={(event) => setLearningFocus(event.target.value)}
            >
              {learningAreas
                .filter(
                  (area) => area.id !== "all" && area.id !== "skill-projects",
                )
                .map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.label}
                  </option>
                ))}
            </select>
          </label>
        )}
      </div>
      <section
        className="career-section career-skill-projects"
        id="career-skill-projects"
        hidden={!isLearningAreaVisible("skill-projects")}
      >
        <div className="wrap">
          <div className="career-section-heading career-skill-project-heading">
            <div>
              <span className="career-overline">Build one skill at a time</span>
              <h2>Choose a skill. Build its project.</h2>
            </div>
            <p>
              This view contains only the selected skill project. Each step
              tells you what to implement, what to produce, and how to verify it
              before moving on.
            </p>
          </div>
          <label className="career-skill-project-picker">
            <span>AI engineering skill</span>
            <select
              aria-label="Choose one AI skill project"
              value={selectedSkillModuleId}
              onChange={(event) => setSelectedSkillModuleId(event.target.value)}
            >
              {skillModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </label>

          <article className="career-skill-project">
            <div className="career-skill-project-topline">
              <span>SELECTED SKILL / {activeSkillModule.title}</span>
              <span>
                PROJECT{" "}
                {String(skillModules.indexOf(activeSkillModule) + 1).padStart(
                  2,
                  "0",
                )}
              </span>
            </div>
            <h3>{activeSkillModule.project}</h3>
            <p className="career-skill-project-summary">
              {activeSkillModule.summary}
            </p>
            <div className="career-skill-project-scope">
              <div>
                <strong>Project scenario</strong>
                <p>{activeSkillModule.scenario}</p>
              </div>
              <div>
                <strong>Build only this</strong>
                <p>{activeSkillModule.scope}</p>
              </div>
              <div>
                <strong>Keep out of scope</strong>
                <p>{activeSkillModule.notIncluded}</p>
              </div>
            </div>
            <div className="career-skill-tools">
              <span>Tools for this project</span>
              <div>
                {activeSkillModule.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </div>
            <div className="career-skill-progress">
              <div>
                <span>Build checkpoints</span>
                <strong>
                  {activeSkillChecks.length}/{activeSkillModule.steps.length}
                </strong>
              </div>
              <div
                className="career-progress-bar"
                role="progressbar"
                aria-valuenow={activeSkillProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${activeSkillModule.title} project progress`}
              >
                <span style={{ width: `${activeSkillProgress}%` }} />
              </div>
              {nextSkillStepIndex >= 0 && (
                <a href={`#career-skill-step-${nextSkillStepIndex}`}>
                  Next: {activeSkillModule.steps[nextSkillStepIndex].title} ↓
                </a>
              )}
              {activeSkillModule.resource && (
                <a
                  href={activeSkillModule.resource.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {activeSkillModule.resource.label} ↗
                </a>
              )}
            </div>
            <div className="career-skill-steps">
              {activeSkillPhases.map((phase, phaseIndex) => (
                <div
                  className="career-skill-phase"
                  key={`${activeSkillModule.id}-${phase.level}`}
                >
                  <div className="career-skill-phase-header">
                    <span>{phase.level}</span>
                    <h4>{phase.title}</h4>
                    <p>{phase.objective}</p>
                  </div>
                  <div className="career-skill-phase-grid">
                    {phase.tasks.map((step, taskIndex) => {
                      const globalIndex =
                        activeSkillPhases
                          .slice(0, phaseIndex)
                          .reduce(
                            (total, currentPhase) =>
                              total + currentPhase.tasks.length,
                            0,
                          ) + taskIndex;
                      const isChecked = activeSkillChecks.includes(globalIndex);

                      return (
                        <article
                          className={`career-skill-step ${isChecked ? "complete" : ""} ${nextSkillStepIndex === globalIndex ? "next" : ""}`}
                          id={`career-skill-step-${globalIndex}`}
                          key={`${activeSkillModule.id}-${phase.level}-${step.title}`}
                        >
                          <div className="career-skill-step-number">
                            {phase.level.slice(0, 1)}
                            {taskIndex + 1}
                          </div>
                          <div className="career-skill-step-body">
                            <div className="career-skill-step-heading">
                              <h4>{step.title}</h4>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    toggleSkillProjectStep(globalIndex)
                                  }
                                />
                                <span>
                                  {isChecked
                                    ? "Checkpoint complete"
                                    : "Mark complete"}
                                </span>
                              </label>
                            </div>
                            <div className="career-skill-step-grid">
                              <div>
                                <strong>Implement</strong>
                                <p>{step.implementation}</p>
                              </div>
                              <div>
                                <strong>Produce</strong>
                                <p>{step.artifact}</p>
                              </div>
                              <div className="career-skill-acceptance">
                                <strong>Verify before moving on</strong>
                                <p>{step.acceptance}</p>
                              </div>
                              {step.tradeoff && (
                                <div className="career-skill-tradeoff">
                                  <strong>Implementation trade-off</strong>
                                  <p>{step.tradeoff}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <label className="career-skill-build-log">
              <span>Build notes for {activeSkillModule.title}</span>
              <textarea
                rows={4}
                maxLength={4000}
                value={activeSkillNotes}
                onChange={(event) =>
                  setSkillProjectNotes((current) => ({
                    ...current,
                    [activeSkillModule.id]: event.target.value,
                  }))
                }
                placeholder="Record the implementation decision, test result, failure, and next change for this skill project."
              />
              <small>
                Saved privately in this browser for this skill only.
              </small>
            </label>
          </article>
        </div>
      </section>
      <section
        className="career-section career-choice"
        id="choose-a-path"
        hidden={!isLearningAreaVisible("paths")}
      >
        <div className="wrap">
          <div className="career-section-heading">
            <div>
              <span className="career-overline">01 / Pick a direction</span>
              <h2>Six paths. Different kinds of impact.</h2>
            </div>
            <p>
              You do not have to choose forever. Start with the work you want to
              do most days, then build the skills that prove you can do it.
            </p>
          </div>

          <div className="career-track-grid" aria-label="AI career paths">
            {tracks.map((item) => (
              <button
                type="button"
                className={`career-track-option ${selectedId === item.id ? "selected" : ""}`}
                key={item.id}
                aria-pressed={selectedId === item.id}
                onClick={() => chooseTrack(item.id)}
              >
                <span className="career-track-number">{item.number}</span>
                <strong>{item.title}</strong>
                <span className="career-track-family">{item.family}</span>
                <span className="career-track-summary">{item.summary}</span>
                <span className="career-track-select">
                  {selectedId === item.id ? "Selected path" : "View roadmap"}
                </span>
              </button>
            ))}
          </div>
          <div className="career-assessment">
            <div className="career-assessment-heading">
              <div>
                <span className="career-overline">Career-fit check-in</span>
                <h3>What kind of work would you like to do?</h3>
              </div>
              <label className="career-hours-field">
                <span>Study time you can protect each week</span>
                <select
                  value={weeklyHours}
                  onChange={(event) => setWeeklyHours(event.target.value)}
                >
                  <option value="2-4">2-4 hours</option>
                  <option value="4-6">4-6 hours</option>
                  <option value="7-10">7-10 hours</option>
                  <option value="10+">10+ hours</option>
                </select>
              </label>
            </div>
            <p className="career-assessment-intro">
              Pick up to three activities that sound energizing. This creates a
              preference-based starting suggestion, not an aptitude score or
              hiring prediction.
            </p>
            <div className="career-interest-grid">
              {tracks.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`career-interest-option ${careerInterests.includes(item.id) ? "selected" : ""}`}
                  aria-pressed={careerInterests.includes(item.id)}
                  onClick={() => toggleInterest(item.id)}
                >
                  <strong>{item.title}</strong>
                  <span>{item.bestFor}</span>
                </button>
              ))}
            </div>
            <div className="career-assessment-footer">
              <span aria-live="polite">
                {careerInterests.length}/3 interests selected
                {assessmentComplete && ` · ${weeklyHours} hours per week`}
              </span>
              <button
                type="button"
                className="career-tool-button"
                disabled={careerInterests.length === 0}
                onClick={() => setAssessmentComplete(true)}
              >
                Show my starting suggestions
              </button>
            </div>
            {assessmentComplete && recommendedTracks.length > 0 && (
              <div className="career-recommendations" role="status">
                <strong>Your picks, in the order you selected them</strong>
                <p>
                  Use these paths to explore. Your background and weekly time
                  are saved on this device; the suggestions do not rank your
                  employability.
                </p>
                <div>
                  {recommendedTracks.map((item, index) => (
                    <button
                      type="button"
                      key={item.id}
                      className="career-recommendation"
                      onClick={() => chooseTrack(item.id)}
                    >
                      <span>0{index + 1}</span>
                      <strong>{item.title}</strong>
                      <span>Use this roadmap ↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <details className="career-assessment-method">
              <summary>How to interpret these suggestions</summary>
              <p>
                The order reflects your selected work preferences, not a score
                computed from your background. Compare the first two paths by
                reading their daily work, skill gaps, and project evidence; try
                a small task from each before committing.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section
        className="career-section career-starting-point"
        hidden={!isLearningAreaVisible("starting")}
      >
        <div className="wrap career-start-layout">
          <div>
            <span className="career-overline">
              Calibrate your starting point
            </span>
            <h2>Start where you are.</h2>
            <p>
              Choose the description that feels closest. It changes the first
              advice, not your ceiling.
            </p>
          </div>
          <div
            className="career-start-controls"
            aria-label="Current background"
          >
            {(
              [
                ["new", "New to coding"],
                ["software", "I build software"],
                ["data", "I work with data / math"],
              ] as [StartingPoint, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={startingPoint === id ? "active" : ""}
                aria-pressed={startingPoint === id}
                onClick={() => setStartingPoint(id)}
              >
                {label}
              </button>
            ))}
            <p aria-live="polite">{startingAdvice[startingPoint]}</p>
            <div className="career-start-playbook">
              <strong>First move for this background</strong>
              <p>{startingPlaybook[startingPoint].firstMove}</p>
              <strong>Watch for</strong>
              <p>{startingPlaybook[startingPoint].avoid}</p>
              <div>
                <span>First deliverable for {track.title}</span>
                <p>{track.phases[0].build}</p>
                <small>Show: {track.phases[0].evidence}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="career-section career-roadmap"
        aria-live="polite"
        hidden={!isLearningAreaVisible("roadmap")}
      >
        <div className="wrap">
          <div className="career-roadmap-heading">
            <div>
              <span className="career-overline">
                02 / Your selected roadmap
              </span>
              <h2>{track.title}</h2>
              <p>{track.summary}</p>
            </div>
            <div
              className="career-progress"
              aria-label={`${progress}% of roadmap milestones complete`}
            >
              <div className="career-progress-top">
                <span>Milestones checked off</span>
                <strong>{progress}%</strong>
              </div>
              <div
                className="career-progress-bar"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Roadmap progress"
              >
                <span style={{ width: `${progress}%` }} />
              </div>
              <small>Progress is saved on this device.</small>
            </div>
          </div>

          <div className="career-context-grid">
            <div>
              <span>Good fit if</span>
              <p>{track.bestFor}</p>
            </div>
            <div>
              <span>Typical work</span>
              <p>{track.work}</p>
            </div>
            <div>
              <span>Tools to explore</span>
              <div className="career-tool-list">
                {track.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="career-phase-list">
            {track.phases.map((phase, index) => {
              const isDone = done.includes(phase.title);
              return (
                <article
                  className={`career-phase ${isDone ? "complete" : ""}`}
                  key={phase.title}
                >
                  <div className="career-phase-marker">0{index + 1}</div>
                  <div className="career-phase-content">
                    <div className="career-phase-heading">
                      <div>
                        <span className="career-phase-focus">
                          {phase.focus}
                        </span>
                        <h3>{phase.title}</h3>
                      </div>
                      <label className="career-phase-check">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => togglePhase(phase.title)}
                        />
                        <span>{isDone ? "Done" : "Mark done"}</span>
                      </label>
                    </div>
                    <div className="career-phase-columns">
                      <div>
                        <h4>Learn</h4>
                        <ul>
                          {phase.learn.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4>Build</h4>
                        <p>{phase.build}</p>
                        <h4 className="career-evidence-heading">
                          Show your work
                        </h4>
                        <p>{phase.evidence}</p>
                      </div>
                    </div>
                    <div className="career-phase-gate">
                      <strong>Mastery gate</strong>
                      <p>{phaseGates[track.id][index]}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="career-section career-skill-map"
        hidden={!isLearningAreaVisible("skills")}
      >
        <div className="wrap">
          <div className="career-section-heading">
            <div>
              <span className="career-overline">
                Self-assessment / not a test
              </span>
              <h2>Find the next skill gap to close.</h2>
            </div>
            <p>
              Rate what you can do today. Role targets are working guides, not
              hiring bars; change a rating as your evidence grows.
            </p>
          </div>
          <div className="career-skill-map-grid">
            <div className="career-skill-ratings">
              {skillDimensions.map((skill) => (
                <label className="career-skill-row" key={skill.id}>
                  <span>{skill.label}</span>
                  <select
                    value={skillRatings[skill.id]}
                    aria-label={`Your level in ${skill.label}`}
                    onChange={(event) =>
                      setSkillRatings((current) => ({
                        ...current,
                        [skill.id]: Number(event.target.value),
                      }))
                    }
                  >
                    <option value={1}>1 · Learning basics</option>
                    <option value={2}>2 · Can do guided tasks</option>
                    <option value={3}>3 · Work independently</option>
                    <option value={4}>4 · Can explain trade-offs</option>
                  </select>
                  <small>{skillEvidence[skill.id]}</small>
                </label>
              ))}
              <small>Self-ratings are private to this browser.</small>
            </div>
            <div className="career-skill-targets">
              <span className="career-overline">For {track.title}</span>
              <h3>Suggested next areas</h3>
              {trackSkillGaps.length > 0 ? (
                <ol>
                  {trackSkillGaps.slice(0, 4).map((skill) => (
                    <li key={skill.id}>
                      <span>{skill.label}</span>
                      <strong>
                        Level {skill.current} of {skill.target}
                      </strong>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>
                  Your self-ratings meet this guide’s suggested foundation
                  levels. Choose an advanced project and validate that judgment
                  with real work and feedback.
                </p>
              )}
              <p className="career-skill-note">
                Build evidence with projects; a self-rating alone does not
                establish proficiency.
              </p>
              <details className="career-skill-method">
                <summary>How to rate yourself reliably</summary>
                <p>
                  Choose the highest level you can demonstrate more than once
                  without a step-by-step tutorial. Use a repository, experiment
                  report, deployment, or peer review as evidence; lower the
                  rating when an important part still depends on guesswork.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section
        className="career-section career-foundations"
        hidden={!isLearningAreaVisible("foundations")}
      >
        <div className="wrap">
          <div className="career-section-heading">
            <div>
              <span className="career-overline">03 / Skills that travel</span>
              <h2>Build foundations, then specialize.</h2>
            </div>
            <p>
              Strong practitioners know enough of the whole system to spot weak
              assumptions and ask better questions.
            </p>
          </div>
          <div className="career-foundation-grid">
            {foundations.map((item) => (
              <article className="career-foundation" key={item.number}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <details className="career-foundation-deep-dive">
                  <summary>Practice + evidence</summary>
                  <p>
                    <strong>Practice:</strong>{" "}
                    {foundationPractice[item.number].practice}
                  </p>
                  <p>
                    <strong>Evidence:</strong>{" "}
                    {foundationPractice[item.number].evidence}
                  </p>
                </details>
              </article>
            ))}
          </div>
          <div className="career-specializations">
            <span>Possible domain specializations</span>
            <div>
              {[
                "Language & search",
                "Computer vision",
                "Speech & audio",
                "Robotics",
                "Recommendations",
                "AI security",
                "Healthcare",
                "Climate & science",
              ].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p>
              Pick a domain after you have a working foundation. Learn its data,
              users, regulations, and failure costs; a domain-aware engineer is
              more useful than a tool collector.
            </p>
          </div>
        </div>
      </section>

      <section
        className="career-section career-resources"
        hidden={!isLearningAreaVisible("resources")}
      >
        <div className="wrap">
          <div className="career-section-heading">
            <div>
              <span className="career-overline">
                A short, reviewed resource shelf
              </span>
              <h2>Study the next thing you need.</h2>
            </div>
            <p>
              Start with a small selection tied to {track.title.toLowerCase()}.
              Time is an estimate for selected material, not a provider
              guarantee.
            </p>
          </div>
          <div className="career-resource-grid">
            {learningResources[track.id].map((resource) => (
              <article className="career-resource" key={resource.title}>
                <div className="career-resource-meta">
                  <span>{resource.provider}</span>
                  <span>Free resource</span>
                </div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <dl>
                  <div>
                    <dt>Prerequisites</dt>
                    <dd>{resource.prerequisites}</dd>
                  </div>
                  <div>
                    <dt>Effort</dt>
                    <dd>{resource.estimatedEffort}</dd>
                  </div>
                </dl>
                <a href={resource.href} target="_blank" rel="noreferrer">
                  Open source <span aria-hidden="true">↗</span>
                </a>
                <div className="career-resource-application">
                  <strong>Apply it to your path</strong>
                  <p>{track.phases[1].build}</p>
                </div>
                <small>
                  Link checked 26 Sep 2026. Recheck content and terms before
                  planning.
                </small>
              </article>
            ))}
          </div>
          <div className="career-study-plan">
            <div>
              <span className="career-overline">
                Weekly study loop / {weeklyHours} hours
              </span>
              <h3>Turn reading into proof.</h3>
            </div>
            <ol>
              {weeklyStudyPlans[weeklyHours].map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        className="career-section career-projects"
        hidden={!isLearningAreaVisible("portfolio")}
      >
        <div className="wrap">
          <div className="career-section-heading">
            <div>
              <span className="career-overline">
                04 / Make the portfolio count
              </span>
              <h2>Two strong projects beat ten thin demos.</h2>
            </div>
            <p>
              Build for one real user and make your reasoning visible. Choose a
              brief for {track.title.toLowerCase()}.
            </p>
          </div>
          <div className="career-project-grid" hidden={currentBuildFocus >= 0}>
            {track.projects.map((project, index) => (
              <article className="career-project" key={project.title}>
                <span className="career-project-index">
                  PROJECT 0{index + 1}
                </span>
                {project.level && (
                  <span className="career-project-level">{project.level}</span>
                )}
                <h3>{project.title}</h3>
                <p>{project.brief}</p>
                <div>
                  <strong>Credible evidence</strong>
                  <p>{project.proof}</p>
                </div>
              </article>
            ))}
          </div>
          <div
            className="career-build-sequence"
            hidden={currentBuildFocus >= 0}
          >
            <span className="career-overline">
              Advanced execution / {track.title}
            </span>
            <h3>Build the project like a small production engagement.</h3>
            <ol>
              {currentBuildSequence.map((stage) => (
                <li key={stage.title}>
                  <strong>{stage.title}</strong>
                  <span>{stage.action}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="career-build-lab" id="career-build-lab">
            <div className="career-build-lab-heading">
              <div>
                <span className="career-overline">Hands-on learning loop</span>
                <h3>Build Lab: learn by making the work.</h3>
                <p>
                  {currentProject.title}: {currentProject.brief}
                </p>
                {currentProject.level && (
                  <span className="career-project-level">
                    {currentProject.level}
                  </span>
                )}
              </div>
              <div className="career-build-lab-progress">
                <div>
                  <span>Evidence checkpoints</span>
                  <strong>
                    {currentBuildChecks.length}/{currentBuildSteps.length}
                  </strong>
                </div>
                <div
                  className="career-progress-bar"
                  role="progressbar"
                  aria-valuenow={buildProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Build Lab progress"
                >
                  <span style={{ width: `${buildProgress}%` }} />
                </div>
                {nextBuildStepIndex >= 0 ? (
                  <a
                    href={`#career-build-stage-${nextBuildStepIndex}`}
                    onClick={() =>
                      setBuildFocusStages((current) => ({
                        ...current,
                        [currentProjectKey]: nextBuildStepIndex,
                      }))
                    }
                  >
                    Next: {currentBuildSteps[nextBuildStepIndex].concept} ↓
                  </a>
                ) : (
                  <span className="career-build-finished">
                    All checkpoints marked. Review the project and ask for peer
                    feedback.
                  </span>
                )}
                <label className="career-build-project-select">
                  <span>Choose a project</span>
                  <select
                    aria-label="Choose a project to build"
                    value={selectedProject}
                    onChange={(event) =>
                      setSelectedProject(Number(event.target.value))
                    }
                  >
                    {track.projects.map((project, index) => (
                      <option key={project.title} value={index}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="career-build-project-select">
                  <span>Learning view</span>
                  <select
                    aria-label="Choose which build stages are shown"
                    value={currentBuildFocus}
                    onChange={(event) =>
                      setBuildFocusStages((current) => ({
                        ...current,
                        [currentProjectKey]: Number(event.target.value),
                      }))
                    }
                  >
                    <option value={-1}>Show all stages</option>
                    {currentBuildSteps.map((step, index) => (
                      <option key={step.concept} value={index}>
                        Focus: {step.concept}
                      </option>
                    ))}
                  </select>
                </label>
                {currentBuildFocus >= 0 && (
                  <div
                    className="career-build-focus-navigation"
                    aria-live="polite"
                  >
                    <span>
                      Focus mode: stage {currentBuildFocus + 1} of{" "}
                      {currentBuildSteps.length}; other stages are hidden.
                    </span>
                    <div>
                      <button
                        type="button"
                        disabled={currentBuildFocus === 0}
                        aria-label="Show previous build stage"
                        onClick={() =>
                          setBuildFocusStages((current) => ({
                            ...current,
                            [currentProjectKey]: Math.max(
                              0,
                              currentBuildFocus - 1,
                            ),
                          }))
                        }
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={
                          currentBuildFocus === currentBuildSteps.length - 1
                        }
                        aria-label="Show next build stage"
                        onClick={() =>
                          setBuildFocusStages((current) => ({
                            ...current,
                            [currentProjectKey]: Math.min(
                              currentBuildSteps.length - 1,
                              currentBuildFocus + 1,
                            ),
                          }))
                        }
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="career-build-lab-principle">
              <strong>Repeat this loop at every stage</strong>
              <span>
                Study one idea → build a small artifact → test it against the
                acceptance check → write what changed your understanding.
              </span>
            </div>
            {currentProject.architectureChoices && (
              <div
                className="career-architecture-options"
                hidden={currentBuildFocus >= 0}
              >
                <div>
                  <span className="career-overline">
                    Architecture choices / compare with evidence
                  </span>
                  <h4>There is more than one valid way to build RAG.</h4>
                  <p>
                    Use the simplest option that meets access, quality, latency,
                    and operational requirements. Compare options on the same
                    held-out queries before adding complexity.
                  </p>
                </div>
                <div className="career-architecture-grid">
                  {currentProject.architectureChoices.map((choice) => (
                    <article key={choice.decision}>
                      <h5>{choice.decision}</h5>
                      <p>
                        <strong>Starting recommendation</strong>
                        {choice.recommended}
                      </p>
                      <p>
                        <strong>Alternatives and trade-offs</strong>
                        {choice.alternatives}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            )}
            <div className="career-build-stage-list">
              {visibleBuildStages.map(({ step, index }) => {
                const isChecked = currentBuildChecks.includes(String(index));
                return (
                  <article
                    className={`career-build-stage ${isChecked ? "complete" : ""} ${nextBuildStepIndex === index ? "next" : ""}`}
                    id={`career-build-stage-${index}`}
                    key={`${track.id}-${step.concept}`}
                  >
                    <div className="career-build-stage-index">0{index + 1}</div>
                    <div className="career-build-stage-content">
                      <div className="career-build-stage-title">
                        <div>
                          <span>LEARN THIS CONCEPT</span>
                          <h4>{step.concept}</h4>
                        </div>
                        <label>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleBuildStep(index)}
                          />
                          <span>
                            {isChecked
                              ? "Evidence checkpoint done"
                              : "Mark evidence ready"}
                          </span>
                        </label>
                      </div>
                      <div className="career-build-stage-grid">
                        <div>
                          <strong>Build task</strong>
                          <p>{step.task}</p>
                        </div>
                        <div>
                          <strong>Produce</strong>
                          <p>{step.deliverable}</p>
                        </div>
                        <div className="career-build-acceptance">
                          <strong>Acceptance check</strong>
                          <p>{step.acceptance}</p>
                        </div>
                        {step.architectureChoice && (
                          <div className="career-build-architecture-choice">
                            <strong>Ways to approach this</strong>
                            <p>{step.architectureChoice}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <label className="career-build-log">
              <span>Build log / what did you try, observe, and change?</span>
              <textarea
                rows={5}
                maxLength={4000}
                value={currentBuildReflection}
                onChange={(event) =>
                  setBuildReflections((current) => ({
                    ...current,
                    [currentProjectKey]: event.target.value,
                  }))
                }
                placeholder="Record decisions, unexpected behavior, evidence, and the next question. Avoid private or confidential data."
              />
              <small>
                Saved in this browser for this role and project. Your notes are
                not included when you share the roadmap.
              </small>
            </label>
          </div>
          <div className="career-readme" hidden={currentBuildFocus >= 0}>
            <strong>Every project should answer these questions</strong>
            <ul>
              <li>
                Who is it for, what decision or task does it improve, and what
                is deliberately out of scope?
              </li>
              <li>
                What baseline did you compare against, and how did you measure
                quality, latency, and cost?
              </li>
              <li>
                What failed? How does the system handle uncertainty, bad inputs,
                privacy, and misuse?
              </li>
              <li>
                Can another person run it, inspect the evidence, and understand
                your design choices?
              </li>
            </ul>
          </div>
          <div className="career-project-audit" hidden={currentBuildFocus >= 0}>
            <div className="career-audit-heading">
              <div>
                <span className="career-overline">Portfolio quality check</span>
                <h3>Review one project before you publish.</h3>
              </div>
              <label>
                <span>Project brief</span>
                <select
                  value={selectedProject}
                  onChange={(event) =>
                    setSelectedProject(Number(event.target.value))
                  }
                >
                  {track.projects.map((project, index) => (
                    <option key={project.title} value={index}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="career-audit-progress" aria-live="polite">
              {currentProjectChecks.length} of {portfolioRubric.length} review
              points addressed
            </p>
            <div className="career-audit-checklist">
              {portfolioRubric.map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={currentProjectChecks.includes(item)}
                    onChange={() => toggleProjectCheck(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <small>
              Checklist progress is saved on this device; checked items are
              reminders, not a quality certification.
            </small>
          </div>
        </div>
      </section>

      <section
        className="career-section career-launch"
        hidden={!isLearningAreaVisible("progression")}
      >
        <div className="wrap career-launch-layout">
          <div>
            <span className="career-overline">
              05 / Turn skill into opportunity
            </span>
            <h2>Show evidence. Tell a precise story.</h2>
            <p>
              Hiring expectations vary by team and seniority. Use job
              descriptions as a local signal, then tailor your proof to the work
              they actually need.
            </p>
          </div>
          <div className="career-launch-list">
            <div>
              <strong>Search with several titles</strong>
              <p>Start with: {track.jobTitles.join(" · ")}.</p>
            </div>
            <div>
              <strong>Read 15 to 20 current role descriptions</strong>
              <p>
                Track repeated skills, level expectations, domain knowledge, and
                the evidence requested. Ignore tools that appear only once
                unless a target employer requires them.
              </p>
            </div>
            <div>
              <strong>Write outcome-first case studies</strong>
              <p>
                State the problem, your contribution, the baseline, measured
                result, limitations, and what you would improve next.
              </p>
            </div>
            <div>
              <strong>Practice explaining trade-offs</strong>
              <p>
                Be ready to discuss evaluation, data leakage, failure handling,
                privacy, latency, and why you chose this approach over a simpler
                one.
              </p>
            </div>
            <div>
              <strong>Keep a weekly learning loop</strong>
              <p>
                Study one concept, build or test one small thing, write down
                what broke, and get feedback from another person.
              </p>
            </div>
          </div>
          <div className="career-progression">
            <span className="career-overline">
              Progression signals / not a time promise
            </span>
            <h3>What stronger ownership looks like</h3>
            <dl>
              <div>
                <dt>Entry evidence</dt>
                <dd>{progressionGuides[track.id].entry}</dd>
              </div>
              <div>
                <dt>Next-level signal</dt>
                <dd>{progressionGuides[track.id].next}</dd>
              </div>
              <div>
                <dt>Adjacent moves</dt>
                <dd>{progressionGuides[track.id].adjacent}</dd>
              </div>
            </dl>
            <p>
              Progress by increasing scope, reliability, and the quality of your
              decisions, not by collecting tools or relying on a fixed number of
              years.
            </p>
          </div>
        </div>
      </section>

      <section
        className="career-section career-workbench"
        hidden={
          !isLearningAreaVisible("interview") &&
          !isLearningAreaVisible("job-market")
        }
      >
        <div className="wrap">
          <div className="career-section-heading">
            <div>
              <span className="career-overline">
                Personal application workbench
              </span>
              <h2>Turn research into better answers.</h2>
            </div>
            <p>
              Draft privately, compare real listings in your target market, and
              use the recurring evidence to guide your next learning milestone.
            </p>
          </div>
          <div className="career-workbench-grid">
            <section
              className="career-workbench-panel"
              aria-labelledby="career-interview-heading"
              hidden={!isLearningAreaVisible("interview")}
            >
              <span className="career-workbench-label">
                Interview practice / {track.title}
              </span>
              <h3 id="career-interview-heading">
                Practice explaining your decisions.
              </h3>
              <p>
                Use a project you actually built. Include assumptions, evidence,
                trade-offs, and what you would change.
              </p>
              <details className="career-interview-framework">
                <summary>Use this answer structure</summary>
                <ol>
                  {interviewFramework.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </details>
              <div className="career-interview-prompts">
                {interviewPrompts[track.id].map((prompt, index) => {
                  const draftKey = `${track.id}:${index}`;
                  return (
                    <label key={prompt}>
                      <span>
                        0{index + 1} / {prompt}
                      </span>
                      <textarea
                        rows={3}
                        maxLength={1200}
                        value={interviewDrafts[draftKey] ?? ""}
                        onChange={(event) =>
                          setInterviewDrafts((current) => ({
                            ...current,
                            [draftKey]: event.target.value,
                          }))
                        }
                        placeholder="Draft your answer using your own project evidence..."
                      />
                    </label>
                  );
                })}
              </div>
              <div className="career-interview-review">
                <strong>Review each answer for</strong>
                <span>
                  A concrete example, your own contribution, a measurement, one
                  trade-off, and an honest limitation.
                </span>
              </div>
              <small>
                Drafts are stored only in this browser. Do not enter
                confidential information.
              </small>
            </section>

            <section
              className="career-workbench-panel"
              aria-labelledby="career-market-heading"
              hidden={!isLearningAreaVisible("job-market")}
            >
              <span className="career-workbench-label">
                Opportunity research / live search
              </span>
              <h3 id="career-market-heading">
                Check what employers ask for near you.
              </h3>
              <p>
                Search current listings yourself; this guide does not scrape,
                verify, or summarize job posts or salaries.
              </p>
              <div className="career-market-controls">
                <label className="career-workbench-field">
                  <span>Seniority to compare</span>
                  <select
                    value={marketSeniority}
                    onChange={(event) => setMarketSeniority(event.target.value)}
                  >
                    <option value="internship">Internship</option>
                    <option value="entry-level">Entry level</option>
                    <option value="early-career">Early career</option>
                    <option value="mid-level">Mid level</option>
                    <option value="senior">Senior</option>
                  </select>
                </label>
                <label className="career-workbench-field">
                  <span>Listings in your comparison sample</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={marketSampleSize}
                    onChange={(event) =>
                      setMarketSampleSize(event.target.value)
                    }
                  />
                </label>
              </div>
              <label className="career-workbench-field">
                <span>Target city, country, or remote market</span>
                <input
                  type="text"
                  maxLength={100}
                  value={marketRegion}
                  onChange={(event) => setMarketRegion(event.target.value)}
                  placeholder="e.g. Nairobi, Kenya or remote"
                />
              </label>
              <div className="career-market-searches">
                {track.jobTitles.slice(0, 3).map((jobTitle) => {
                  const query = encodeURIComponent(
                    `${jobTitle} jobs ${marketRegion}`,
                  );
                  return (
                    <a
                      key={jobTitle}
                      href={`https://www.google.com/search?q=${query}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Search “{jobTitle}” ↗
                    </a>
                  );
                })}
              </div>
              <details className="career-market-method">
                <summary>Run a careful local market scan</summary>
                <ol>
                  {marketResearchSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </details>
              <label className="career-workbench-field">
                <span>
                  Findings from {marketSampleSize || "your"} {marketSeniority}{" "}
                  listings: repeated skills, level signals, and source links
                </span>
                <textarea
                  rows={5}
                  maxLength={3000}
                  value={marketNotes}
                  onChange={(event) => setMarketNotes(event.target.value)}
                  placeholder="Compare several current postings. Note the date, repeated requirements, seniority, and source URLs."
                />
              </label>
              <label className="career-workbench-field career-review-date">
                <span>Research reviewed on</span>
                <input
                  type="date"
                  value={marketReviewed}
                  onChange={(event) => setMarketReviewed(event.target.value)}
                />
              </label>
              <small>
                Your region and notes stay in this browser. Verify every listing
                and requirement with the employer.
              </small>
            </section>
          </div>
        </div>
      </section>

      <section
        className="career-final-cta"
        hidden={!isLearningAreaVisible("next")}
      >
        <div className="wrap career-cta-layout">
          <div>
            <span className="career-overline">Keep moving</span>
            <h2>Choose one next step. Finish it. Share the evidence.</h2>
            <p>
              Learn independently, or bring your questions to a focused
              mentoring session.
            </p>
            <div className="career-next-deliverables">
              <strong>What to include in your advanced next phase</strong>
              <ul>
                <li>
                  <span>01</span>
                  <p>
                    A working project with a repo, setup steps, and real
                    evidence that it runs from a fresh environment.
                  </p>
                </li>
                <li>
                  <span>02</span>
                  <p>
                    A short architecture note explaining the trade-offs, design
                    decisions, and where the system still has limits.
                  </p>
                </li>
                <li>
                  <span>03</span>
                  <p>
                    A quality review with examples of success, failure, and a
                    concrete measurement such as latency, accuracy, cost, or
                    operator reliability.
                  </p>
                </li>
                <li>
                  <span>04</span>
                  <p>
                    One project story for interviews: problem, contribution,
                    decision, evidence, and what you would improve next.
                  </p>
                </li>
                <li>
                  <span>05</span>
                  <p>
                    A small market or role scan showing what employers expect,
                    what skills are repeated, and the gap you are targeting
                    next.
                  </p>
                </li>
              </ul>
            </div>
            <div className="career-next-advanced-grid">
              <div className="career-next-card">
                <strong>Portfolio evidence bar</strong>
                <ul>
                  <li>Repository with setup instructions and tests</li>
                  <li>Architecture note with trade-offs and constraints</li>
                  <li>Measured result: latency, quality, or cost signal</li>
                  <li>Failure analysis and next improvement plan</li>
                </ul>
              </div>
              <div className="career-next-card">
                <strong>Mentor review questions</strong>
                <ul>
                  <li>
                    What was the real problem and why did this approach win?
                  </li>
                  <li>
                    What failed, what was the limit, and how did you learn?
                  </li>
                  <li>
                    What would you build next to improve evidence quality?
                  </li>
                  <li>
                    Which role does this project best support in the market?
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="career-cta-actions">
            <Link href="/tutorials" className="career-cta-primary">
              Browse tutorials <span aria-hidden="true">↗</span>
            </Link>
            <button
              type="button"
              className="career-share-button"
              onClick={shareRoadmap}
            >
              Share this role path
            </button>
            <button
              type="button"
              className="career-share-button"
              onClick={() => window.print()}
            >
              Print / save roadmap as PDF
            </button>
            <Link
              href="/membership/one-to-one"
              className="career-cta-secondary"
            >
              Explore 1:1 mentoring
            </Link>
            <span
              className="career-share-status"
              role="status"
              aria-live="polite"
            >
              {shareMessage}
            </span>
          </div>
        </div>
      </section>
      <section className="career-print-summary" aria-hidden="true">
        <p>FERA AI SOLUTIONS / CAREER FIELD GUIDE</p>
        <h1>{activeSkillModule.title}</h1>
        <h2>{activeSkillModule.project}</h2>
        <p>{activeSkillModule.summary}</p>
        <ol>
          {activeSkillModule.steps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              <p>
                <strong>Implement:</strong> {step.implementation}
              </p>
              <p>
                <strong>Produce:</strong> {step.artifact}
              </p>
              <p>
                <strong>Verify:</strong> {step.acceptance}
              </p>
              {step.tradeoff && (
                <p>
                  <strong>Trade-off:</strong> {step.tradeoff}
                </p>
              )}
            </li>
          ))}
        </ol>
        <h2>Career roadmap / {track.title}</h2>
        <p>{track.summary}</p>
        <h2>Roadmap</h2>
        <ol>
          {track.phases.map((phase) => (
            <li key={phase.title}>
              <strong>{phase.title}</strong>
              <br />
              {phase.build}
            </li>
          ))}
        </ol>
        <h2>Suggested skill areas to strengthen</h2>
        <ul>
          {(trackSkillGaps.length
            ? trackSkillGaps.slice(0, 4)
            : skillDimensions.slice(0, 4).map((skill) => ({
                ...skill,
                current: skillRatings[skill.id],
                target: skillTargets[track.id][skill.id],
              }))
          ).map((skill) => (
            <li key={skill.id}>
              {skill.label}: self-rated {skill.current}, guide target{" "}
              {skill.target}
            </li>
          ))}
        </ul>
        <h2>Portfolio briefs</h2>
        <ul>
          {track.projects.map((project) => (
            <li key={project.title}>
              <strong>{project.title}:</strong> {project.brief}
            </li>
          ))}
        </ul>
        <h2>Build Lab: {currentProject.title}</h2>
        <p>{currentProject.brief}</p>
        <ol>
          {currentBuildSteps.map((step) => (
            <li key={step.concept}>
              <strong>{step.concept}</strong>
              <p>
                <strong>Build:</strong> {step.task}
              </p>
              <p>
                <strong>Deliver:</strong> {step.deliverable}
              </p>
              <p>
                <strong>Verify:</strong> {step.acceptance}
              </p>
              {step.architectureChoice && (
                <p>
                  <strong>Approach:</strong> {step.architectureChoice}
                </p>
              )}
            </li>
          ))}
        </ol>
        {currentProject.architectureChoices && (
          <>
            <h2>RAG architecture choices</h2>
            <ul>
              {currentProject.architectureChoices.map((choice) => (
                <li key={choice.decision}>
                  <strong>{choice.decision}:</strong> {choice.recommended}{" "}
                  Alternatives: {choice.alternatives}
                </li>
              ))}
            </ul>
          </>
        )}
        <p>
          Personal notes and progress are not included. Targets are guides, not
          hiring criteria.
        </p>
      </section>
      <p className="career-disclaimer wrap" hidden={learningFocus !== "all"}>
        This guide is a practical starting point, not a hiring guarantee. Role
        names and requirements differ across organizations; verify current
        expectations in your target market.
      </p>
    </div>
  );
}
