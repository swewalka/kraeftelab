import type {
  BodyDefinition,
  LoadDefinition,
  ParameterDefinition,
  PointDefinition,
  SupportDefinition,
  UnknownReaction,
} from "./types";

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
  unknownReactions: readonly UnknownReaction[];
  solverConfig?: unknown;
}>;
