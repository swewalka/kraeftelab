import type { Vector2 } from "../core/vector";
import type { ContentBlock } from "../content/types";
import type { CanvasState } from "./canvasState";

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

export type ForceDecompositionComponent = Readonly<{
  id: string;
  axis: "x" | "y";
  sign: "+" | "-";
  factor: string;
  expression: string;
  latex: string;
}>;

export type ForceDecomposition = Readonly<{
  id: string;
  forceId: string;
  magnitudeParameterId: string;
  angleParameterId: string;
  angleReference: "positive-x";
  components: Readonly<{
    x: ForceDecompositionComponent;
    y: ForceDecompositionComponent;
  }>;
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
  unit: "m" | "N" | "deg";
  displayValue: string;
}>;

export type SolverEquation = Readonly<{
  id: string;
  symbolic: string;
  residual?: number;
}>;

export type EquilibriumEquation = Readonly<{
  id: string;
  title: string;
  symbolic: string;
  explanation: readonly ContentBlock[];
}>;

export type SolutionStep = Readonly<{
  id: string;
  title: string;
  body: readonly ContentBlock[];
  equations?: readonly EquilibriumEquation[];
  canvasState?: CanvasState;
}>;
