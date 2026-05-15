import { ArrowRight, Sigma } from "lucide-react";
import type { LoadedProblemContent } from "../../content/problems/types";
import { useI18n } from "../../i18n/I18nProvider";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";

type ProblemCatalogLandingProps = Readonly<{
  problems: readonly LoadedProblemContent[];
  onProblemSelect: (problemId: string) => void;
}>;

type TopicGroup = Readonly<{
  topic: string;
  problems: readonly LoadedProblemContent[];
}>;

const topicLabelKeys = {
  "statics.equilibrium": "topic.staticsEquilibrium",
} as const;

const getTopicLabelKey = (topic: string) =>
  topic in topicLabelKeys ? topicLabelKeys[topic as keyof typeof topicLabelKeys] : "topic.statics";

const groupProblemsByTopic = (problems: readonly LoadedProblemContent[]): readonly TopicGroup[] => {
  const groups = new Map<string, LoadedProblemContent[]>();

  problems.forEach((problemContent) => {
    const group = groups.get(problemContent.problem.topic) ?? [];
    group.push(problemContent);
    groups.set(problemContent.problem.topic, group);
  });

  return [...groups.entries()].map(([topic, groupedProblems]) => ({
    topic,
    problems: groupedProblems,
  }));
};

export const ProblemCatalogLanding = ({ problems, onProblemSelect }: ProblemCatalogLandingProps) => {
  const { t } = useI18n();
  const topicGroups = groupProblemsByTopic(problems);

  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <header className="border-b border-line/75 bg-surface">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          <h1 className="font-display text-3xl font-bold leading-none tracking-normal text-black">{t("app.title")}</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-8 py-12 lg:grid-cols-[360px_minmax(0,1fr)] lg:py-16">
        <section className="lg:pt-3">
          <p className="technical-label text-signal">{t("landing.eyebrow")}</p>
          <h2 className="mt-5 max-w-[680px] font-display text-5xl font-semibold leading-tight tracking-normal text-black">
            {t("landing.title")}
          </h2>
          <p className="mt-5 max-w-[560px] text-lg leading-8 text-steel">{t("landing.subtitle")}</p>

          <div className="mt-10 border-t border-line/80 pt-6">
            <p className="technical-label text-steel">{t("landing.availableProblems")}</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-normal text-black">
              {t("landing.problemCount", { count: problems.length })}
            </p>
          </div>
        </section>

        <div className="space-y-10">
          {topicGroups.map((group) => (
            <section key={group.topic} aria-labelledby={`${group.topic}-heading`}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded border border-line/80 bg-white text-signal">
                  <Sigma className="h-5 w-5 stroke-[2]" aria-hidden="true" />
                </span>
                <h3 id={`${group.topic}-heading`} className="font-display text-2xl font-semibold tracking-normal text-black">
                  {t(getTopicLabelKey(group.topic))}
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {group.problems.map(({ problem }) => (
                  <button
                    key={problem.id}
                    type="button"
                    className="ui-focus group flex min-h-[190px] flex-col rounded-lg border border-line/80 bg-white p-6 text-left transition hover:border-signal hover:bg-signalMist/40"
                    onClick={() => onProblemSelect(problem.id)}
                    aria-label={t("landing.openProblem", { title: problem.title })}
                  >
                    <span className="technical-label text-steel">{t("landing.problemType")}</span>
                    <span className="mt-2 font-display text-sm font-semibold text-signal">{problem.problemType}</span>

                    <span className="mt-5 block font-display text-2xl font-semibold leading-snug tracking-normal text-black">
                      {problem.title}
                    </span>

                    <span className="mt-auto flex items-center gap-2 pt-6 font-display text-base font-semibold text-black">
                      {t("landing.startProblem")}
                      <ArrowRight className="h-5 w-5 stroke-[2] transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};
