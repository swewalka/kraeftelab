import type { ProblemDefinition } from "../../mechanics/model/problemDefinition";
import { MathInline } from "../math/MathInline";

type ProblemOverviewProps = Readonly<{
  problem: ProblemDefinition;
  eyebrow: string;
}>;

export const ProblemOverview = ({ problem, eyebrow }: ProblemOverviewProps) => {
  return (
    <section>
      <div>
        <p className="technical-label text-signal">{eyebrow}</p>
        <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.18] tracking-normal text-black">{problem.title}</h2>
        <p className="mt-9 text-lg leading-8 text-ink">{problem.statement}</p>
      </div>
      <dl className="mt-8 grid gap-3">
        {problem.parameters.map((parameter) => (
          <div key={parameter.id} className="grid grid-cols-[84px_1fr] items-center rounded border border-line/80 bg-white px-5 py-4">
            <dt className="technical-label text-steel">
              <MathInline latex={parameter.label} />
            </dt>
            <dd className="font-mono text-lg font-semibold text-black">{parameter.displayValue}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
