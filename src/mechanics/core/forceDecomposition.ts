import type { Vector2 } from "./vector";
import type { ForceDecomposition, ParameterDefinition } from "../model/types";

export type ResolvedForceDecomposition = Readonly<{
  id: string;
  forceId: string;
  magnitude: number;
  angleDegrees: number;
  components: Readonly<{
    x: number;
    y: number;
  }>;
}>;

const degreesToRadians = (degrees: number): number => degrees * Math.PI / 180;

const signMultiplier = (sign: "+" | "-"): number => sign === "+" ? 1 : -1;

const getParameter = (
  parameters: readonly ParameterDefinition[],
  parameterId: string,
  expectedUnit: ParameterDefinition["unit"],
  context: string,
): ParameterDefinition => {
  const parameter = parameters.find((candidate) => candidate.id === parameterId);
  if (!parameter) {
    throw new Error(`${context} references missing parameter "${parameterId}".`);
  }
  if (parameter.unit !== expectedUnit) {
    throw new Error(`${context} requires parameter "${parameterId}" to use unit "${expectedUnit}".`);
  }
  return parameter;
};

const evaluateTrigFactor = (factor: string, angleDegrees: number, context: string): number => {
  const normalized = factor.replaceAll(" ", "").toLowerCase();
  if (normalized.startsWith("cos(") && normalized.endsWith(")")) {
    return Math.cos(degreesToRadians(angleDegrees));
  }
  if (normalized.startsWith("sin(") && normalized.endsWith(")")) {
    return Math.sin(degreesToRadians(angleDegrees));
  }
  throw new Error(`${context}.factor "${factor}" is not supported for force decomposition.`);
};

export const resolveForceDecomposition = (
  decomposition: ForceDecomposition,
  parameters: readonly ParameterDefinition[],
): ResolvedForceDecomposition => {
  const magnitude = getParameter(
    parameters,
    decomposition.magnitudeParameterId,
    "N",
    `force decomposition "${decomposition.id}"`,
  ).value;
  const angleDegrees = getParameter(
    parameters,
    decomposition.angleParameterId,
    "deg",
    `force decomposition "${decomposition.id}"`,
  ).value;

  return {
    id: decomposition.id,
    forceId: decomposition.forceId,
    magnitude,
    angleDegrees,
    components: {
      x: signMultiplier(decomposition.components.x.sign) *
        magnitude *
        evaluateTrigFactor(decomposition.components.x.factor, angleDegrees, `force decomposition "${decomposition.id}".components.x`),
      y: signMultiplier(decomposition.components.y.sign) *
        magnitude *
        evaluateTrigFactor(decomposition.components.y.factor, angleDegrees, `force decomposition "${decomposition.id}".components.y`),
    },
  };
};

export const assertVectorMatchesForceDecomposition = (
  vector: Vector2,
  resolved: ResolvedForceDecomposition,
  context: string,
  tolerance = 0.05,
) => {
  const deltaX = Math.abs(vector.x - resolved.components.x);
  const deltaY = Math.abs(vector.y - resolved.components.y);
  if (deltaX > tolerance || deltaY > tolerance) {
    throw new Error(
      `${context} vector does not match force decomposition "${resolved.id}" ` +
        `(expected x=${resolved.components.x.toFixed(3)}, y=${resolved.components.y.toFixed(3)}).`,
    );
  }
};
