import { useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { ModeTabs, type AppMode } from "../components/layout/ModeTabs";
import { MechanicsCanvas } from "../components/diagram/MechanicsCanvas";
import { ProblemOverview } from "../components/problem/ProblemOverview";
import { SolutionPanel } from "../components/equations/SolutionPanel";
import { simpleSupportedBeamCenterLoad } from "../content/problems/statics/equilibrium/simple-supported-beam-center-load";
import { buildSolutionSteps } from "../mechanics/explanation/buildSolutionSteps";
import { solveBeamReactions } from "../mechanics/solvers/equilibrium2D/solveBeamReactions";

export const App = () => {
  const [activeMode, setActiveMode] = useState<AppMode>("explain");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const problem = simpleSupportedBeamCenterLoad;
  const solverResult = useMemo(() => solveBeamReactions(problem), [problem]);
  const solutionSteps = useMemo(() => buildSolutionSteps(problem, solverResult), [problem, solverResult]);
  const stageLabel = activeMode === "explain" ? "Explanation canvas" : "Mechanics canvas";
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
        <MechanicsCanvas problem={problem} solverResult={solverResult} mode={canvasMode} stageLabel={stageLabel} />

        <aside className="flex min-h-0 flex-col border-l border-ink/10 bg-paper">
          <div className="border-b border-ink/15 bg-white px-5 py-4">
            <ModeTabs activeMode={activeMode} onModeChange={handleModeChange} />
          </div>

          {activeMode === "explore" ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <ProblemOverview problem={problem} />
              <section className="mt-5 rounded-md border border-ink/15 bg-white p-4 shadow-sm">
                <h3 className="font-semibold">What to notice</h3>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-steel">
                  <li>The pin at A can resist horizontal and vertical motion.</li>
                  <li>The roller at B resists only vertical motion.</li>
                  <li>The center load is symmetric, so the final vertical reactions should be equal.</li>
                </ul>
              </section>
            </div>
          ) : null}

          {activeMode === "explain" ? (
            <SolutionPanel
              steps={solutionSteps}
              solverResult={solverResult}
              activeStepIndex={activeStepIndex}
              onStepChange={setActiveStepIndex}
            />
          ) : null}

          {activeMode === "practice" ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <section className="rounded-md border border-dashed border-ink/25 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">Practice mode</h3>
                <p className="mt-3 leading-7 text-steel">
                  Practice mode will later ask you to identify supports, draw reactions, and set up equations yourself.
                </p>
              </section>
            </div>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
};
