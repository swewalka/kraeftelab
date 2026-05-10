const replacements: readonly [RegExp, string][] = [
  [/\\sum\s*F_x/g, "ΣFₓ"],
  [/\\sum\s*F_y/g, "ΣFᵧ"],
  [/\\sum\s*M_A/g, "ΣMₐ"],
  [/\\frac\{L\}\{2\}/g, "L/2"],
  [/\\frac\{F\}\{2\}/g, "F/2"],
  [/\\alpha/g, "α"],
  [/\\sin/g, "sin"],
  [/\\cos/g, "cos"],
  [/\\cdot/g, "·"],
  [/_x/g, "ₓ"],
  [/_y/g, "ᵧ"],
  [/_A/g, "ₐ"],
  [/_B/g, "ᵦ"],
];

export const formatCanvasMathLabel = (label: string): string =>
  replacements.reduce((formatted, [pattern, replacement]) => formatted.replace(pattern, replacement), label);
