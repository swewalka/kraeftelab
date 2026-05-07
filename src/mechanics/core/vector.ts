export type Vector2 = Readonly<{
  x: number;
  y: number;
}>;

export const vector = (x: number, y: number): Vector2 => ({ x, y });

export const addVectors = (a: Vector2, b: Vector2): Vector2 => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const scaleVector = (value: Vector2, scalar: number): Vector2 => ({
  x: value.x * scalar,
  y: value.y * scalar,
});
