import type { ProblemDefinition } from "../../model/problemDefinition";
import type { BeamReactionSolverConfig } from "../../model/solverConfig";
import type { ForceDecomposition, LoadDefinition, SolverEquation } from "../../model/types";
import { resolveForceDecomposition } from "../../core/forceDecomposition";

export type BeamReactionEquationIds = Readonly<{
  sumForceX: string;
  sumMomentAboutLeftSupport: string;
  sumForceY: string;
}>;

export type BeamEquationInput = Readonly<{
  beamLength: number;
  loadMagnitude: number;
  loadPosition: number;
  loadAngleDegrees?: number;
  horizontalLoad: number;
  verticalLoadMagnitude: number;
  horizontalReactionLabel: string;
  leftVerticalReactionLabel: string;
  rightVerticalReactionLabel: string;
  reactionAx: number;
  reactionBy: number;
  reactionAy: number;
  equationIds: BeamReactionEquationIds;
}>;

const getParameterValue = (problem: ProblemDefinition, parameterId: string): number => {
  const value = problem.parameters.find((parameter) => parameter.id === parameterId)?.value;
  if (value === undefined) {
    throw new Error(`Beam reaction solver requires parameter "${parameterId}".`);
  }
  return value;
};

const getLoad = (problem: ProblemDefinition, loadId: string): LoadDefinition => {
  const load = problem.loads.find((candidate) => candidate.id === loadId);
  if (!load) {
    throw new Error(`Beam reaction solver requires load "${loadId}".`);
  }
  return load;
};

const getForceDecomposition = (problem: ProblemDefinition, decompositionId: string): ForceDecomposition => {
  const decomposition = problem.forceDecompositions.find((candidate) => candidate.id === decompositionId);
  if (!decomposition) {
    throw new Error(`Beam reaction solver requires force decomposition "${decompositionId}".`);
  }
  return decomposition;
};

const getReactionLabel = (problem: ProblemDefinition, reactionId: string): string => {
  const reaction = problem.unknownReactions.find((unknownReaction) => unknownReaction.id === reactionId);
  if (!reaction) {
    throw new Error(`Beam reaction solver requires unknown reaction "${reactionId}".`);
  }
  return reaction.label;
};

const unit = (name: "N" | "m") => `\\,\\mathrm{${name}}`;

const formatNumber = (value: number): string => Number.parseFloat(value.toFixed(3)).toString();

export const getBeamEquationValues = (
  problem: ProblemDefinition,
  config: BeamReactionSolverConfig,
): BeamEquationInput => {
  const beamLength = getParameterValue(problem, config.beamLengthParameterId);
  const loadMagnitude = getParameterValue(problem, config.loadMagnitudeParameterId);
  const loadPosition = getParameterValue(problem, config.loadPositionParameterId);
  const load = getLoad(problem, config.loadId);
  const resolvedDecomposition =
    config.loadDecompositionId === undefined
      ? undefined
      : resolveForceDecomposition(getForceDecomposition(problem, config.loadDecompositionId), problem.parameters);
  const loadAngleDegrees = resolvedDecomposition?.angleDegrees;

  if (beamLength <= 0) {
    throw new Error("Beam reaction solver requires a positive beam length.");
  }

  if (loadPosition < 0 || loadPosition > beamLength) {
    throw new Error("Beam reaction solver requires the load position to lie on the beam span.");
  }

  const horizontalLoad = resolvedDecomposition?.components.x ?? load.vector.x;
  const verticalLoadMagnitude = Math.abs(resolvedDecomposition?.components.y ?? load.vector.y);
  const reactionAx = -horizontalLoad;
  const reactionBy = (verticalLoadMagnitude * loadPosition) / beamLength;
  const reactionAy = verticalLoadMagnitude - reactionBy;

  return {
    beamLength,
    loadMagnitude,
    loadPosition,
    ...(loadAngleDegrees === undefined ? {} : { loadAngleDegrees }),
    horizontalLoad,
    verticalLoadMagnitude,
    horizontalReactionLabel: getReactionLabel(problem, config.horizontalReactionId),
    leftVerticalReactionLabel: getReactionLabel(problem, config.leftVerticalReactionId),
    rightVerticalReactionLabel: getReactionLabel(problem, config.rightVerticalReactionId),
    reactionAx,
    reactionBy,
    reactionAy,
    equationIds: config.equationIds,
  };
};

