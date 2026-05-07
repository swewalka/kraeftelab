import { Arrow, Layer } from "react-konva";
import { Label } from "./Label";

type CoordinateSystemLayerProps = Readonly<{
  x?: number;
  y?: number;
}>;

export const CoordinateSystemLayer = ({ x = 54, y = 92 }: CoordinateSystemLayerProps) => {
  const color = "#111111";

  return (
    <Layer listening={false}>
      <Arrow
        points={[x, y, x + 72, y]}
        stroke={color}
        fill={color}
        strokeWidth={2}
        pointerLength={9}
        pointerWidth={8}
        lineCap="round"
      />
      <Arrow
        points={[x, y, x, y - 62]}
        stroke={color}
        fill={color}
        strokeWidth={2}
        pointerLength={9}
        pointerWidth={8}
        lineCap="round"
      />
      <Label x={x + 78} y={y - 12} text="x" fill={color} fontSize={24} fontStyle="400" />
      <Label x={x - 8} y={y - 88} text="y" fill={color} fontSize={24} fontStyle="400" />
    </Layer>
  );
};
