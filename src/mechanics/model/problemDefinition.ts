import type {
  BodyDefinition,
  CoordinateSystemDefinition,
  ForceActionDefinition,
  LoadDefinition,
  ParameterDefinition,
  PointDefinition,
  FreeBodyScopeDefinition,
  JointDefinition,
  QuantityDefinition,
  RopeDefinition,
  SupportDefinition,
  UnknownReaction,
  ForceDecomposition,
} from "./types";
import type { ProblemSolverConfig } from "./solverConfig";
import type { SemanticEquation } from "../semantic/types";

export type ProblemDefinition = Readonly<{
  id: string;
  title: string;
  topic: "statics.equilibrium";
  problemType: string;
  solverKey: string;
  diagramKey: string;
  statement: string;
  coordinateSystem: CoordinateSystemDefinition;
  parameters: readonly ParameterDefinition[];
  points: readonly PointDefinition[];
  bodies: readonly BodyDefinition[];
  supports: readonly SupportDefinition[];
  loads: readonly LoadDefinition[];
  forceDecompositions: readonly ForceDecomposition[];
  quantities: readonly QuantityDefinition[];
  freeBodyScopes: readonly FreeBodyScopeDefinition[];
  joints: readonly JointDefinition[];
  ropes: readonly RopeDefinition[];
  forceActions: readonly ForceActionDefinition[];
  unknownReactions: readonly UnknownReaction[];
  semanticEquations: readonly SemanticEquation[];
  solverConfig: ProblemSolverConfig;
}>;
