export type LinearSystem = Readonly<{
  coefficients: readonly (readonly number[])[];
  constants: readonly number[];
  unknownIds: readonly string[];
}>;

export type LinearSystemSolution = Readonly<Record<string, number>>;

export const solveThreeByThree = (system: LinearSystem): LinearSystemSolution => {
  if (system.coefficients.length !== 3 || system.constants.length !== 3 || system.unknownIds.length !== 3) {
    throw new Error("solveThreeByThree expects exactly three equations and three unknowns.");
  }

  const matrix = system.coefficients.map((row, index) => {
    if (row.length !== 3) {
      throw new Error("Each coefficient row must contain exactly three values.");
    }
    return [...row, system.constants[index] ?? 0];
  });

  for (let pivotIndex = 0; pivotIndex < 3; pivotIndex += 1) {
    let maxRow = pivotIndex;
    for (let row = pivotIndex + 1; row < 3; row += 1) {
      if (Math.abs(matrix[row]?.[pivotIndex] ?? 0) > Math.abs(matrix[maxRow]?.[pivotIndex] ?? 0)) {
        maxRow = row;
      }
    }

    const pivotRow = matrix[maxRow];
    const currentRow = matrix[pivotIndex];
    if (!pivotRow || !currentRow) {
      throw new Error("Invalid linear system matrix.");
    }

    [matrix[pivotIndex], matrix[maxRow]] = [pivotRow, currentRow];

    const pivot = matrix[pivotIndex]?.[pivotIndex] ?? 0;
    if (Math.abs(pivot) < 1e-9) {
      throw new Error("Linear system is singular or ill-conditioned.");
    }

    for (let col = pivotIndex; col < 4; col += 1) {
      matrix[pivotIndex]![col] = (matrix[pivotIndex]![col] ?? 0) / pivot;
    }

    for (let row = 0; row < 3; row += 1) {
      if (row === pivotIndex) {
        continue;
      }

      const factor = matrix[row]?.[pivotIndex] ?? 0;
      for (let col = pivotIndex; col < 4; col += 1) {
        matrix[row]![col] = (matrix[row]![col] ?? 0) - factor * (matrix[pivotIndex]![col] ?? 0);
      }
    }
  }

  return {
    [system.unknownIds[0] as string]: matrix[0]?.[3] ?? 0,
    [system.unknownIds[1] as string]: matrix[1]?.[3] ?? 0,
    [system.unknownIds[2] as string]: matrix[2]?.[3] ?? 0,
  };
};
