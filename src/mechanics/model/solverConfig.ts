import type { BeamReactionEquationIds } from "../solvers/equilibrium2D/equationBuilder";

export type BeamReactionSolverConfig = Readonly<{
  solverKey: "simply-supported-beam-reactions";
  beamLengthParameterId: string;
  loadId: string;
  loadMagnitudeParameterId: string;
  loadPositionParameterId: string;
  loadDecompositionId?: string;
  horizontalReactionId: string;
  leftVerticalReactionId: string;
  rightVerticalReactionId: string;
  equationIds: BeamReactionEquationIds;
}>;

export type ProblemSolverConfig = BeamReactionSolverConfig;
