export type SkillProjectStep = {
  title: string;
  implementation: string;
  artifact: string;
  acceptance: string;
  tradeoff?: string;
};

export type SkillProjectPhase = {
  level: "Basics" | "Intermediate" | "Advanced";
  title: string;
  objective: string;
  tasks: SkillProjectStep[];
};

export type SkillProjectModule = {
  id: string;
  title: string;
  project: string;
  summary: string;
  scenario: string;
  scope: string;
  notIncluded: string;
  tools: string[];
  steps: SkillProjectStep[];
  phases?: SkillProjectPhase[];
  resource?: { label: string; href: string };
};

const splitIntoThreeLevels = (
  steps: SkillProjectStep[],
): SkillProjectPhase[] => {
  const phaseLabels = [
    {
      level: "Basics" as const,
      title: "Build the foundation",
      objective: "Learn the core workflow without extra complexity.",
    },
    {
      level: "Intermediate" as const,
      title: "Connect the system",
      objective: "Turn the working idea into a reliable, testable flow.",
    },
    {
      level: "Advanced" as const,
      title: "Hardening and proof",
      objective: "Improve reliability, evidence, and production judgment.",
    },
  ];

  const templates: Record<string, SkillProjectStep[]> = {
    Basics: [
      {
        title: "Define the problem and scope",
        implementation:
          "Write the goal, constraints, user scenario, and the minimum valuable output for this project.",
        artifact:
          "A short plan with success conditions and clear boundaries around what the project should not do.",
        acceptance:
          "You can explain the exact problem, the target user, and the simplest successful outcome.",
      },
      {
        title: "Build a working first version",
        implementation:
          "Create the first end-to-end path with a small input, one core capability, and a visible output.",
        artifact:
          "A runnable prototype or local demo that proves the idea works in a controlled setting.",
        acceptance:
          "The core feature works once without missing pieces or hidden assumptions.",
      },
      {
        title: "Test the result against the user need",
        implementation:
          "Run a small evaluation, capture failure points, and record what still feels weak or uncertain.",
        artifact:
          "A short review with examples of success, failure, and the next fix you want to make.",
        acceptance:
          "You can explain what is working, what is not, and why the next level matters.",
      },
    ],
    Intermediate: [
      {
        title: "Turn the prototype into a reliable flow",
        implementation:
          "Add validation, edge-case handling, and tests that cover the main user journey and failure scenarios.",
        artifact:
          "A more dependable workflow with clear error handling and a repeatable test path.",
        acceptance:
          "The project behaves predictably when inputs vary or the system is stressed in a realistic way.",
      },
      {
        title: "Connect the system pieces",
        implementation:
          "Add the data path, model or retrieval step, and any tool boundary needed to reach the real outcome.",
        artifact:
          "A connected system with defined inputs and outputs, not just a single demo script.",
        acceptance:
          "You can describe the pipeline clearly and explain where the number one risk still sits.",
      },
      {
        title: "Measure the signal and the trade-off",
        implementation:
          "Compare baseline and improved behavior, measure cost or latency, and document the decision you made.",
        artifact:
          "A concise results table or review note showing what got better, what did not, and why.",
        acceptance:
          "The decision is backed by evidence and not just by intuition or a single happy example.",
      },
    ],
    Advanced: [
      {
        title: "Harden the system",
        implementation:
          "Add failure handling, access boundaries, safe defaults, and a clear cleanup or rollback plan when things go wrong.",
        artifact:
          "A hardened version of the project with operational guardrails and documented limits.",
        acceptance:
          "You can explain how the system behaves when the provider, tool, or input fails in a real way.",
      },
      {
        title: "Evaluate and improve with evidence",
        implementation:
          "Run a stronger test set, inspect edge cases, and make one or two targeted improvements based on real outcomes.",
        artifact:
          "A quality review with evidence, regressions, and a release recommendation.",
        acceptance:
          "The final project is judged by studied proof, not by a single successful demo.",
      },
      {
        title: "Explain the decisions and limits",
        implementation:
          "Write a short architecture note and a trade-off summary that covers cost, speed, safety, and what you would do next.",
        artifact:
          "A polished project summary that is clear enough for a technical reviewer or hiring manager to understand.",
        acceptance:
          "You can clearly state what works, what remains uncertain, and what the next evidence should answer.",
      },
    ],
  };

  const stepGroups = Array.from({ length: 3 }, (_, index) => {
    const start = Math.floor((index * steps.length) / 3);
    const end = Math.floor(((index + 1) * steps.length) / 3);
    return steps.slice(start, end);
  });

  return phaseLabels.map((phase, index) => {
    const tasks = stepGroups[index]?.length
      ? stepGroups[index]
      : templates[phase.level];
    return {
      ...phase,
      tasks,
    };
  });
};

