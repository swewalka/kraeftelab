import { useMemo } from "react";
import { Circle, Layer, Rect } from "react-konva";

type DottedGridLayerProps = Readonly<{
  width: number;
  height: number;
  spacing?: number;
}>;

export const DottedGridLayer = ({ width, height, spacing = 24 }: DottedGridLayerProps) => {
  const dots = useMemo(() => {
    const result: { x: number; y: number }[] = [];
    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        result.push({ x, y });
      }
    }
    return result;
  }, [height, spacing, width]);

  return (
    <Layer listening={false}>
      <Rect x={0} y={0} width={width} height={height} fill="#fbfaf5" />
      {dots.map((dot) => (
        <Circle key={`${dot.x}-${dot.y}`} x={dot.x} y={dot.y} radius={1.25} fill="#d7d0bf" opacity={0.55} />
      ))}
    </Layer>
  );
};
