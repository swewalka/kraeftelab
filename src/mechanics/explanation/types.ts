import type { EquilibriumEquation } from "../model/types";
import type { ContentBlock } from "../content/types";

export type SolutionStepContent = Readonly<{
  id: string;
  title: string;
  body: readonly ContentBlock[];
  equationIds?: readonly string[];
}>;

export type SolutionContent = Readonly<{
  eyebrow: string;
  title: string;
  resultSummaryTitle: string;
  assumptions: readonly string[];
  equations: readonly Pick<EquilibriumEquation, "id" | "title" | "explanation">[];
  steps: readonly SolutionStepContent[];
}>;
