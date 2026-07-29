// ─── Tools Barrel Export ──────────────────────────────
// Combines all tool definitions from domain modules into a single array.
import type { ToolOption } from "../types";
import { frontendTools } from "./frontend";
import { frontendExtraTools } from "./frontend-extra";
import { backendTools } from "./backend";
import { backendExtraTools } from "./backend-extra";
import { dataLayerTools } from "./data-layer";
import { databaseExtraTools } from "./database-extra";
import { infraTools } from "./infra";
import { addonTools } from "./addon-tools";

export const tools: ToolOption[] = [
  ...frontendTools,
  ...frontendExtraTools,
  ...backendTools,
  ...backendExtraTools,
  ...dataLayerTools,
  ...databaseExtraTools,
  ...infraTools,
  ...addonTools,
];
