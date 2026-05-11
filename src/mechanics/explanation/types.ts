import type { EquilibriumEquation } from "../model/types";
import type { ContentBlock } from "../content/types";
import type { CanvasState } from "../model/canvasState";

export type SolutionStepContent = Readonly<{
  id: string;
  title: string;
  body: readonly ContentBlock[];
  equationIds?: readonly string[];
  canvasState?: CanvasState;
}>;

export type SolutionContent = Readonly<{
  eyebrow: string;
  title: string;
  assumptions: readonly string[];
  equations: readonly Pick<EquilibriumEquation, "id" | "title" | "explanation">[];
  steps: readonly SolutionStepContent[];
}>;
