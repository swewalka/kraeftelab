import type { ProblemDefinition } from "../../model/problemDefinition";
import type { EquilibriumEquation } from "../../model/types";

type BeamEquationInput = Readonly<{
  beamLength: number;
  loadMagnitude: number;
  loadPosition: number;
  reactionBy: number;
  reactionAy: number;
}>;

export const getBeamEquationValues = (problem: ProblemDefinition): BeamEquationInput => {
  const beamLength = problem.parameters.find((parameter) => parameter.id === "beamLength")?.value;
  const loadMagnitude = problem.parameters.find((parameter) => parameter.id === "loadMagnitude")?.value;
  const loadPosition = problem.parameters.find((parameter) => parameter.id === "loadPosition")?.value;

  if (beamLength === undefined || loadMagnitude === undefined || loadPosition === undefined) {
    throw new Error("Beam reaction solver requires beamLength, loadMagnitude, and loadPosition parameters.");
  }

  const reactionBy = (loadMagnitude * loadPosition) / beamLength;
  const reactionAy = loadMagnitude - reactionBy;

  return {
    beamLength,
    loadMagnitude,
    loadPosition,
    reactionBy,
    reactionAy,
  };
};

export const buildBeamReactionEquations = (input: BeamEquationInput): readonly EquilibriumEquation[] => [
  {
    id: "sum-force-x",
    title: "Horizontal force equilibrium",
    symbolic: "ΣF_x = 0",
    substituted: "A_x = 0",
    solved: "A_x = 0 N",
    explanation: "No external horizontal load is applied, so the horizontal pin reaction is zero.",
  },
  {
    id: "sum-moment-a",
    title: "Moment equilibrium about A",
    symbolic: "ΣM_A = 0",
    substituted: `B_y · ${input.beamLength} m - ${input.loadMagnitude} N · ${input.loadPosition} m = 0`,
    solved: `B_y = (${input.loadMagnitude} N · ${input.loadPosition} m) / ${input.beamLength} m = ${input.reactionBy} N`,
    explanation:
      "Taking moments about A eliminates A_x and A_y, because their lines of action pass through point A.",
  },
  {
    id: "sum-force-y",
    title: "Vertical force equilibrium",
    symbolic: "ΣF_y = 0",
    substituted: `A_y + ${input.reactionBy} N - ${input.loadMagnitude} N = 0`,
    solved: `A_y = ${input.loadMagnitude} N - ${input.reactionBy} N = ${input.reactionAy} N`,
    explanation: "After B_y is known, vertical force equilibrium gives the remaining vertical reaction at A.",
  },
];
