export const normalizePracticeLabel = (label: string): string =>
  label
    .replaceAll("\\alpha", "alpha")
    .replaceAll("\\", "")
    .replaceAll("{", "")
    .replaceAll("}", "");

export const normalizePracticeFactor = (factor?: string): string => {
  if (factor === undefined || factor.length === 0) {
    return "";
  }
  return normalizePracticeLabel(factor)
    .replaceAll(" ", "")
    .replaceAll("·", "*")
    .toLowerCase();
};
