export type LinearSystem = Readonly<{
  coefficients: readonly (readonly number[])[];
  constants: readonly number[];
  unknownIds: readonly string[];
}>;

export type LinearSystemSolution = Readonly<Record<string, number>>;

const assertUniqueIds = (ids: readonly string[]) => {
  const seen = new Set<string>();
  ids.forEach((id) => {
    if (seen.has(id)) {
      throw new Error(`Linear system contains duplicate unknown id "${id}".`);
    }
    seen.add(id);
  });
};

export const solveLinearSystem = (system: LinearSystem): LinearSystemSolution => {
  const size = system.unknownIds.length;
  if (size === 0) {
    throw new Error("Linear system requires at least one unknown.");
  }
  assertUniqueIds(system.unknownIds);
  if (system.coefficients.length !== size || system.constants.length !== size) {
    throw new Error(
      `Linear system must be square: received ${system.coefficients.length} equations, ${system.constants.length} constants, and ${size} unknowns.`,
    );
  }

  const matrix = system.coefficients.map((row, index) => {
    if (row.length !== size) {
      throw new Error(`Linear system row ${index} contains ${row.length} coefficients, expected ${size}.`);
    }
    return [...row, system.constants[index] ?? 0];
  });

  for (let pivotIndex = 0; pivotIndex < size; pivotIndex += 1) {
    let maxRow = pivotIndex;
    for (let row = pivotIndex + 1; row < size; row += 1) {
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
      throw new Error(`Linear system is singular or ill-conditioned near unknown "${system.unknownIds[pivotIndex]}".`);
    }

    for (let col = pivotIndex; col < size + 1; col += 1) {
      matrix[pivotIndex]![col] = (matrix[pivotIndex]![col] ?? 0) / pivot;
    }

    for (let row = 0; row < size; row += 1) {
      if (row === pivotIndex) {
        continue;
      }

      const factor = matrix[row]?.[pivotIndex] ?? 0;
      for (let col = pivotIndex; col < size + 1; col += 1) {
        matrix[row]![col] = (matrix[row]![col] ?? 0) - factor * (matrix[pivotIndex]![col] ?? 0);
      }
    }
  }

  return Object.fromEntries(system.unknownIds.map((id, index) => [id, matrix[index]?.[size] ?? 0]));
};

export const solveThreeByThree = (system: LinearSystem): LinearSystemSolution => {
  if (system.coefficients.length !== 3 || system.constants.length !== 3 || system.unknownIds.length !== 3) {
    throw new Error("solveThreeByThree expects exactly three equations and three unknowns.");
  }
  return solveLinearSystem(system);
};
