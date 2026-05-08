import { simpleSupportedBeamCenterLoad } from "./statics/equilibrium/simple-supported-beam-center-load";
import { defaultLocale, type Locale } from "../../i18n/types";
import type { LoadedProblemContent } from "./types";

export const problemCatalog: Readonly<Record<Locale, readonly LoadedProblemContent[]>> = {
  en: [simpleSupportedBeamCenterLoad.en],
  de: [simpleSupportedBeamCenterLoad.de],
};

const firstProblem = problemCatalog[defaultLocale][0];
if (!firstProblem) {
  throw new Error("Problem catalog must contain at least one problem.");
}

export const getProblemById = (problemId: string, locale: Locale = defaultLocale): LoadedProblemContent => {
  const problem = problemCatalog[locale].find((entry) => entry.problem.id === problemId) ??
    problemCatalog.en.find((entry) => entry.problem.id === problemId);
  if (!problem) {
    throw new Error(`Unknown problem id "${problemId}".`);
  }
  return problem;
};

export const getDefaultProblem = (locale: Locale = defaultLocale): LoadedProblemContent =>
  problemCatalog[locale][0] ?? firstProblem;
