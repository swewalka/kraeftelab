import type { SolverResult } from "../../mechanics/solvers/equilibrium2D/types";
import { formatNewtonsAsKilonewtons } from "../../mechanics/core/units";
import { MathInline } from "../math/MathInline";

type ResultSummaryProps = Readonly<{
  result: SolverResult;
  title: string;
}>;

export const ResultSummary = ({ result, title }: ResultSummaryProps) => (
  <section className="rounded-lg border border-black bg-black p-6 text-white">
    <h3 className="technical-label text-white/70">{title}</h3>
    <dl className="mt-4 grid gap-3 sm:grid-cols-3">
      {result.reactions.map((reaction) => (
        <div key={reaction.id} className="rounded border border-white/15 bg-white/10 px-4 py-3">
          <dt className="text-sm text-white/70">
            <MathInline latex={reaction.label} />
          </dt>
          <dd className="mt-1 font-mono text-2xl font-semibold">{formatNewtonsAsKilonewtons(reaction.value)}</dd>
        </div>
      ))}
    </dl>
  </section>
);
