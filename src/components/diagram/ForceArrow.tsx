import { Arrow, Group } from "react-konva";
import { Label } from "./Label";
import type { CanvasPoint } from "./types";
import { formatCanvasMathLabel } from "./canvasMathLabel";

type ForceArrowProps = Readonly<{
  start: CanvasPoint;
  end: CanvasPoint;
  label: string;
  color: string;
  labelOffset?: CanvasPoint;
  strokeWidth?: number;
  fontSize?: number;
  opacity?: number;
  dash?: readonly number[];
}>;

export const ForceArrow = ({
  start,
  end,
  label,
  color,
  labelOffset,
  strokeWidth = 4,
  fontSize = 20,
  opacity = 1,
  dash,
}: ForceArrowProps) => {
  const labelX = end.x + (labelOffset?.x ?? 12);
  const labelY = end.y + (labelOffset?.y ?? -26);

  return (
    <Group opacity={opacity}>
      <Arrow
        points={[start.x, start.y, end.x, end.y]}
        stroke={color}
        fill={color}
        strokeWidth={strokeWidth}
        pointerLength={16}
        pointerWidth={15}
        lineCap="round"
        lineJoin="round"
        {...(dash === undefined ? {} : { dash: [...dash] })}
      />
      <Label x={labelX} y={labelY} text={formatCanvasMathLabel(label)} fill={color} fontSize={fontSize} fontStyle="500" />
    </Group>
  );
};
