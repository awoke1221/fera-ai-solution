// ─── Tools Barrel Export ──────────────────────────────
// Combines all tool definitions from domain modules into a single array.
import type { ToolOption } from "../types";
import { frontendTools } from "./frontend";
import { backendTools } from "./backend";
import { dataLayerTools } from "./data-layer";
import { infraTools } from "./infra";

export const tools: ToolOption[] = [
  ...frontendTools,
  ...backendTools,
  ...dataLayerTools,
  ...infraTools,
];
