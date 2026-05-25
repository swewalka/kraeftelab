import type { Vector2 } from "../core/vector";
import type { ContentBlock } from "../content/types";
import type { CanvasState } from "./canvasState";

export type PointDefinition = Readonly<{
  id: string;
  label: string;
  x: number;
  y: number;
}>;

export type CoordinateSystemDefinition = Readonly<{
  positiveX: "right";
  positiveY: "up";
  positiveMoment: "counterclockwise";
  angleUnit: "deg";
}>;

export const defaultCoordinateSystem: CoordinateSystemDefinition = {
  positiveX: "right",
  positiveY: "up",
  positiveMoment: "counterclockwise",
  angleUnit: "deg",
};

export type RigidBeamBodyDefinition = Readonly<{
  id: string;
  label: string;
  kind: "rigidBeam";
  startPointId: string;
  endPointId: string;
}>;

export type BodyGeometryReference =
  | Readonly<{ kind: "lineSegment"; startPointId: string; endPointId: string }>
  | Readonly<{ kind: "polyline"; pointIds: readonly string[] }>
  | Readonly<{ kind: "disc"; centerPointId: string; radius?: number; radiusParameterId?: string }>;

export type RigidBodyDefinition = Readonly<{
  id: string;
  label: string;
  kind: "rigidBody";
  geometry: BodyGeometryReference;
}>;

export type BodyDefinition = RigidBeamBodyDefinition | RigidBodyDefinition;

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
  angleReference: "positive-x" | "negative-x" | "positive-y" | "negative-y" | "authored-line-of-action";
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

export type MechanicsUnit = "dimensionless" | "m" | "N" | "N*m" | "deg";

export type ParameterDefinition = Readonly<{
  id: string;
  label: string;
  value: number;
  unit: MechanicsUnit;
  displayValue: string;
}>;

export type QuantityDefinition = Readonly<{
  id: string;
  label: string;
  unit: MechanicsUnit;
  role: "unknown" | "known" | "derived";
  value?: number;
}>;

export type FreeBodyScopeDefinition =
  | Readonly<{ id: string; label: string; kind: "wholeSystem" }>
  | Readonly<{ id: string; label: string; kind: "body"; bodyId: string }>
  | Readonly<{ id: string; label: string; kind: "bodyGroup"; bodyIds: readonly string[] }>;

export type JointDefinition = Readonly<{
  id: string;
  label: string;
  kind: "hinge";
  pointId: string;
  bodyIds: readonly string[];
  quantityIds: readonly string[];
}>;

export type RopeDefinition = Readonly<{
  id: string;
  label: string;
  kind: "rope";
  pointIds: readonly string[];
  bodyIds: readonly string[];
  quantityId: string;
}>;

export type ForceLineOfAction =
  | Readonly<{ kind: "vector"; direction: Vector2 }>
  | Readonly<{ kind: "betweenPoints"; startPointId: string; endPointId: string }>;

export type ForceActionKind =
  | "supportReaction"
  | "pointLoad"
  | "hingeReaction"
  | "ropeTension"
  | "beltContact"
  | "rodForce"
  | "weight"
  | "appliedCouple";

export type ForceActionDefinition = Readonly<{
  id: string;
  label: string;
  kind: ForceActionKind;
  ownership: "external" | "internal";
  bodyId?: string;
  pointId?: string;
  quantityId?: string;
  loadId?: string;
  supportId?: string;
  jointId?: string;
  ropeId?: string;
  component?: "x" | "y";
  lineOfAction?: ForceLineOfAction;
  oppositeActionId?: string;
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