const rawSkillProjectModules = [
  {
    id: "llm",
    title: "LLM application fundamentals",
    project: "Support-ticket triage and reply drafter",
    summary:
      "Build one dependable feature around a hosted or local language model, with a strict output contract and a human review before any reply is sent.",
    scenario:
      "A support team receives short tickets and needs a suggested category, urgency, and draft reply. The tool assists the agent; it never sends messages or changes customer records.",
    scope:
      "One request/response endpoint, a fixed ticket schema, a model adapter, validated structured output, and a small test set.",
    notIncluded:
      "No autonomous sending, customer database integration, RAG, agent loop, or fine-tuning. Keep this project about the LLM call and its contract.",
    tools: [
      "Python or TypeScript",
      "one model API",
      "JSON Schema or typed validation",
      "unit tests",
      "environment variables",
    ],
    steps: [
      {
        title: "Define the contract before the prompt",
        implementation:
          "Create 20 synthetic tickets. Define an output schema with category enum, urgency enum, short rationale, and reply draft. Decide which fields may be uncertain and what invalid/unsafe requests should return. Write a deterministic keyword baseline for category first.",
        artifact:
          "Ticket fixtures, versioned output schema, baseline classifier, and a short product boundary document.",
        acceptance:
          "The baseline runs locally; schema rejects unknown categories, missing required fields, and oversized output; no real customer data or secrets are committed.",
      },
      {
        title: "Add one provider behind an adapter",
        implementation:
          "Create a `generateTicketSuggestion(input, config)` boundary. Put the API key in an environment variable, set request timeout and output-token limits, and keep provider-specific request/response mapping inside the adapter. Do not leak the key or raw ticket into logs.",
        artifact:
          "A small model adapter with typed input/output and a mock implementation for tests.",
        acceptance:
          "Tests run with the mock and no key; missing credentials and provider timeouts produce a safe, actionable error rather than crashing the application.",
      },
      {
        title: "Constrain generation and validate twice",
        implementation:
          "Send only the ticket fields the feature needs. Ask for the defined structured response, parse it, validate against the schema, and reject or repair only through a bounded retry. Keep the original ticket and generated draft separate; never treat model text as a command.",
        artifact:
          "Prompt/template version, structured model response path, validation errors, and human-review UI or CLI output.",
        acceptance:
          "Malformed JSON, invalid enum values, empty replies, and prompt-injection text in the ticket cannot bypass output validation or trigger an external action.",
      },
      {
        title: "Measure usefulness, latency, and cost",
        implementation:
          "Run the same held-out fixtures through the keyword baseline and model. Record category accuracy, urgency errors, schema-valid rate, latency, and estimated cost per ticket. Review false urgent labels and inappropriate reply drafts manually.",
        artifact:
          "A reproducible evaluation script, comparison table, error examples, and a release note with limitations.",
        acceptance:
          "You can explain where the model beats the baseline, where it fails, and why a support agent must approve every draft.",
      },
    ],
  },
  {
    id: "rag",
    title: "Retrieval-augmented generation (RAG)",
    project: "Production RAG support-operations copilot",
    summary:
      "Build a source-grounded knowledge assistant with versioned documents, permission filters, citations, abstention, evaluation, and operational safeguards.",
    scenario:
      "Use a fictional support organization with product manuals, approved troubleshooting runbooks, and policies. Agents ask questions; the system returns cited evidence or routes the case to a person.",
    scope:
      "Document ingestion, lexical and vector retrieval baselines, access metadata, answer generation, evaluation, and a safe demo.",
    notIncluded:
      "No unrestricted company-wide corpus, autonomous account changes, or claims that prompt text alone enforces authorization.",
    tools: [
      "Python or TypeScript",
      "PostgreSQL + pgvector or equivalent",
      "embedding model",
      "LLM API",
      "evaluation set",
      "synthetic/public documents",
    ],
    steps: [],
    resource: {
      label: "Google Machine Learning Crash Course",
      href: "https://developers.google.com/machine-learning/crash-course",
    },
  },
  {
    id: "mcp",
    title: "Model Context Protocol (MCP)",
    project: "Read-only support-runbook MCP server and test client",
    summary:
      "Implement a small MCP server, discover its capabilities from a client, call typed tools, and prove the protocol boundary works without involving an LLM first.",
    scenario:
      "A support engineer needs safe, read-only access to approved runbook search and product-status data through any compatible MCP host.",
    scope:
      "A TypeScript server over STDIO with two bounded tools, a minimal client or Inspector test, explicit schemas, error results, and clean lifecycle handling.",
    notIncluded:
      "No arbitrary shell/filesystem tool, write operations, long-running agent, secrets in source control, or production HTTP deployment in the first iteration.",
    tools: [
      "Node.js 20+",
      "TypeScript",
      "official MCP TypeScript SDK",
      "Zod",
      "MCP Inspector or a test client",
    ],
    resource: {
      label: "Official MCP server build guide",
      href: "https://modelcontextprotocol.io/docs/develop/build-server",
    },
    steps: [
      {
        title: "Design the capability boundary",
        implementation:
          "Create a tiny synthetic runbook set. Specify two read-only tools: `search_runbooks(query, product, limit)` and `get_runbook_section(document_id, section_id)`. Define max query length, allowed product IDs, result limits, and what data the server must never expose.",
        artifact:
          "A tool contract table with names, descriptions, JSON input schemas, outputs, validation rules, and misuse cases.",
        acceptance:
          "Each tool has one narrow job, bounded inputs, a stable output shape, and no hidden write or arbitrary command capability.",
      },
      {
        title: "Implement a typed MCP server",
        implementation:
          "Create the server with the official SDK and Zod input schemas. Implement deterministic search over the local fixtures first; return structured text with source IDs and clear no-result/error outcomes. Keep transport protocol data separate from domain functions.",
        artifact:
          "A runnable server, domain functions that can be unit-tested without MCP, and schema-validation tests.",
        acceptance:
          "Valid calls return predictable results; invalid enums, negative limits, malformed IDs, and empty queries are rejected before domain logic runs.",
      },
      {
        title: "Connect and discover through MCP",
        implementation:
          "Run the server over STDIO. Initialize a client session, request the advertised tool list, inspect names/descriptions/schemas, call both tools, and close the session cleanly. Use MCP Inspector or a minimal SDK client to capture the request/response flow.",
        artifact:
          "A connection test or short client script showing initialize, list-tools, call-tool, result handling, and shutdown.",
        acceptance:
          "The client discovers tools from the server instead of duplicating their definitions, calls them with valid arguments, and handles `isError` results without losing the session.",
      },
      {
        title: "Harden transport and tool behavior",
        implementation:
          "Add timeout and cancellation behavior, safe error messages, input/result size limits, and tests for unexpected fixture data. For STDIO, send diagnostics only to stderr; never write logs to stdout because it carries protocol messages. Treat returned documents as untrusted content for any later model use.",
        artifact:
          "Adversarial and transport tests, a troubleshooting note, and a minimal host configuration with an absolute server path.",
        acceptance:
          "No stdout logging corrupts the protocol; tool failures are distinguishable from empty results; the server exposes only the two documented read-only capabilities.",
      },
    ],
  },
  {
    id: "tool-calling",
    title: "LLM tool/function calling",
    project: "Human-approved refund proposal assistant",
    summary:
      "Let an LLM request narrowly typed operations while keeping authorization, business rules, and irreversible execution in ordinary application code.",
    scenario:
      "A support agent asks for a refund recommendation. The assistant may look up an order and prepare a refund proposal, but a human must approve it before any payment action.",
    scope:
      "Two read-only tools, one draft-only action, schema validation, an approval UI, and a fake payment adapter.",
    notIncluded:
      "No real payments, model-controlled permissions, arbitrary SQL, unrestricted network access, or automatic approval.",
    tools: [
      "TypeScript or Python",
      "LLM tool-calling API",
      "schema validator",
      "mock order store",
      "unit and integration tests",
    ],
    steps: [
      {
        title: "Write the action policy",
        implementation:
          "Define allowed operations, role permissions, refund limits, required evidence, and cases requiring escalation. Make a deterministic policy function that can approve or reject a proposed draft without an LLM.",
        artifact:
          "A short policy table and tested rule function with boundary examples.",
        acceptance:
          "The same inputs always produce the same policy result; the model cannot raise a limit or grant a permission.",
      },
      {
        title: "Expose the smallest typed tools",
        implementation:
          "Register `lookup_order(order_id)` and `draft_refund(order_id, amount, reason)` with strict schemas. The second tool stores a pending proposal only; it does not call a payment provider. Validate IDs, currency, amount bounds, and duplicate requests server-side.",
        artifact:
          "Tool definitions, handlers, and tests for malformed, unauthorized, duplicate, and out-of-range inputs.",
        acceptance:
          "Unknown tool names and invalid arguments fail closed; draft creation has an idempotency key and produces no financial side effect.",
      },
      {
        title: "Handle the complete tool-call loop",
        implementation:
          "Send tool schemas with the user request, parse the model's tool request, validate it, execute only the allow-listed handler, and return the tool result to the model for explanation. Add a maximum call count and stop on policy denial or tool error.",
        artifact:
          "A traceable orchestration function and test cases for no-tool, one-tool, multi-step, and failed-tool responses.",
        acceptance:
          "The model cannot skip validation, invoke an undeclared handler, or loop without a fixed call budget.",
      },
      {
        title: "Require explicit human approval",
        implementation:
          "Render the proposal with order evidence, amount, policy result, and reason. Require an authenticated user to approve or reject it; only the approval handler may call the fake payment adapter. Log who approved and the proposal ID without logging unnecessary personal data.",
        artifact:
          "Approval screen/CLI flow, audit record, fake executor, and end-to-end test.",
        acceptance:
          "No model response alone executes the refund; duplicate approvals do not repeat an action; rejected/expired proposals cannot be executed.",
      },
    ],
  },
  {
    id: "prompt-output",
    title: "Prompt design + structured outputs",
    project: "Policy-aware incident report extractor",
    summary:
      "Turn free-text reports into validated structured records while making ambiguity and missing evidence explicit.",
    scenario:
      "An operations team triages short incident reports and needs a consistent draft record for human review, not an automatically filed or prioritized incident.",
    scope:
      "Prompt versioning, structured output schema, representative fixtures, validation, and comparison across prompt/model changes.",
    notIncluded:
      "No RAG, agent loop, autonomous severity escalation, or reliance on a prompt as a security boundary.",
    tools: [
      "Python or TypeScript",
      "LLM API",
      "JSON Schema/Zod/Pydantic",
      "fixture dataset",
      "unit tests",
    ],
    steps: [
      {
        title: "Specify the output and uncertainty",
        implementation:
          "Define fields such as summary, affected service, observed time, impact, evidence quotes, missing fields, and `needs_human_review`. Use enums where possible and explicit nulls for unknowns. Write 25 synthetic reports with expected fields.",
        artifact:
          "Versioned schema, examples, and fixture set that includes ambiguous and contradictory reports.",
        acceptance:
          "Every field has a meaning, unknown is distinct from false, and the schema can represent uncertainty without inventing data.",
      },
      {
        title: "Create a prompt that preserves evidence",
        implementation:
          "Separate system instructions from untrusted report text. Ask for exact evidence spans for extracted facts; instruct the model to mark missing/ambiguous data rather than infer it. Keep prompt templates versioned and inputs length-bounded.",
        artifact:
          "Prompt template v1, test harness, and a set of expected evidence spans.",
        acceptance:
          "Instructions embedded inside a report are treated as data; each filled field can be traced to source text or is marked uncertain.",
      },
      {
        title: "Parse, validate, and recover safely",
        implementation:
          "Request schema-constrained output where supported, parse as untrusted input, validate every field and evidence span, and allow at most one bounded repair attempt. Return validation errors to the reviewer rather than silently dropping them.",
        artifact:
          "Typed parser, validation/error display, and tests for invalid JSON and semantically unsupported values.",
        acceptance:
          "Malformed, oversized, extra-field, and evidence-mismatch outputs never enter the downstream record store.",
      },
      {
        title: "Run controlled prompt experiments",
        implementation:
          "Compare prompt versions on the same held-out fixture set. Measure field-level exact/acceptable match, unsupported-field rate, evidence-span precision, schema-valid rate, latency, and cost. Inspect errors by report type.",
        artifact:
          "Prompt comparison table, regression set, and decision note on which prompt should ship.",
        acceptance:
          "A prompt is not selected from a few hand-picked examples; changes that improve average results but harm critical fields are visible.",
      },
    ],
  },
  {
    id: "evaluation",
    title: "LLM evaluation",
    project: "Regression harness for an AI support assistant",
    summary:
      "Build a repeatable evaluation loop that can explain what improved, what regressed, and which failures block release.",
    scenario:
      "A team updates a prompt or model for a support-answer assistant and needs evidence before deploying the change.",
    scope:
      "Versioned test cases, deterministic checks, human-reviewed rubric, slice reports, and a release gate.",
    notIncluded:
      "No single aggregate score as proof of safety, no uncalibrated LLM judge as ground truth, and no production user data in the demo set.",
    tools: [
      "Python",
      "JSONL/CSV fixtures",
      "pytest or equivalent",
      "metrics notebook/report",
      "human review rubric",
    ],
    steps: [
      {
        title: "Define tasks and failure severity",
        implementation:
          "Choose one bounded task. Label each fixture for expected answerability, expected source or answer, critical facts, policy constraints, and severity if wrong. Include answerable, unanswerable, ambiguous, adversarial, and edge cases.",
        artifact:
          "A versioned evaluation dataset, label guide, and a data-provenance note.",
        acceptance:
          "A second reviewer can apply the labels; critical cases are deliberately represented and their limitations are documented.",
      },
      {
        title: "Build a deterministic runner",
        implementation:
          "Create a runner that loads a fixed model/prompt configuration, invokes the system, captures structured outputs, and stores run ID, code version, latency, and error status. Keep secrets out of records.",
        artifact:
          "A CLI/test command that produces one machine-readable result per fixture and can be repeated.",
        acceptance:
          "A rerun uses the same fixture IDs/config and makes missing, timed-out, and failed cases visible rather than omitting them.",
      },
      {
        title: "Measure dimensions separately",
        implementation:
          "Report schema validity, task correctness, citation/evidence support, abstention behavior, critical policy violations, latency, and cost separately. Add subgroup/slice views and inspect disagreements with a human rubric.",
        artifact:
          "A scorecard with per-case errors, slice summaries, human adjudication notes, and a baseline comparison.",
        acceptance:
          "The report never collapses high-severity failures into a reassuring mean; automated judging is checked against human judgments.",
      },
      {
        title: "Gate changes and retain regressions",
        implementation:
          "Set task-specific release thresholds and hard blockers. Add every confirmed regression as a fixture. Compare a candidate against the pinned baseline and record the decision, owner, and unresolved risk.",
        artifact:
          "A CI-ready release check and a short model/prompt change review template.",
        acceptance:
          "A candidate that violates a hard safety/quality gate fails; passing tests do not imply the system is universally safe.",
      },
    ],
  },
  {
    id: "agents",
    title: "Bounded agent workflows",
    project: "Incident-triage research assistant with a hard action budget",
    summary:
      "Build a small multi-step loop that plans and uses a few read-only tools, while application code enforces budgets, permissions, and stop conditions.",
    scenario:
      "An on-call engineer asks for a summary of an incident. The assistant can inspect approved runbooks and service-status fixtures, but cannot change production systems.",
    scope:
      "One bounded task, an allow-listed tool set, explicit state machine, maximum steps, trace log, and human handoff.",
    notIncluded:
      "No open-ended autonomous operation, write access, arbitrary code execution, or loop that trusts the model to decide its own limits.",
    tools: [
      "Python or TypeScript",
      "LLM tool calling",
      "3 read-only tools",
      "structured state",
      "evaluation fixtures",
    ],
    steps: [
      {
        title: "Define when the workflow should stop",
        implementation:
          "Write start conditions, required evidence, stop states, escalation conditions, maximum model turns, maximum tool calls, and a wall-clock timeout. Draw the state transitions before implementing the loop.",
        artifact:
          "A state diagram and a policy table for continue, answer, ask a question, and hand off.",
        acceptance:
          "Every path terminates within a fixed budget; uncertainty and tool failure have explicit non-success states.",
      },
      {
        title: "Implement a bounded tool surface",
        implementation:
          "Add only `search_runbook`, `read_service_status`, and `summarize_recent_events` over synthetic data. Validate arguments and result sizes; return source IDs and timestamps. Keep all tools read-only.",
        artifact:
          "Three schema-validated handlers with direct unit tests and permission checks.",
        acceptance:
          "There is no write-capable tool, invalid arguments fail closed, and results preserve provenance needed for review.",
      },
      {
        title: "Add a controlled orchestration loop",
        implementation:
          "Represent each turn explicitly: model proposes a tool call, application checks allow-list/budget, tool runs, result is appended as untrusted data, then the loop either continues or stops. Treat tool output as untrusted; never execute instructions found inside it.",
        artifact:
          "Orchestrator with a trace record for each decision, tool call, result, budget decrement, and stop reason.",
        acceptance:
          "Tests prove max-step enforcement, no undeclared tool execution, safe handling of tool errors, and a deterministic handoff when the budget is exhausted.",
      },
      {
        title: "Evaluate usefulness and failure behavior",
        implementation:
          "Test answerable incidents, missing runbooks, conflicting timestamps, prompt injection in logs, tool timeout, and excessive tool-call attempts. Compare with a one-shot summary baseline and review traces.",
        artifact:
          "A fixture suite, trace review, quality report, and human escalation demo.",
        acceptance:
          "The workflow improves evidence gathering on the target cases without exceeding limits or presenting unsupported conclusions as facts.",
      },
    ],
  },
  {
    id: "production",
    title: "Production LLM reliability",
    project: "Observable, cost-bounded model gateway",
    summary:
      "Wrap a model dependency in a dependable service boundary with timeouts, rate controls, privacy-aware telemetry, and a deterministic fallback.",
    scenario:
      "A small product already calls an LLM, but the team needs to understand outages, latency, token spend, and safe degraded behavior.",
    scope:
      "One endpoint, provider adapter, request limits, timeout/retry policy, telemetry, a fallback, and a failure drill.",
    notIncluded:
      "No multi-provider abstraction framework, full enterprise platform, raw prompt logging, or retries that amplify provider outages.",
    tools: [
      "TypeScript or Python",
      "HTTP service",
      "one LLM API",
      "structured logs/metrics",
      "mock provider",
      "load/failure tests",
    ],
    steps: [
      {
        title: "Define service objectives and budgets",
        implementation:
          "Set request-size and output-token limits, target latency, max cost per task, timeout, concurrency, and error budget. Define a deterministic fallback and which requests should be rejected early.",
        artifact: "An SLO/budget note and a request policy table.",
        acceptance:
          "Limits are explicit, enforced before provider calls where possible, and tied to user impact rather than arbitrary defaults.",
      },
      {
        title: "Build the provider boundary",
        implementation:
          "Create a typed adapter with timeout, cancellation, bounded retry for transient errors only, exponential backoff with jitter, and rate-limit handling. Use a mock provider in tests. Never retry validation, permission, or policy failures.",
        artifact:
          "Provider adapter, retry classification, request IDs, and deterministic fallback behavior.",
        acceptance:
          "Tests cover timeout, 429, 5xx, malformed response, cancellation, and exhausted retries without duplicate side effects.",
      },
      {
        title: "Instrument without collecting too much",
        implementation:
          "Record request ID, model/version, latency, tokens/cost estimate, status category, fallback usage, and evaluation flags. Redact or omit raw prompts and personal data; document retention and access.",
        artifact:
          "Structured telemetry schema, dashboard or report, and a privacy note.",
        acceptance:
          "An operator can diagnose availability and cost changes without reading sensitive user content.",
      },
      {
        title: "Prove graceful degradation",
        implementation:
          "Inject provider outage, slow response, rate limiting, and malformed output. Run a small load test, observe queue/concurrency behavior, then document rollback and incident actions.",
        artifact:
          "Failure-drill report, tested fallback, and operations runbook.",
        acceptance:
          "The service stays within resource limits, degrades clearly, recovers without retry storms, and can be rolled back by another engineer.",
      },
    ],
  },
];

export const skillProjectModules: SkillProjectModule[] =
  rawSkillProjectModules.map((module) => ({
    ...module,
    phases: splitIntoThreeLevels(module.steps),
  }));
