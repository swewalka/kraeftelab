import type { ProblemDefinition } from "../model/problemDefinition";
import type { SolutionStep } from "../model/types";
import type { SolverResult } from "../solvers/equilibrium2D/types";
import { formatMeters, formatNewtonsAsKilonewtons } from "../core/units";

export const buildSolutionSteps = (problem: ProblemDefinition, result: SolverResult): readonly SolutionStep[] => {
  const beamLength = problem.parameters.find((parameter) => parameter.id === "beamLength")?.value ?? 0;
  const loadMagnitude = problem.parameters.find((parameter) => parameter.id === "loadMagnitude")?.value ?? 0;
  const loadPosition = problem.parameters.find((parameter) => parameter.id === "loadPosition")?.value ?? 0;
  const sumForceX = result.equations.find((equation) => equation.id === "sum-force-x");
  const sumMomentA = result.equations.find((equation) => equation.id === "sum-moment-a");
  const sumForceY = result.equations.find((equation) => equation.id === "sum-force-y");

  if (!sumForceX || !sumMomentA || !sumForceY) {
    throw new Error("Beam solution steps require horizontal, vertical, and moment equilibrium equations.");
  }

  return [
    {
      id: "identify-unknowns",
      title: "1. Identify unknown reactions",
      body: "Support A is a pin, so it can provide A_x and A_y. Support B is a roller, so it provides only B_y.",
    },
    {
      id: "free-body",
      title: "2. Replace supports with reaction forces",
      body: `The beam is isolated. The downward load is ${formatNewtonsAsKilonewtons(loadMagnitude)} at x = ${formatMeters(loadPosition)}, and supports are replaced by their reaction components.`,
    },
    {
      id: "equilibrium-x",
      title: "3. Apply horizontal equilibrium",
      body: "There are no applied horizontal forces, so the pin has no horizontal reaction.",
      equations: [sumForceX],
    },
    {
      id: "moment-a",
      title: "4. Take moments about A",
      body: `The moment arm for B_y is ${formatMeters(beamLength)}. The moment arm for the load is ${formatMeters(loadPosition)}.`,
      equations: [sumMomentA],
    },
    {
      id: "equilibrium-y",
      title: "5. Apply vertical equilibrium",
      body: "The upward reactions must balance the downward point load.",
      equations: [sumForceY],
    },
    {
      id: "summary",
      title: "6. Summarize reactions",
      body: result.reactions
        .map((reaction) => `${reaction.label} = ${formatNewtonsAsKilonewtons(reaction.value)}`)
        .join(", "),
    },
  ];
};
