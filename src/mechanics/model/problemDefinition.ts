import type {
  BodyDefinition,
  LoadDefinition,
  ParameterDefinition,
  PointDefinition,
  SupportDefinition,
  UnknownReaction,
  ForceDecomposition,
} from "./types";
import type { ProblemSolverConfig } from "./solverConfig";

export type ProblemDefinition = Readonly<{
  id: string;
  title: string;
  topic: "statics.equilibrium";
  problemType: string;
  solverKey: string;
  diagramKey: string;
  statement: string;
  parameters: readonly ParameterDefinition[];
  points: readonly PointDefinition[];
  bodies: readonly BodyDefinition[];
  supports: readonly SupportDefinition[];
  loads: readonly LoadDefinition[];
  forceDecompositions: readonly ForceDecomposition[];
  unknownReactions: readonly UnknownReaction[];
  solverConfig: ProblemSolverConfig;
}>;