export const buildBeamReactionEquations = (input: BeamEquationInput): readonly SolverEquation[] => {
  if (input.loadAngleDegrees !== undefined) {
    const verticalLoad = formatNumber(input.verticalLoadMagnitude);
    const horizontalLoad = formatNumber(input.horizontalLoad);
    const reactionAx = formatNumber(input.reactionAx);
    const reactionAy = formatNumber(input.reactionAy);
    const reactionBy = formatNumber(input.reactionBy);

    return [
      {
        id: input.equationIds.sumForceX,
        symbolic: "\\sum F_x = 0",
        substituted: `${input.horizontalReactionLabel} + ${input.loadMagnitude}${unit("N")} \\cos(${input.loadAngleDegrees}^{\\circ}) = 0`,
        solved: `${input.horizontalReactionLabel} = -${horizontalLoad}${unit("N")} = ${reactionAx}${unit("N")}`,
      },
      {
        id: input.equationIds.sumMomentAboutLeftSupport,
        symbolic: "\\sum M_A = 0",
        substituted: `${input.rightVerticalReactionLabel} \\cdot ${input.beamLength}${unit("m")} - ${input.loadMagnitude}${unit("N")} \\sin(${input.loadAngleDegrees}^{\\circ}) \\cdot ${input.loadPosition}${unit("m")} = 0`,
        solved: `${input.rightVerticalReactionLabel} = \\frac{${verticalLoad}${unit("N")} \\cdot ${input.loadPosition}${unit("m")}}{${input.beamLength}${unit("m")}} = ${reactionBy}${unit("N")}`,
      },
      {
        id: input.equationIds.sumForceY,
        symbolic: "\\sum F_y = 0",
        substituted: `${input.leftVerticalReactionLabel} + ${reactionBy}${unit("N")} - ${verticalLoad}${unit("N")} = 0`,
        solved: `${input.leftVerticalReactionLabel} = ${verticalLoad}${unit("N")} - ${reactionBy}${unit("N")} = ${reactionAy}${unit("N")}`,
      },
    ];
  }

  return [
    {
      id: input.equationIds.sumForceX,
      symbolic: "\\sum F_x = 0",
      substituted: `${input.horizontalReactionLabel} = 0`,
      solved: `${input.horizontalReactionLabel} = 0${unit("N")}`,
    },
    {
      id: input.equationIds.sumMomentAboutLeftSupport,
      symbolic: "\\sum M_A = 0",
      substituted: `${input.rightVerticalReactionLabel} \\cdot ${input.beamLength}${unit("m")} - ${input.loadMagnitude}${unit("N")} \\cdot ${input.loadPosition}${unit("m")} = 0`,
      solved: `${input.rightVerticalReactionLabel} = \\frac{${input.loadMagnitude}${unit("N")} \\cdot ${input.loadPosition}${unit("m")}}{${input.beamLength}${unit("m")}} = ${input.reactionBy}${unit("N")}`,
    },
    {
      id: input.equationIds.sumForceY,
      symbolic: "\\sum F_y = 0",
      substituted: `${input.leftVerticalReactionLabel} + ${input.reactionBy}${unit("N")} - ${input.loadMagnitude}${unit("N")} = 0`,
      solved: `${input.leftVerticalReactionLabel} = ${input.loadMagnitude}${unit("N")} - ${input.reactionBy}${unit("N")} = ${input.reactionAy}${unit("N")}`,
    },
  ];
};
