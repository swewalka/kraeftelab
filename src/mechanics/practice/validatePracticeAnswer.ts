import type {
  EquationBuilderInteraction,
  EquationTerm,
  ExpectedEquation,
  PracticeStep,
  ValidationResult,
} from "./types";

const toStringArray = (answer: unknown): readonly string[] => {
  if (!Array.isArray(answer)) {
    return [];
  }
  return answer.filter((item): item is string => typeof item === "string" && item.length > 0);
};

const toStringRecord = (answer: unknown): Record<string, string> => {
  if (typeof answer !== "object" || answer === null || Array.isArray(answer)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(answer).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
};

const findFeedbackMessages = (step: PracticeStep, mistakeIds: readonly string[]): readonly string[] => {
  const mistakeFeedback = new Map(step.feedback.mistakes?.map((mistake) => [mistake.id, mistake.text]) ?? []);
  const messages = mistakeIds.flatMap((mistakeId) => {
    const message = mistakeFeedback.get(mistakeId);
    return message === undefined ? [] : [message];
  });

  return messages.length > 0 ? messages : [step.feedback.genericIncorrect];
};

const compareIdSets = (
  selectedIds: readonly string[],
  expectedIds: readonly string[],
): { isCorrect: boolean; mistakeIds: readonly string[] } => {
  const selected = new Set(selectedIds);
  const expected = new Set(expectedIds);
  const missing = expectedIds.filter((id) => !selected.has(id)).map((id) => `missing:${id}`);
  const extra = selectedIds.filter((id) => !expected.has(id)).map((id) => `selected:${id}`);

  return {
    isCorrect: missing.length === 0 && extra.length === 0,
    mistakeIds: [...extra, ...missing],
  };
};

const normalizeFactor = (factor?: string): string => {
  if (factor === undefined || factor.length === 0) {
    return "";
  }
  return factor.replaceAll(" ", "").replaceAll("·", "*").toLowerCase();
};

const termKey = (term: Pick<EquationTerm["semantic"], "variable" | "sign" | "factor">): string =>
  `${term.variable}:${term.sign}:${normalizeFactor(term.factor)}`;

const expectedTermKey = (term: ExpectedEquation["terms"][number]): string =>
  `${term.variable}:${term.sign}:${normalizeFactor(term.factor)}`;

const validateEquation = (
  interaction: EquationBuilderInteraction,
  answer: unknown,
): { isCorrect: boolean; mistakeIds: readonly string[] } => {
  const selectedTermIds = toStringArray(answer);
  const termsById = new Map(interaction.availableTerms.map((term) => [term.id, term]));
  const selectedTerms = selectedTermIds.flatMap((termId) => {
    const term = termsById.get(termId);
    return term === undefined ? [] : [term];
  });
  const selectedKeys = new Set(selectedTerms.map((term) => termKey(term.semantic)));
  const expectedKeys = new Set(interaction.expectedEquation.terms.map(expectedTermKey));
  const mistakeIds: string[] = [];

  for (const expectedTerm of interaction.expectedEquation.terms) {
    const expectedKey = expectedTermKey(expectedTerm);
    if (selectedKeys.has(expectedKey)) {
      continue;
    }

    const sameVariable = selectedTerms.filter((term) => term.semantic.variable === expectedTerm.variable);
    const wrongSign = sameVariable.find(
      (term) =>
        normalizeFactor(term.semantic.factor) === normalizeFactor(expectedTerm.factor) &&
        term.semantic.sign !== expectedTerm.sign,
    );
    const wrongFactor = sameVariable.find(
      (term) =>
        term.semantic.sign === expectedTerm.sign &&
        normalizeFactor(term.semantic.factor) !== normalizeFactor(expectedTerm.factor),
    );

    if (wrongSign) {
      mistakeIds.push(`wrongSign:${expectedTerm.variable}`);
    } else if (wrongFactor) {
      mistakeIds.push(`wrongFactor:${expectedTerm.variable}`);
    } else {
      mistakeIds.push(`missing:${expectedTerm.variable}:${expectedTerm.sign}:${normalizeFactor(expectedTerm.factor)}`);
    }
  }

  for (const selectedTerm of selectedTerms) {
    if (expectedKeys.has(termKey(selectedTerm.semantic))) {
      continue;
    }
    const factor = normalizeFactor(selectedTerm.semantic.factor);
    if (factor === "0") {
      mistakeIds.push(`zeroTerm:${selectedTerm.semantic.variable}`);
    } else if (!interaction.expectedEquation.terms.some((term) => term.variable === selectedTerm.semantic.variable)) {
      mistakeIds.push(`extra:${selectedTerm.semantic.variable}`);
    }
  }

  return {
    isCorrect:
      mistakeIds.length === 0 &&
      selectedTerms.length === interaction.expectedEquation.terms.length &&
      selectedKeys.size === expectedKeys.size,
    mistakeIds,
  };
};

const normalizeExpression = (expression: string, variable: string): string => {
  const normalized = expression
    .trim()
    .replaceAll(" ", "")
    .replaceAll("·", "*")
    .replaceAll(",", ".")
    .toLowerCase();
  const equalsIndex = normalized.indexOf("=");
  if (equalsIndex === -1) {
    return normalized;
  }

  const left = normalized.slice(0, equalsIndex).replaceAll("_", "");
  const variableName = variable.toLowerCase().replaceAll("_", "");
  return left === variableName ? normalized.slice(equalsIndex + 1) : normalized;
};

const normalizeComparableExpression = (expression: string, variable: string): string =>
  normalizeExpression(expression, variable)
    .replace(/^0\.5\*?f$/, "f/2")
    .replace(/^f\*1\/2$/, "f/2")
    .replace(/^1\/2\*f$/, "f/2");

const validateExpression = (
  variable: string,
  expectedExpression: string,
  acceptedExpressions: readonly string[],
  answer: unknown,
): { isCorrect: boolean; mistakeIds: readonly string[] } => {
  const rawAnswer = typeof answer === "string" ? answer : "";
  const normalizedAnswer = normalizeComparableExpression(rawAnswer, variable);
  const accepted = [expectedExpression, ...acceptedExpressions].map((expression) =>
    normalizeComparableExpression(expression, variable),
  );
  if (accepted.includes(normalizedAnswer)) {
    return { isCorrect: true, mistakeIds: [] };
  }

  const simpleAnswer = normalizeExpression(rawAnswer, variable);
  const mistakeIds: string[] = [];
  if (simpleAnswer.startsWith("-")) {
    mistakeIds.push("negativeExpression");
  }
  if (simpleAnswer === "f" || simpleAnswer.endsWith("=f")) {
    mistakeIds.push("expressionEquals:F");
  }
  if (simpleAnswer.includes("l")) {
    mistakeIds.push("expressionContains:L");
  }
  if (simpleAnswer === "0" || simpleAnswer.endsWith("=0")) {
    mistakeIds.push("expressionEquals:0");
  }

  return {
    isCorrect: false,
    mistakeIds: mistakeIds.length > 0 ? mistakeIds : ["expressionIncorrect"],
  };
};

export const validatePracticeAnswer = (step: PracticeStep, answer: unknown): ValidationResult => {
  const interaction = step.interaction;

  if (interaction.type === "checkbox") {
    const validation = compareIdSets(toStringArray(answer), interaction.correctOptionIds);
    return {
      isCorrect: validation.isCorrect,
      mistakeIds: validation.mistakeIds,
      feedbackMessages: validation.isCorrect ? [step.feedback.correct] : findFeedbackMessages(step, validation.mistakeIds),
    };
  }

  if (interaction.type === "multiple-choice") {
    const selectedId = typeof answer === "string" ? answer : "";
    const mistakeIds = selectedId === interaction.correctOptionId ? [] : [`selected:${selectedId}`];
    return {
      isCorrect: mistakeIds.length === 0,
      mistakeIds,
      feedbackMessages: mistakeIds.length === 0 ? [step.feedback.correct] : findFeedbackMessages(step, mistakeIds),
    };
  }

  if (interaction.type === "canvas-click") {
    const validation = compareIdSets(toStringArray(answer), interaction.correctSelectableIds);
    return {
      isCorrect: validation.isCorrect,
      mistakeIds: validation.mistakeIds,
      feedbackMessages: validation.isCorrect ? [step.feedback.correct] : findFeedbackMessages(step, validation.mistakeIds),
    };
  }

  if (interaction.type === "matching") {
    const selectedPairs = toStringRecord(answer);
    const mistakeIds = Object.entries(interaction.correctPairs).flatMap(([leftId, rightId]) => {
      const selectedRightId = selectedPairs[leftId];
      if (selectedRightId === rightId) {
        return [];
      }
      return selectedRightId === undefined || selectedRightId.length === 0 ? [`missing:${leftId}`] : [`wrong:${leftId}`];
    });

    return {
      isCorrect: mistakeIds.length === 0,
      mistakeIds,
      feedbackMessages: mistakeIds.length === 0 ? [step.feedback.correct] : findFeedbackMessages(step, mistakeIds),
    };
  }

  if (interaction.type === "equation-builder") {
    const validation = validateEquation(interaction, answer);
    return {
      isCorrect: validation.isCorrect,
      mistakeIds: validation.mistakeIds,
      feedbackMessages: validation.isCorrect ? [step.feedback.correct] : findFeedbackMessages(step, validation.mistakeIds),
    };
  }

  const validation = validateExpression(
    interaction.variable,
    interaction.expectedExpression,
    interaction.acceptedExpressions ?? [],
    answer,
  );
  return {
    isCorrect: validation.isCorrect,
    mistakeIds: validation.mistakeIds,
    feedbackMessages: validation.isCorrect ? [step.feedback.correct] : findFeedbackMessages(step, validation.mistakeIds),
  };
};
