import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Stage } from "react-konva";
import { Minus, Plus, RotateCcw } from "lucide-react";
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
  canvasState,
  selectableObjectIds,
  selectedObjectIds,
  onObjectSelect,
}: MechanicsCanvasProps) => {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(fallbackSize);
  const [zoom, setZoom] = useState(1);
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
    const scale = Math.min(96, availableWidth / worldWidth) * zoom;
    const origin: CanvasPoint = {
      x: (size.width - worldWidth * scale) / 2 - worldBounds.minX * scale,
      y: size.height * 0.5 + worldCenterY * scale,
    };

    return (point) => ({
      x: origin.x + point.x * scale,
      y: origin.y - point.y * scale,
    });
  }, [size.height, size.width, worldBounds.maxX, worldBounds.maxY, worldBounds.minX, worldBounds.minY, zoom]);

  return (
    <section className="relative h-full overflow-hidden bg-paper">
      <div ref={containerRef} className="h-full">
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
      <div className="absolute bottom-8 right-8 grid gap-3" aria-label={t("canvas.controls")}>
        <button
          type="button"
          className="ui-focus inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/80 bg-white text-black shadow-tool transition hover:border-ink"
          aria-label={t("canvas.zoomIn")}
          onClick={() => setZoom((currentZoom) => Math.min(1.3, currentZoom + 0.1))}
        >
          <Plus className="h-5 w-5 stroke-[2]" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ui-focus inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/80 bg-white text-black shadow-tool transition hover:border-ink"
          aria-label={t("canvas.zoomOut")}
          onClick={() => setZoom((currentZoom) => Math.max(0.8, currentZoom - 0.1))}
        >
          <Minus className="h-5 w-5 stroke-[2]" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ui-focus inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/80 bg-white text-black shadow-tool transition hover:border-ink"
          aria-label={t("canvas.resetView")}
          onClick={() => setZoom(1)}
        >
          <RotateCcw className="h-5 w-5 stroke-[2]" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
