import { Arrow, Group, Line } from "react-konva";
import { Label } from "./Label";
import type { CanvasPoint } from "./types";

type DimensionLineProps = Readonly<{
  start: CanvasPoint;
  end: CanvasPoint;
  label: string;
  yOffset?: number;
}>;

export const DimensionLine = ({ start, end, label, yOffset = 86 }: DimensionLineProps) => {
  const y = start.y + yOffset;
  const color = "#111111";

  return (
    <Group>
      <Line points={[start.x, start.y + 20, start.x, y + 8]} stroke={color} strokeWidth={1} opacity={0.8} />
      <Line points={[end.x, end.y + 20, end.x, y + 8]} stroke={color} strokeWidth={1} opacity={0.8} />
      <Arrow
        points={[start.x + 2, y, end.x - 2, y]}
        stroke={color}
        fill={color}
        strokeWidth={1.2}
        pointerLength={8}
        pointerWidth={7}
        pointerAtBeginning
      />
      <Label x={(start.x + end.x) / 2 - 20} y={y - 31} text={label} fill={color} fontSize={20} fontStyle="400" />
    </Group>
  );
};
