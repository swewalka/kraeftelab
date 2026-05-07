import type { EquilibriumEquation } from "../../mechanics/model/types";

type EquationBlockProps = Readonly<{
  equation: EquilibriumEquation;
}>;

export const EquationBlock = ({ equation }: EquationBlockProps) => (
  <article className="border-t border-ink/15 pt-4">
    <h4 className="font-semibold">{equation.title}</h4>
    <div className="mt-3 space-y-2 font-mono text-sm">
      <p className="inline-block rounded bg-white px-3 py-2 shadow-sm ring-1 ring-ink/10">{equation.symbolic}</p>
      <p className="rounded bg-white px-3 py-2 shadow-sm ring-1 ring-ink/10">{equation.substituted}</p>
      {equation.solved ? (
        <p className="rounded bg-signal/10 px-3 py-2 font-semibold text-signal ring-1 ring-signal/20">
          {equation.solved}
        </p>
      ) : null}
    </div>
    <p className="mt-3 text-sm leading-6 text-steel">{equation.explanation}</p>
  </article>
);
