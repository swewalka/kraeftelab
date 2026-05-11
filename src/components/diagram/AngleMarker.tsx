import { Group, Line } from "react-konva";
import { Label } from "./Label";
import type { CanvasPoint } from "./types";
import { formatCanvasMathLabel } from "./canvasMathLabel";

type AngleMarkerProps = Readonly<{
  center: CanvasPoint;
  radius: number;
  startAngleDeg: number;
  endAngleDeg: number;
  label: string;
  labelOffset: CanvasPoint;
  color: string;
  fontSize?: number;
  opacity?: number;
}>;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const arcPoints = (center: CanvasPoint, radius: number, startAngleDeg: number, endAngleDeg: number): number[] => {
  const sweep = endAngleDeg - startAngleDeg;
  const steps = Math.max(8, Math.ceil(Math.abs(sweep) / 8));

  return Array.from({ length: steps + 1 }, (_, index) => {
    const angle = toRadians(startAngleDeg + (sweep * index) / steps);
    return [center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius];
  }).flat();
};

export const AngleMarker = ({
  center,
  radius,
  startAngleDeg,
  endAngleDeg,
  label,
  labelOffset,
  color,
  fontSize = 16,
  opacity = 1,
}: AngleMarkerProps) => {
  const labelPoint = {
    x: center.x + labelOffset.x,
    y: center.y + labelOffset.y,
  };

  return (
    <Group opacity={opacity}>
      <Line
        points={arcPoints(center, radius, startAngleDeg, endAngleDeg)}
        stroke={color}
        strokeWidth={1.8}
        lineCap="round"
        lineJoin="round"
        opacity={opacity}
      />
      <Label
        x={labelPoint.x}
        y={labelPoint.y}
        text={formatCanvasMathLabel(label)}
        fill={color}
        fontSize={fontSize}
        fontStyle="500"
      />
    </Group>
  );
};
