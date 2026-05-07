import type { EquilibriumEquation } from "../../model/types";

export type ReactionResult = Readonly<{
  id: string;
  label: string;
  value: number;
  unit: "N";
}>;

export type SolverResult = Readonly<{
  problemId: string;
  reactions: readonly ReactionResult[];
  equations: readonly EquilibriumEquation[];
  assumptions: readonly string[];
}>;
