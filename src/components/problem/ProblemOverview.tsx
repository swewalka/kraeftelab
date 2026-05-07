import type { ProblemDefinition } from "../../mechanics/model/problemDefinition";

type ProblemOverviewProps = Readonly<{
  problem: ProblemDefinition;
}>;

export const ProblemOverview = ({ problem }: ProblemOverviewProps) => (
  <section className="space-y-4">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal">Current problem</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">{problem.title}</h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-steel">{problem.statement}</p>
    </div>
    <dl className="grid gap-3 sm:grid-cols-3">
      {problem.parameters.map((parameter) => (
        <div key={parameter.id} className="rounded-md border border-ink/15 bg-white px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.14em] text-steel">{parameter.label}</dt>
          <dd className="mt-1 font-mono text-lg font-semibold">{parameter.displayValue}</dd>
        </div>
      ))}
    </dl>
  </section>
);
