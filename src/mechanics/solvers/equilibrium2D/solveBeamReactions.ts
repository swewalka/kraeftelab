import type { ProblemDefinition } from "../../model/problemDefinition";
import type { SolverResult } from "./types";
import { buildBeamReactionEquations, getBeamEquationValues } from "./equationBuilder";

export const solveBeamReactions = (problem: ProblemDefinition): SolverResult => {
  const values = getBeamEquationValues(problem);

  return {
    problemId: problem.id,
    reactions: [
      { id: "reactionAx", label: "A_x", value: 0, unit: "N" },
      { id: "reactionAy", label: "A_y", value: values.reactionAy, unit: "N" },
      { id: "reactionBy", label: "B_y", value: values.reactionBy, unit: "N" },
    ],
    equations: buildBeamReactionEquations(values),
    assumptions: [
      "Beam self-weight is neglected.",
      "Supports are ideal: A is a pin and B is a roller.",
      "Positive y is upward and counterclockwise moments are positive.",
    ],
  };
};
