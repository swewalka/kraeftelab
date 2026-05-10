import { InlineMath } from "react-katex";

type MathInlineProps = Readonly<{
  latex: string;
}>;

export const MathInline = ({ latex }: MathInlineProps) => <InlineMath math={latex} />;
