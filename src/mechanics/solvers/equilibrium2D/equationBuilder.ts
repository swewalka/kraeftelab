import type { ProblemDefinition } from "../../model/problemDefinition";
import type { SolverEquation } from "../../model/types";

export type BeamReactionEquationIds = Readonly<{
  sumForceX: string;
  sumMomentAboutLeftSupport: string;
  sumForceY: string;
}>;

export type BeamEquationInput = Readonly<{
  beamLength: number;
  loadMagnitude: number;
  loadPosition: number;
  horizontalReactionLabel: string;
  leftVerticalReactionLabel: string;
  rightVerticalReactionLabel: string;
  reactionBy: number;
  reactionAy: number;
  equationIds: BeamReactionEquationIds;
}>;

type BeamEquationValueConfig = Readonly<{
  beamLengthParameterId: string;
  loadMagnitudeParameterId: string;
  loadPositionParameterId: string;
  horizontalReactionId: string;
  leftVerticalReactionId: string;
  rightVerticalReactionId: string;
  equationIds: BeamReactionEquationIds;
}>;

const getParameterValue = (problem: ProblemDefinition, parameterId: string): number => {
  const value = problem.parameters.find((parameter) => parameter.id === parameterId)?.value;
  if (value === undefined) {
    throw new Error(`Beam reaction solver requires parameter "${parameterId}".`);
  }
  return value;
};

const getReactionLabel = (problem: ProblemDefinition, reactionId: string): string => {
  const reaction = problem.unknownReactions.find((unknownReaction) => unknownReaction.id === reactionId);
  if (!reaction) {
    throw new Error(`Beam reaction solver requires unknown reaction "${reactionId}".`);
  }
  return reaction.label;
};

export const getBeamEquationValues = (
  problem: ProblemDefinition,
  config: BeamEquationValueConfig,
): BeamEquationInput => {
  const beamLength = getParameterValue(problem, config.beamLengthParameterId);
  const loadMagnitude = getParameterValue(problem, config.loadMagnitudeParameterId);
  const loadPosition = getParameterValue(problem, config.loadPositionParameterId);

  if (beamLength <= 0) {
    throw new Error("Beam reaction solver requires a positive beam length.");
  }

  const reactionBy = (loadMagnitude * loadPosition) / beamLength;
  const reactionAy = loadMagnitude - reactionBy;

  return {
    beamLength,
    loadMagnitude,
    loadPosition,
    horizontalReactionLabel: getReactionLabel(problem, config.horizontalReactionId),
    leftVerticalReactionLabel: getReactionLabel(problem, config.leftVerticalReactionId),
    rightVerticalReactionLabel: getReactionLabel(problem, config.rightVerticalReactionId),
    reactionBy,
    reactionAy,
    equationIds: config.equationIds,
  };
};

export const buildBeamReactionEquations = (input: BeamEquationInput): readonly SolverEquation[] => [
  {
    id: input.equationIds.sumForceX,
    symbolic: "ΣF_x = 0",
    substituted: `${input.horizontalReactionLabel} = 0`,
    solved: `${input.horizontalReactionLabel} = 0 N`,
  },
  {
    id: input.equationIds.sumMomentAboutLeftSupport,
    symbolic: "ΣM_A = 0",
    substituted: `${input.rightVerticalReactionLabel} · ${input.beamLength} m - ${input.loadMagnitude} N · ${input.loadPosition} m = 0`,
    solved: `${input.rightVerticalReactionLabel} = (${input.loadMagnitude} N · ${input.loadPosition} m) / ${input.beamLength} m = ${input.reactionBy} N`,
  },
  {
    id: input.equationIds.sumForceY,
    symbolic: "ΣF_y = 0",
    substituted: `${input.leftVerticalReactionLabel} + ${input.reactionBy} N - ${input.loadMagnitude} N = 0`,
    solved: `${input.leftVerticalReactionLabel} = ${input.loadMagnitude} N - ${input.reactionBy} N = ${input.reactionAy} N`,
  },
];
