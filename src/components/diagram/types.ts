import type { AppMode } from "../layout/ModeTabs";
import type { CanvasState } from "../../mechanics/model/canvasState";

export type CanvasPoint = Readonly<{
  x: number;
  y: number;
}>;

export type WorldToCanvas = (point: CanvasPoint) => CanvasPoint;

export type DiagramMode = AppMode;

export type DiagramInteractionState = Readonly<{
  canvasState?: CanvasState | undefined;
  selectableObjectIds?: readonly string[] | undefined;
  selectedObjectIds?: readonly string[] | undefined;
  onObjectSelect?: ((objectId: string) => void) | undefined;
}>;
