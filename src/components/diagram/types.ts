import type { AppMode } from "../layout/ModeTabs";
import type { PracticeCanvasState } from "../../mechanics/practice/types";

export type CanvasPoint = Readonly<{
  x: number;
  y: number;
}>;

export type WorldToCanvas = (point: CanvasPoint) => CanvasPoint;

export type DiagramMode = AppMode;

export type DiagramInteractionState = Readonly<{
  canvasState?: PracticeCanvasState | undefined;
  selectableObjectIds?: readonly string[] | undefined;
  selectedObjectIds?: readonly string[] | undefined;
  onObjectSelect?: ((objectId: string) => void) | undefined;
}>;
