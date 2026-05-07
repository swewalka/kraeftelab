import type { SolverResult } from "../../mechanics/solvers/equilibrium2D/types";
import { formatNewtonsAsKilonewtons } from "../../mechanics/core/units";

type ResultSummaryProps = Readonly<{
  result: SolverResult;
}>;

export const ResultSummary = ({ result }: ResultSummaryProps) => (
  <section className="rounded-md border border-ink/15 bg-ink p-4 text-white shadow-sm">
    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Support reactions</h3>
    <dl className="mt-4 grid gap-3 sm:grid-cols-3">
      {result.reactions.map((reaction) => (
        <div key={reaction.id} className="rounded border border-white/15 bg-white/8 px-4 py-3">
          <dt className="font-mono text-sm text-white/70">{reaction.label}</dt>
          <dd className="mt-1 font-mono text-2xl font-semibold">{formatNewtonsAsKilonewtons(reaction.value)}</dd>
        </div>
      ))}
    </dl>
  </section>
);
