import { Arrow, Group } from "react-konva";
import { Label } from "./Label";
import type { CanvasPoint } from "./types";

type ForceArrowProps = Readonly<{
  start: CanvasPoint;
  end: CanvasPoint;
  label: string;
  color: string;
  labelOffset?: CanvasPoint;
  strokeWidth?: number;
  fontSize?: number;
}>;

export const ForceArrow = ({ start, end, label, color, labelOffset, strokeWidth = 3, fontSize = 20 }: ForceArrowProps) => {
  const labelX = end.x + (labelOffset?.x ?? 12);
  const labelY = end.y + (labelOffset?.y ?? -26);

  return (
    <Group>
      <Arrow
        points={[start.x, start.y, end.x, end.y]}
        stroke={color}
        fill={color}
        strokeWidth={strokeWidth}
        pointerLength={12}
        pointerWidth={11}
        lineCap="round"
        lineJoin="round"
      />
      <Label x={labelX} y={labelY} text={label} fill={color} fontSize={fontSize} fontStyle="500" />
    </Group>
  );
};
