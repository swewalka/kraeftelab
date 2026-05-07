import { Circle, Group, Line } from "react-konva";
import type { CanvasPoint } from "./types";

type SupportSymbolProps = Readonly<{
  kind: "pin" | "roller";
  point: CanvasPoint;
}>;

export const SupportSymbol = ({ kind, point }: SupportSymbolProps) => {
  const topY = point.y;
  const groundY = point.y + 48;
  const baseY = kind === "pin" ? groundY : groundY - 12;
  const stroke = "#111111";
  const hatchStartX = point.x - 54;
  const hatchEndX = point.x + 54;
  const hatches = Array.from({ length: 8 }, (_, index) => {
    const x = hatchStartX + 12 + index * 13;
    return <Line key={x} points={[x, groundY, x - 9, groundY + 13]} stroke={stroke} strokeWidth={1.5} />;
  });
  const ground = (
    <>
      <Line points={[hatchStartX, groundY, hatchEndX, groundY]} stroke={stroke} strokeWidth={2} />
      {hatches}
    </>
  );

  if (kind === "roller") {
    return (
      <Group>
        <Circle x={point.x} y={topY} radius={5} fill="#fbfaf5" stroke={stroke} strokeWidth={1.5} />
        <Line
          points={[point.x - 32, baseY, point.x, topY + 8, point.x + 32, baseY, point.x - 32, baseY]}
          closed
          fill="#fbfaf5"
          stroke={stroke}
          strokeWidth={2}
        />
        {ground}
      </Group>
    );
  }

  return (
    <Group>
      <Circle x={point.x} y={topY} radius={5} fill="#fbfaf5" stroke={stroke} strokeWidth={1.5} />
      <Line
        points={[point.x - 32, baseY, point.x, topY + 8, point.x + 32, baseY, point.x - 32, baseY]}
        closed
        fill="#fbfaf5"
        stroke={stroke}
        strokeWidth={2}
      />
      {ground}
    </Group>
  );
};
