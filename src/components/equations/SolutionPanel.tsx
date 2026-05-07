import type { SolutionStep } from "../../mechanics/model/types";
import type { SolverResult } from "../../mechanics/solvers/equilibrium2D/types";
import { EquationBlock } from "./EquationBlock";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { ResultSummary } from "../results/ResultSummary";

type SolutionPanelProps = Readonly<{
  steps: readonly SolutionStep[];
  solverResult: SolverResult;
  activeStepIndex: number;
  onStepChange: (stepIndex: number) => void;
}>;

export const SolutionPanel = ({ steps, solverResult, activeStepIndex, onStepChange }: SolutionPanelProps) => {
  const activeStep = steps[activeStepIndex];
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === steps.length - 1;

  if (!activeStep) {
    return null;
  }

  return (
    <section className="flex h-full flex-col bg-paper">
      <div className="border-b border-ink/15 bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal">Guided explanation</p>
        <h2 className="mt-1 text-xl font-semibold">Support reactions</h2>
        <div className="mt-4 grid grid-cols-6 gap-1" aria-label="Solution progress">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              aria-label={`Go to ${step.title}`}
              className={[
                "h-2 rounded-full transition",
                index <= activeStepIndex ? "bg-signal" : "bg-ink/15 hover:bg-ink/25",
              ].join(" ")}
              onClick={() => onStepChange(index)}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <article>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-steel">
                Step {activeStepIndex + 1} / {steps.length}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{activeStep.title}</h3>
            </div>
            {isLastStep ? <CheckCircle2 className="mt-1 h-5 w-5 text-signal" aria-hidden="true" /> : null}
          </div>
          <p className="mt-4 text-base leading-7 text-steel">{activeStep.body}</p>
          {activeStep.equations && activeStep.equations.length > 0 ? (
            <div className="mt-6 grid gap-5">
              {activeStep.equations.map((equation) => (
                <EquationBlock key={equation.id} equation={equation} />
              ))}
            </div>
          ) : null}
        </article>

        {isLastStep ? (
          <div className="mt-5">
            <ResultSummary result={solverResult} />
          </div>
        ) : null}

        <section className="mt-5 rounded-md border border-ink/15 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-steel">Assumptions</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-steel">
            {solverResult.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ink/15 bg-white px-5 py-4">
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded border border-ink/15 px-3 text-sm font-medium text-steel transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isFirstStep}
          onClick={() => onStepChange(activeStepIndex - 1)}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded border border-ink/15 px-3 text-sm font-medium text-steel transition hover:bg-ink/5"
          onClick={() => onStepChange(0)}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Restart
        </button>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded bg-ink px-4 text-sm font-medium text-white transition hover:bg-steel disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isLastStep}
          onClick={() => onStepChange(activeStepIndex + 1)}
        >
          Next
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
