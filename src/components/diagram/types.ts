import type { AppMode } from "../layout/ModeTabs";

export type CanvasPoint = Readonly<{
  x: number;
  y: number;
}>;

export type WorldToCanvas = (point: CanvasPoint) => CanvasPoint;

export type DiagramMode = AppMode;
