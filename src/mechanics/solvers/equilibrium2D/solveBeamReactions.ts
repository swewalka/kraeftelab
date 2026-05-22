import type { ProblemDefinition } from "../../model/problemDefinition";
import type { SolverResult } from "./types";
import { getBeamEquationValues } from "./equationBuilder";
import { assertSemanticEquationResiduals, evaluateSemanticEquations } from "../../semantic/equations";

const getReactionLabel = (problem: ProblemDefinition, reactionId: string): string => {
  const reaction = problem.unknownReactions.find((unknownReaction) => unknownReaction.id === reactionId);
  if (!reaction) {
    throw new Error(`Beam reaction solver requires unknown reaction "${reactionId}".`);
  }
  return reaction.label;
};

export const solveBeamReactions = (problem: ProblemDefinition): SolverResult => {
  const config = problem.solverConfig;
  const values = getBeamEquationValues(problem, config);
  const quantities = [
    {
      id: config.horizontalReactionId,
      label: getReactionLabel(problem, config.horizontalReactionId),
      value: values.reactionAx,
      unit: "N" as const,
    },
    {
      id: config.leftVerticalReactionId,
      label: getReactionLabel(problem, config.leftVerticalReactionId),
      value: values.reactionAy,
      unit: "N" as const,
    },
    {
      id: config.rightVerticalReactionId,
      label: getReactionLabel(problem, config.rightVerticalReactionId),
      value: values.reactionBy,
      unit: "N" as const,
    },
  ];
  const semanticEquationEvaluations = evaluateSemanticEquations(problem.semanticEquations, {
    parameters: problem.parameters,
    unknownReactions: problem.unknownReactions,
    forceDecompositions: problem.forceDecompositions,
    quantities,
  });
  assertSemanticEquationResiduals(semanticEquationEvaluations);

  return {
    problemId: problem.id,
    reactions: quantities.map((quantity) => ({
      id: quantity.id,
      label: quantity.label,
      value: quantity.value,
      unit: "N",
    })),
    quantities,
    equations: semanticEquationEvaluations.map((equation) => ({
      id: equation.id,
      symbolic: equation.symbolic,
      residual: equation.residual,
    })),
  };
};
