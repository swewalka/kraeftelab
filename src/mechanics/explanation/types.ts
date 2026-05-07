import type { EquilibriumEquation } from "../model/types";

export type SolutionStepContent = Readonly<{
  id: string;
  title: string;
  body: string;
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
