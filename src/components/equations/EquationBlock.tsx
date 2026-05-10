import type { EquilibriumEquation } from "../../mechanics/model/types";
import { ContentBlockRenderer } from "../content/ContentBlockRenderer";
import { MathBlock } from "../math/MathBlock";

type EquationBlockProps = Readonly<{
  equation: EquilibriumEquation;
}>;

export const EquationBlock = ({ equation }: EquationBlockProps) => (
  <article className="border-t border-line/80 pt-6">
    <h4 className="font-display text-lg font-semibold text-black">{equation.title}</h4>
    <div className="mt-4">
      <MathBlock latex={equation.symbolic} />
      <MathBlock latex={equation.substituted} />
      {equation.solved ? <MathBlock latex={equation.solved} tone="success" /> : null}
    </div>
    <ContentBlockRenderer blocks={equation.explanation} className="mt-4 space-y-3" paragraphClassName="text-base leading-7 text-steel" />
  </article>
);
