export type SemanticUnit = "dimensionless" | "m" | "N" | "N*m" | "deg";

export type SemanticEquationPurpose = "sumForceX" | "sumForceY" | "sumMoment" | "derivedResult";

export type SemanticEquationScope =
  | Readonly<{ kind: "wholeSystem"; scopeId?: string }>
  | Readonly<{ kind: "body"; bodyId: string; scopeId?: string }>
  | Readonly<{ kind: "bodyGroup"; bodyIds: readonly string[]; scopeId?: string }>;

export type SemanticExpressionNode =
  | Readonly<{ type: "constant"; value: number }>
  | Readonly<{ type: "symbol"; id: string }>
  | Readonly<{ type: "unary"; operator: "-"; argument: SemanticExpressionNode }>
  | Readonly<{ type: "binary"; operator: "+" | "-" | "*" | "/"; left: SemanticExpressionNode; right: SemanticExpressionNode }>
  | Readonly<{ type: "function"; name: "sin" | "cos"; argument: SemanticExpressionNode }>;

export type SemanticExpression = Readonly<{
  source: string;
  normalized: string;
  ast: SemanticExpressionNode;
  symbols: readonly string[];
}>;

export type SemanticEquationTerm = Readonly<{
  id: string;
  sign: "+" | "-";
  unit: SemanticUnit;
  quantityId?: string;
  parameterId?: string;
  componentId?: string;
  factor?: SemanticExpression;
  mechanicsObjectIds: readonly string[];
  latex?: string;
}>;

export type SemanticEquationSide =
  | Readonly<{ kind: "expression"; expression: SemanticExpression }>
  | Readonly<{ kind: "terms"; terms: readonly SemanticEquationTerm[] }>;

export type SemanticEquation = Readonly<{
  id: string;
  purpose: SemanticEquationPurpose;
  scope: SemanticEquationScope;
  unit: SemanticUnit;
  momentPointId?: string;
  lhs: SemanticEquationSide;
  rhs: SemanticEquationSide;
  displayLatex?: string;
}>;

export type SemanticQuantityValue = Readonly<{
  id: string;
  label: string;
  value: number;
  unit: SemanticUnit;
}>;

export type SemanticEquationEvaluation = Readonly<{
  id: string;
  symbolic: string;
  residual: number;
}>;
