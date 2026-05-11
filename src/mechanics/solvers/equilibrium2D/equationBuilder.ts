import type { ProblemDefinition } from "../../model/problemDefinition";
import type { BeamReactionSolverConfig } from "../../model/solverConfig";
import type { ForceDecomposition, LoadDefinition, ParameterDefinition, SolverEquation } from "../../model/types";
import { resolveForceDecomposition } from "../../core/forceDecomposition";

export type BeamReactionEquationIds = Readonly<{
  sumForceX: string;
  sumMomentAboutLeftSupport: string;
  sumForceY: string;
}>;

export type BeamEquationInput = Readonly<{
  beamLengthLabel: string;
  loadMagnitudeLabel: string;
  loadPositionLabel: string;
  horizontalLoadLatex?: string;
  verticalLoadLatex?: string;
  horizontalReactionLabel: string;
  leftVerticalReactionLabel: string;
  rightVerticalReactionLabel: string;
  reactionAx: number;
  reactionBy: number;
  reactionAy: number;
  equationIds: BeamReactionEquationIds;
}>;

const getParameter = (problem: ProblemDefinition, parameterId: string): ParameterDefinition => {
  const parameter = problem.parameters.find((candidate) => candidate.id === parameterId);
  if (!parameter) {
    throw new Error(`Beam reaction solver requires parameter "${parameterId}".`);
  }
  return parameter;
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

export const getBeamEquationValues = (
  problem: ProblemDefinition,
  config: BeamReactionSolverConfig,
): BeamEquationInput => {
  const beamLengthParameter = getParameter(problem, config.beamLengthParameterId);
  const loadMagnitudeParameter = getParameter(problem, config.loadMagnitudeParameterId);
  const loadPositionParameter = getParameter(problem, config.loadPositionParameterId);
  const load = getLoad(problem, config.loadId);
  const forceDecomposition =
    config.loadDecompositionId === undefined ? undefined : getForceDecomposition(problem, config.loadDecompositionId);
  const resolvedDecomposition =
    forceDecomposition === undefined ? undefined : resolveForceDecomposition(forceDecomposition, problem.parameters);

  if (beamLengthParameter.value <= 0) {
    throw new Error("Beam reaction solver requires a positive beam length.");
  }

  if (loadPositionParameter.value < 0 || loadPositionParameter.value > beamLengthParameter.value) {
    throw new Error("Beam reaction solver requires the load position to lie on the beam span.");
  }

  const horizontalLoad = resolvedDecomposition?.components.x ?? load.vector.x;
  const verticalLoadMagnitude = Math.abs(resolvedDecomposition?.components.y ?? load.vector.y);
  const reactionAx = -horizontalLoad;
  const reactionBy = (verticalLoadMagnitude * loadPositionParameter.value) / beamLengthParameter.value;
  const reactionAy = verticalLoadMagnitude - reactionBy;

  return {
    beamLengthLabel: beamLengthParameter.label,
    loadMagnitudeLabel: loadMagnitudeParameter.label,
    loadPositionLabel: loadPositionParameter.label,
    ...(forceDecomposition === undefined
      ? {}
      : {
          horizontalLoadLatex: forceDecomposition.components.x.latex,
          verticalLoadLatex: forceDecomposition.components.y.latex,
        }),
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
  if (input.horizontalLoadLatex !== undefined && input.verticalLoadLatex !== undefined) {
    const horizontalLoad = input.horizontalLoadLatex ?? input.loadMagnitudeLabel;
    const verticalLoad = input.verticalLoadLatex ?? input.loadMagnitudeLabel;

    return [
      {
        id: input.equationIds.sumForceX,
        symbolic: `${input.horizontalReactionLabel} + ${horizontalLoad} = 0`,
      },
      {
        id: input.equationIds.sumMomentAboutLeftSupport,
        symbolic: `${input.rightVerticalReactionLabel} \\cdot ${input.beamLengthLabel} - ${verticalLoad} \\cdot ${input.loadPositionLabel} = 0`,
      },
      {
        id: input.equationIds.sumForceY,
        symbolic: `${input.leftVerticalReactionLabel} + ${input.rightVerticalReactionLabel} - ${verticalLoad} = 0`,
      },
    ];
  }

  return [
    {
      id: input.equationIds.sumForceX,
      symbolic: `${input.horizontalReactionLabel} = 0`,
    },
    {
      id: input.equationIds.sumMomentAboutLeftSupport,
      symbolic: `${input.rightVerticalReactionLabel} \\cdot ${input.beamLengthLabel} - ${input.loadMagnitudeLabel} \\cdot ${input.loadPositionLabel} = 0`,
    },
    {
      id: input.equationIds.sumForceY,
      symbolic: `${input.leftVerticalReactionLabel} + ${input.rightVerticalReactionLabel} - ${input.loadMagnitudeLabel} = 0`,
    },
  ];
};
