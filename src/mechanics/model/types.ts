import type { Vector2 } from "../core/vector";

export type PointDefinition = Readonly<{
  id: string;
  label: string;
  x: number;
  y: number;
}>;

export type BodyDefinition = Readonly<{
  id: string;
  label: string;
  kind: "rigidBeam";
  startPointId: string;
  endPointId: string;
}>;

export type SupportKind = "pin" | "roller";

export type SupportDefinition = Readonly<{
  id: string;
  label: string;
  kind: SupportKind;
  pointId: string;
  bodyId: string;
}>;

export type LoadDefinition = Readonly<{
  id: string;
  label: string;
  kind: "pointForce";
  bodyId: string;
  position: PointDefinition;
  vector: Vector2;
  displayMagnitude: string;
}>;

export type UnknownReaction = Readonly<{
  id: string;
  label: string;
  supportId: string;
  component: "x" | "y";
  direction: Vector2;
}>;

export type ParameterDefinition = Readonly<{
  id: string;
  label: string;
  value: number;
  unit: "m" | "N";
  displayValue: string;
}>;

export type EquilibriumEquation = Readonly<{
  id: string;
  title: string;
  symbolic: string;
  substituted: string;
  solved?: string;
  explanation: string;
}>;

export type SolutionStep = Readonly<{
  id: string;
  title: string;
  body: string;
  equations?: readonly EquilibriumEquation[];
}>;
