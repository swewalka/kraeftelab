import { Text } from "react-konva";

type LabelProps = Readonly<{
  x: number;
  y: number;
  text: string;
  fill?: string;
  fontSize?: number;
  fontStyle?: string;
  align?: "left" | "center" | "right";
  width?: number;
  opacity?: number;
}>;

export const Label = ({
  x,
  y,
  text,
  fill = "#17201a",
  fontSize = 18,
  fontStyle = "600",
  align = "left",
  width,
  opacity = 1,
}: LabelProps) => (
  <Text
    x={x}
    y={y}
    text={text}
    fill={fill}
    fontSize={fontSize}
    fontStyle={fontStyle}
    fontFamily="Aptos, system-ui, sans-serif"
    align={align}
    opacity={opacity}
    {...(width === undefined ? {} : { width })}
  />
);
