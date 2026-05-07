import type { ProblemDefinition } from "../../model/problemDefinition";
import type { SolverResult } from "./types";
import {
  buildBeamReactionEquations,
  getBeamEquationValues,
  type BeamReactionEquationIds,
} from "./equationBuilder";

type JsonRecord = Record<string, unknown>;

type BeamReactionSolverConfig = Readonly<{
  beamLengthParameterId: string;
  loadMagnitudeParameterId: string;
  loadPositionParameterId: string;
  horizontalReactionId: string;
  leftVerticalReactionId: string;
  rightVerticalReactionId: string;
  equationIds: BeamReactionEquationIds;
}>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const requireString = (record: JsonRecord, key: string, context: string): string => {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${context}.${key} must be a non-empty string.`);
  }
  return value;
};

const parseBeamReactionSolverConfig = (value: unknown): BeamReactionSolverConfig => {
  if (!isRecord(value)) {
    throw new Error("Beam reaction solver requires solverConfig.");
  }

  const equationIds = value.equationIds;
  if (!isRecord(equationIds)) {
    throw new Error("Beam reaction solver requires solverConfig.equationIds.");
  }

  return {
    beamLengthParameterId: requireString(value, "beamLengthParameterId", "solverConfig"),
    loadMagnitudeParameterId: requireString(value, "loadMagnitudeParameterId", "solverConfig"),
    loadPositionParameterId: requireString(value, "loadPositionParameterId", "solverConfig"),
    horizontalReactionId: requireString(value, "horizontalReactionId", "solverConfig"),
    leftVerticalReactionId: requireString(value, "leftVerticalReactionId", "solverConfig"),
    rightVerticalReactionId: requireString(value, "rightVerticalReactionId", "solverConfig"),
    equationIds: {
      sumForceX: requireString(equationIds, "sumForceX", "solverConfig.equationIds"),
      sumMomentAboutLeftSupport: requireString(
        equationIds,
        "sumMomentAboutLeftSupport",
        "solverConfig.equationIds",
      ),
      sumForceY: requireString(equationIds, "sumForceY", "solverConfig.equationIds"),
    },
  };
};

const getReactionLabel = (problem: ProblemDefinition, reactionId: string): string => {
  const reaction = problem.unknownReactions.find((unknownReaction) => unknownReaction.id === reactionId);
  if (!reaction) {
    throw new Error(`Beam reaction solver requires unknown reaction "${reactionId}".`);
  }
  return reaction.label;
};

export const solveBeamReactions = (problem: ProblemDefinition): SolverResult => {
  const config = parseBeamReactionSolverConfig(problem.solverConfig);
  const values = getBeamEquationValues(problem, config);

  return {
    problemId: problem.id,
    reactions: [
      {
        id: config.horizontalReactionId,
        label: getReactionLabel(problem, config.horizontalReactionId),
        value: 0,
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
