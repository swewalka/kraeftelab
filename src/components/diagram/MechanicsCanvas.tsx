import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Stage } from "react-konva";
import type { DiagramContent } from "../../content/problems/types";
import type { ProblemDefinition } from "../../mechanics/model/problemDefinition";
import type { SolverResult } from "../../mechanics/solvers/equilibrium2D/types";
import { CoordinateSystemLayer } from "./CoordinateSystemLayer";
import { getDiagramAdapter } from "./diagramRegistry";
import { DottedGridLayer } from "./DottedGridLayer";
import type { CanvasPoint, DiagramInteractionState, DiagramMode, WorldToCanvas } from "./types";
import { useI18n } from "../../i18n/I18nProvider";

type MechanicsCanvasProps = Readonly<{
  problem: ProblemDefinition;
  solverResult: SolverResult;
  diagram: DiagramContent;
  mode: DiagramMode;
  stageLabel?: string;
}> & DiagramInteractionState;

const fallbackSize = {
  width: 760,
  height: 520,
};

export const MechanicsCanvas = ({
  problem,
  solverResult,
  diagram,
  mode,
  stageLabel,
  canvasState,
  selectableObjectIds,
  selectedObjectIds,
  onObjectSelect,
}: MechanicsCanvasProps) => {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(fallbackSize);
  const diagramAdapter = getDiagramAdapter(diagram.diagramKey);
  const worldBounds = useMemo(
    () => diagramAdapter.getWorldBounds(problem, diagram),
    [diagram, diagramAdapter, problem],
  );

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
    const worldWidth = Math.max(1, worldBounds.maxX - worldBounds.minX);
    const worldCenterY = (worldBounds.minY + worldBounds.maxY) / 2;
    const scale = Math.min(96, availableWidth / worldWidth);
    const origin: CanvasPoint = {
      x: (size.width - worldWidth * scale) / 2 - worldBounds.minX * scale,
      y: size.height * 0.5 + worldCenterY * scale,
    };

    return (point) => ({
      x: origin.x + point.x * scale,
      y: origin.y - point.y * scale,
    });
  }, [size.height, size.width, worldBounds.maxX, worldBounds.maxY, worldBounds.minX, worldBounds.minY]);

  return (
    <section className="flex h-full flex-col border-r border-ink/15 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-steel">{stageLabel ?? t("canvas.defaultLabel")}</h3>
        <span className="rounded border border-ink/15 px-2 py-1 font-mono text-xs text-steel">{t("canvas.engineLabel")}</span>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1">
        <Stage width={size.width} height={size.height}>
          <DottedGridLayer width={size.width} height={size.height} />
          <CoordinateSystemLayer />
          {diagramAdapter.renderLayer({
            problem,
            solverResult,
            diagram,
            mode,
            worldToCanvas,
            canvasState,
            selectableObjectIds,
            selectedObjectIds,
            onObjectSelect,
          })}
        </Stage>
      </div>
    </section>
  );
};
