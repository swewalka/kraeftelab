import type { SolverEquation } from "../../model/types";
import type { SemanticQuantityValue } from "../../semantic/types";

export type ReactionResult = Readonly<{
  id: string;
  label: string;
  value: number;
  unit: "N";
}>;

export type SolverResult = Readonly<{
  problemId: string;
  reactions: readonly ReactionResult[];
  quantities: readonly SemanticQuantityValue[];
  equations: readonly SolverEquation[];
}>;
