import { Circle, Layer, Line } from "react-konva";
import type { ProblemDefinition } from "../../mechanics/model/problemDefinition";
import type { SolverResult } from "../../mechanics/solvers/equilibrium2D/types";
import { DimensionLine } from "./DimensionLine";
import { ForceArrow } from "./ForceArrow";
import { Label } from "./Label";
import { SupportSymbol } from "./SupportSymbol";
import type { CanvasPoint, DiagramMode, WorldToCanvas } from "./types";

type BeamDiagramLayerProps = Readonly<{
  problem: ProblemDefinition;
  solverResult: SolverResult;
  mode: DiagramMode;
  worldToCanvas: WorldToCanvas;
}>;

const getParameterValue = (problem: ProblemDefinition, id: string): number => {
  const value = problem.parameters.find((parameter) => parameter.id === id)?.value;
  if (value === undefined) {
    throw new Error(`Missing required beam parameter: ${id}`);
  }
  return value;
};

export const BeamDiagramLayer = ({ problem, solverResult, mode, worldToCanvas }: BeamDiagramLayerProps) => {
  const beamLength = getParameterValue(problem, "beamLength");
  const loadPosition = getParameterValue(problem, "loadPosition");
  const load = problem.loads[0];
  const supportA = problem.supports.find((support) => support.id === "supportA");
  const supportB = problem.supports.find((support) => support.id === "supportB");
  const isFreeBody = mode === "explain";
  const reactionAxLabel = solverResult.reactions.find((reaction) => reaction.id === "reactionAx")?.label ?? "A_x";
  const reactionAyLabel = solverResult.reactions.find((reaction) => reaction.id === "reactionAy")?.label ?? "A_y";
  const reactionByLabel = solverResult.reactions.find((reaction) => reaction.id === "reactionBy")?.label ?? "B_y";

  const pointA = worldToCanvas({ x: 0, y: 0 });
  const pointB = worldToCanvas({ x: beamLength, y: 0 });
  const loadPoint = worldToCanvas({ x: loadPosition, y: 0 });
  const supportLayer = !isFreeBody ? (
    <>
      <SupportSymbol kind={supportA?.kind ?? "pin"} point={pointA} />
      <SupportSymbol kind={supportB?.kind ?? "roller"} point={pointB} />
    </>
  ) : null;

  return (
    <Layer>
      <Line points={[pointA.x, pointA.y, pointB.x, pointB.y]} stroke="#111111" strokeWidth={4} lineCap="round" />
      <Circle x={pointA.x} y={pointA.y} radius={5} fill="#fbfaf5" stroke="#111111" strokeWidth={1.5} />
      <Circle x={pointB.x} y={pointB.y} radius={5} fill="#fbfaf5" stroke="#111111" strokeWidth={1.5} />

      <ForceArrow
        start={{ x: loadPoint.x, y: loadPoint.y - 118 }}
        end={{ x: loadPoint.x, y: loadPoint.y - 6 }}
        label={load?.label ?? "F"}
        color="#ff1010"
        labelOffset={{ x: -48, y: -68 }}
        fontSize={30}
      />

      {supportLayer}

      {isFreeBody ? (
        <>
          <ForceArrow
            start={{ x: pointA.x, y: pointA.y - 4 }}
            end={{ x: pointA.x, y: pointA.y - 104 }}
            label={reactionAyLabel}
            color="#0d9488"
            labelOffset={{ x: 14, y: 4 }}
            fontSize={16}
          />
          <ForceArrow
            start={{ x: pointA.x - 6, y: pointA.y + 2 }}
            end={{ x: pointA.x + 86, y: pointA.y + 2 }}
            label={reactionAxLabel}
            color="#0d9488"
            labelOffset={{ x: -8, y: 14 }}
            fontSize={16}
          />
          <ForceArrow
            start={{ x: pointB.x, y: pointB.y - 4 }}
            end={{ x: pointB.x, y: pointB.y - 104 }}
            label={reactionByLabel}
            color="#0d9488"
            labelOffset={{ x: 14, y: 4 }}
            fontSize={16}
          />
        </>
      ) : null}

      <Label x={pointA.x - 48} y={pointA.y - 10} text="A" fontSize={34} fontStyle="400" />
      <Label x={pointB.x + 20} y={pointB.y - 10} text="B" fontSize={34} fontStyle="400" />
      <DimensionLine start={pointA} end={loadPoint} label="L/2" />
      <DimensionLine start={loadPoint} end={pointB} label="L/2" />
    </Layer>
  );
};
