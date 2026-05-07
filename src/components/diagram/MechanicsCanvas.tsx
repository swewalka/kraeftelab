import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Stage } from "react-konva";
import type { ProblemDefinition } from "../../mechanics/model/problemDefinition";
import type { SolverResult } from "../../mechanics/solvers/equilibrium2D/types";
import { BeamDiagramLayer } from "./BeamDiagramLayer";
import { CoordinateSystemLayer } from "./CoordinateSystemLayer";
import { DottedGridLayer } from "./DottedGridLayer";
import type { CanvasPoint, DiagramMode, WorldToCanvas } from "./types";

type MechanicsCanvasProps = Readonly<{
  problem: ProblemDefinition;
  solverResult: SolverResult;
  mode: DiagramMode;
  stageLabel?: string;
}>;

const fallbackSize = {
  width: 760,
  height: 520,
};

const getBeamLength = (problem: ProblemDefinition): number => {
  const beamLength = problem.parameters.find((parameter) => parameter.id === "beamLength")?.value;
  if (beamLength === undefined) {
    throw new Error("MechanicsCanvas requires a beamLength parameter for the current beam renderer.");
  }
  return beamLength;
};

export const MechanicsCanvas = ({ problem, solverResult, mode, stageLabel }: MechanicsCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(fallbackSize);
  const beamLength = getBeamLength(problem);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      const { width, height } = entry.contentRect;
      setSize({
        width: Math.max(520, width),
        height: Math.max(360, height),
      });
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const worldToCanvas = useMemo<WorldToCanvas>(() => {
    const marginX = 150;
    const availableWidth = Math.max(320, size.width - marginX * 2);
    const scale = Math.min(96, availableWidth / beamLength);
    const origin: CanvasPoint = {
      x: (size.width - beamLength * scale) / 2,
      y: size.height * 0.5,
    };

    return (point) => ({
      x: origin.x + point.x * scale,
      y: origin.y - point.y * scale,
    });
  }, [beamLength, size.height, size.width]);

  return (
    <section className="flex h-full flex-col border-r border-ink/15 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-steel">{stageLabel ?? "Mechanics canvas"}</h3>
        <span className="rounded border border-ink/15 px-2 py-1 font-mono text-xs text-steel">konva canvas</span>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1">
        <Stage width={size.width} height={size.height}>
          <DottedGridLayer width={size.width} height={size.height} />
          <CoordinateSystemLayer />
          <BeamDiagramLayer problem={problem} solverResult={solverResult} mode={mode} worldToCanvas={worldToCanvas} />
        </Stage>
      </div>
    </section>
  );
};
