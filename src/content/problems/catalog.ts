import { simpleSupportedBeamCenterLoad } from "./statics/equilibrium/simple-supported-beam-center-load";
import { simpleSupportedBeamAngledLoad } from "./statics/equilibrium/simple-supported-beam-angled-load";
import { defaultLocale, type Locale } from "../../i18n/types";
import type { LoadedProblemContent } from "./types";
import { validateLocalizedProblemPair } from "./localeValidation";
import { runMechanicsContractChecks } from "./contractChecks";

const registerLocalizedProblem = <T extends Readonly<{ en: LoadedProblemContent; de: LoadedProblemContent }>>(content: T): T => {
  validateLocalizedProblemPair(content.en, content.de);
  return content;
};

const centerLoad = registerLocalizedProblem(simpleSupportedBeamCenterLoad);
const angledLoad = registerLocalizedProblem(simpleSupportedBeamAngledLoad);

runMechanicsContractChecks();

export const problemCatalog: Readonly<Record<Locale, readonly LoadedProblemContent[]>> = {
  en: [centerLoad.en, angledLoad.en],
  de: [centerLoad.de, angledLoad.de],
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
