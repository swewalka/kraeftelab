import type { ProblemDefinition } from "../model/problemDefinition";
import type { ProblemSolverConfig } from "../model/solverConfig";
import type { ParameterDefinition } from "../model/types";

type JsonRecord = Record<string, unknown>;

type SolverConfigProblemContext = Pick<
  ProblemDefinition,
  "forceDecompositions" | "loads" | "parameters" | "solverKey" | "unknownReactions"
>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const requireRecord = (value: unknown, context: string): JsonRecord => {
  if (!isRecord(value)) {
    throw new Error(`${context} must be an object.`);
  }
  return value;
};

const requireString = (record: JsonRecord, key: string, context: string): string => {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${context}.${key} must be a non-empty string.`);
  }
  return value;
};

const requireParameter = (
  problem: SolverConfigProblemContext,
  parameterId: string,
  unit: ParameterDefinition["unit"],
  context: string,
) => {
  const parameter = problem.parameters.find((candidate) => candidate.id === parameterId);
  if (!parameter) {
    throw new Error(`${context} references missing parameter "${parameterId}".`);
  }
  if (parameter.unit !== unit) {
    throw new Error(`${context} references parameter "${parameterId}" with unit "${parameter.unit}", expected "${unit}".`);
  }
};

const requireId = (ids: ReadonlySet<string>, id: string, context: string) => {
  if (!ids.has(id)) {
    throw new Error(`${context} references missing id "${id}".`);
  }
};

const parseBeamReactionSolverConfig = (
  value: unknown,
  problem: SolverConfigProblemContext,
): ProblemSolverConfig => {
  const record = requireRecord(value, "solverConfig");
  const equationIds = requireRecord(record.equationIds, "solverConfig.equationIds");
  const loadDecompositionId =
    record.loadDecompositionId === undefined
      ? undefined
      : requireString(record, "loadDecompositionId", "solverConfig");
  const parsed = {
    solverKey: "simply-supported-beam-reactions" as const,
    beamLengthParameterId: requireString(record, "beamLengthParameterId", "solverConfig"),
    loadId: requireString(record, "loadId", "solverConfig"),
    loadMagnitudeParameterId: requireString(record, "loadMagnitudeParameterId", "solverConfig"),
    loadPositionParameterId: requireString(record, "loadPositionParameterId", "solverConfig"),
    ...(loadDecompositionId === undefined ? {} : { loadDecompositionId }),
    horizontalReactionId: requireString(record, "horizontalReactionId", "solverConfig"),
    leftVerticalReactionId: requireString(record, "leftVerticalReactionId", "solverConfig"),
    rightVerticalReactionId: requireString(record, "rightVerticalReactionId", "solverConfig"),
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

  const loadIds = new Set(problem.loads.map((load) => load.id));
  const reactionIds = new Set(problem.unknownReactions.map((reaction) => reaction.id));
  const decompositionIds = new Set(problem.forceDecompositions.map((decomposition) => decomposition.id));
  requireParameter(problem, parsed.beamLengthParameterId, "m", "solverConfig.beamLengthParameterId");
  requireParameter(problem, parsed.loadMagnitudeParameterId, "N", "solverConfig.loadMagnitudeParameterId");
  requireParameter(problem, parsed.loadPositionParameterId, "m", "solverConfig.loadPositionParameterId");
  requireId(loadIds, parsed.loadId, "solverConfig.loadId");
  requireId(reactionIds, parsed.horizontalReactionId, "solverConfig.horizontalReactionId");
  requireId(reactionIds, parsed.leftVerticalReactionId, "solverConfig.leftVerticalReactionId");
  requireId(reactionIds, parsed.rightVerticalReactionId, "solverConfig.rightVerticalReactionId");

  if (parsed.loadDecompositionId !== undefined) {
    requireId(decompositionIds, parsed.loadDecompositionId, "solverConfig.loadDecompositionId");
    const decomposition = problem.forceDecompositions.find((candidate) => candidate.id === parsed.loadDecompositionId);
    if (decomposition?.forceId !== parsed.loadId) {
      throw new Error(`solverConfig.loadDecompositionId "${parsed.loadDecompositionId}" does not belong to load "${parsed.loadId}".`);
    }
  }

  return parsed;
};

export const parseSolverConfig = (
  value: unknown,
  problem: SolverConfigProblemContext,
): ProblemSolverConfig => {
  if (problem.solverKey === "simply-supported-beam-reactions") {
    return parseBeamReactionSolverConfig(value, problem);
  }

  throw new Error(`No solver config parser registered for solverKey "${problem.solverKey}".`);
};

export const validateSolverConfigEquationIds = (
  config: ProblemSolverConfig,
  equationIds: ReadonlySet<string>,
) => {
  if (config.solverKey === "simply-supported-beam-reactions") {
    requireId(equationIds, config.equationIds.sumForceX, "solverConfig.equationIds.sumForceX");
    requireId(
      equationIds,
      config.equationIds.sumMomentAboutLeftSupport,
      "solverConfig.equationIds.sumMomentAboutLeftSupport",
    );
    requireId(equationIds, config.equationIds.sumForceY, "solverConfig.equationIds.sumForceY");
  }
};
