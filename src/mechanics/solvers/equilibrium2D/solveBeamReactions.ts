import type { ProblemDefinition } from "../../model/problemDefinition";
import type { SolverResult } from "./types";
import { buildBeamReactionEquations, getBeamEquationValues } from "./equationBuilder";

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

  return {
    problemId: problem.id,
    reactions: [
      {
        id: config.horizontalReactionId,
        label: getReactionLabel(problem, config.horizontalReactionId),
        value: values.reactionAx,
        unit: "N",
      },
      {
        id: config.leftVerticalReactionId,
        label: getReactionLabel(problem, config.leftVerticalReactionId),
        value: values.reactionAy,
        unit: "N",
      },
      {
        id: config.rightVerticalReactionId,
        label: getReactionLabel(problem, config.rightVerticalReactionId),
        value: values.reactionBy,
        unit: "N",
      },
    ],
    equations: buildBeamReactionEquations(values),
  };
};
