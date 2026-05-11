import type { SolutionStep } from "../../mechanics/model/types";
import type { SolutionContent } from "../../mechanics/explanation/types";
import { EquationBlock } from "./EquationBlock";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { ContentBlockRenderer } from "../content/ContentBlockRenderer";
import { StepProgress } from "../layout/StepProgress";

type SolutionPanelProps = Readonly<{
  eyebrow: string;
  solution: SolutionContent;
  steps: readonly SolutionStep[];
  activeStepIndex: number;
  onStepChange: (stepIndex: number) => void;
}>;

export const SolutionPanel = ({ eyebrow, solution, steps, activeStepIndex, onStepChange }: SolutionPanelProps) => {
  const { t } = useI18n();
  const activeStep = steps[activeStepIndex];
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === steps.length - 1;

  if (!activeStep) {
    return null;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col px-14 pb-10 pt-12">
      <div>
        <p className="technical-label text-signal">{eyebrow}</p>
        <div className="mt-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-4xl font-semibold leading-[1.18] tracking-normal text-black">{activeStep.title}</h2>
          {isLastStep ? <CheckCircle2 className="practice-success-pop mt-2 h-7 w-7 shrink-0 text-signal" aria-hidden="true" /> : null}
        </div>
        <StepProgress current={activeStepIndex + 1} total={steps.length} ariaLabel={t("solution.progress")} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-12">
        <article className="rounded-lg border border-line/80 bg-white p-8">
          <ContentBlockRenderer
            blocks={activeStep.body}
            className="space-y-4"
            paragraphClassName="text-lg leading-8 text-ink"
          />
          {activeStep.equations && activeStep.equations.length > 0 ? (
            <div className="mt-8 grid gap-6">
              {activeStep.equations.map((equation) => (
                <EquationBlock key={equation.id} equation={equation} />
              ))}
            </div>
          ) : null}
        </article>

        <section className="mt-8 rounded-lg border border-line/80 bg-white p-6">
          <h3 className="technical-label text-steel">{t("solution.assumptions")}</h3>
          <ul className="mt-4 space-y-3 text-base leading-7 text-steel">
            {solution.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-3 pt-8">
        <button
          type="button"
          className="ui-focus flex h-14 items-center justify-center gap-2 rounded border border-black bg-transparent px-4 font-display text-base font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isFirstStep}
          onClick={() => onStepChange(activeStepIndex - 1)}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("actions.back")}
        </button>
        <button
          type="button"
          className="ui-focus flex h-14 items-center justify-center gap-2 rounded border border-black bg-transparent px-4 font-display text-base font-semibold text-black transition hover:bg-white"
          onClick={() => onStepChange(0)}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t("actions.restart")}
        </button>
        <button
          type="button"
          className="ui-focus flex h-14 items-center justify-center gap-2 rounded bg-black px-4 font-display text-base font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isLastStep}
          onClick={() => onStepChange(activeStepIndex + 1)}
        >
          {t("actions.next")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
