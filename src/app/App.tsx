import { useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { ModeTabs, type AppMode } from "../components/layout/ModeTabs";
import { MechanicsCanvas } from "../components/diagram/MechanicsCanvas";
import { ProblemOverview } from "../components/problem/ProblemOverview";
import { SolutionPanel } from "../components/equations/SolutionPanel";
import { getDefaultProblem } from "../content/problems/catalog";
import { useI18n } from "../i18n/I18nProvider";
import { buildSolutionSteps } from "../mechanics/explanation/buildSolutionSteps";
import { solveProblem } from "../mechanics/solvers/solverRegistry";

export const App = () => {
  const { locale } = useI18n();
  const [activeMode, setActiveMode] = useState<AppMode>("explain");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const problemContent = getDefaultProblem(locale);
  const { diagram, explore, practice, problem, solution } = problemContent;
  const solverResult = useMemo(() => solveProblem(problem), [problem]);
  const solutionSteps = useMemo(() => buildSolutionSteps(solution, solverResult), [solution, solverResult]);
  const stageLabel = activeMode === "explain" ? diagram.stageLabels.solution : diagram.stageLabels.default;
  const canvasMode: AppMode = activeMode === "explain" && activeStepIndex === 0 ? "explore" : activeMode;

  const handleModeChange = (mode: AppMode) => {
    setActiveMode(mode);
    if (mode === "explain") {
      setActiveStepIndex(0);
    }
  };

  return (
    <AppShell>
      <div className="grid h-full grid-cols-[minmax(720px,1fr)_520px]">
        <MechanicsCanvas
          problem={problem}
          solverResult={solverResult}
          diagram={diagram}
          mode={canvasMode}
          stageLabel={stageLabel}
        />

        <aside className="flex min-h-0 flex-col border-l border-ink/10 bg-paper">
          <div className="border-b border-ink/15 bg-white px-5 py-4">
            <ModeTabs activeMode={activeMode} onModeChange={handleModeChange} />
          </div>

          {activeMode === "explore" ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <ProblemOverview problem={problem} />
              {explore.notices.length > 0 ? (
                <section className="mt-5 rounded-md border border-ink/15 bg-white p-4 shadow-sm">
                  {explore.noticeTitle ? <h3 className="font-semibold">{explore.noticeTitle}</h3> : null}
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-steel">
                    {explore.notices.map((notice) => (
                      <li key={notice}>{notice}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : null}

          {activeMode === "explain" ? (
            <SolutionPanel
              solution={solution}
              steps={solutionSteps}
              solverResult={solverResult}
              activeStepIndex={activeStepIndex}
              onStepChange={setActiveStepIndex}
            />
          ) : null}

          {activeMode === "practice" ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <section className="rounded-md border border-dashed border-ink/25 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">{practice.title}</h3>
                <p className="mt-3 leading-7 text-steel">{practice.body}</p>
                {practice.prompts.length > 0 ? (
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-steel">
                    {practice.prompts.map((prompt) => (
                      <li key={prompt}>{prompt}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            </div>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
};
