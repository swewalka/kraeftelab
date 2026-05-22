import type { SemanticExpression, SemanticExpressionNode } from "./types";

type Token =
  | Readonly<{ type: "number"; value: string }>
  | Readonly<{ type: "identifier"; value: string }>
  | Readonly<{ type: "operator"; value: "+" | "-" | "*" | "/" }>
  | Readonly<{ type: "paren"; value: "(" | ")" }>;

const isDigit = (char: string): boolean => char >= "0" && char <= "9";
const isIdentifierStart = (char: string): boolean => /[A-Za-z_]/.test(char);
const isIdentifierPart = (char: string): boolean => /[A-Za-z0-9_]/.test(char);

const tokenize = (source: string): readonly Token[] => {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index] ?? "";
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (isDigit(char) || char === ".") {
      const start = index;
      index += 1;
      while (index < source.length && (isDigit(source[index] ?? "") || source[index] === ".")) {
        index += 1;
      }
      tokens.push({ type: "number", value: source.slice(start, index) });
      continue;
    }

    if (isIdentifierStart(char)) {
      const start = index;
      index += 1;
      while (index < source.length && isIdentifierPart(source[index] ?? "")) {
        index += 1;
      }
      tokens.push({ type: "identifier", value: source.slice(start, index) });
      continue;
    }

    if (char === "+" || char === "-" || char === "*" || char === "/") {
      tokens.push({ type: "operator", value: char });
      index += 1;
      continue;
    }

    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      index += 1;
      continue;
    }

    throw new Error(`Unsupported expression character "${char}" in "${source}".`);
  }

  return tokens;
};

class Parser {
  private index = 0;

  constructor(private readonly tokens: readonly Token[], private readonly source: string) {}

  parse(): SemanticExpressionNode {
    const expression = this.parseSum();
    if (this.peek() !== undefined) {
      throw new Error(`Unexpected token in expression "${this.source}".`);
    }
    return expression;
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private consume(): Token {
    const token = this.tokens[this.index];
    if (!token) {
      throw new Error(`Unexpected end of expression "${this.source}".`);
    }
    this.index += 1;
    return token;
  }

  private parseSum(): SemanticExpressionNode {
    let node = this.parseProduct();
    while (this.peek()?.type === "operator" && (this.peek()?.value === "+" || this.peek()?.value === "-")) {
      const operator = this.consume().value as "+" | "-";
      node = { type: "binary", operator, left: node, right: this.parseProduct() };
    }
    return node;
  }

  private parseProduct(): SemanticExpressionNode {
    let node = this.parseUnary();
    while (this.peek()?.type === "operator" && (this.peek()?.value === "*" || this.peek()?.value === "/")) {
      const operator = this.consume().value as "*" | "/";
      node = { type: "binary", operator, left: node, right: this.parseUnary() };
    }
    return node;
  }

  private parseUnary(): SemanticExpressionNode {
    if (this.peek()?.type === "operator" && this.peek()?.value === "-") {
      this.consume();
      return { type: "unary", operator: "-", argument: this.parseUnary() };
    }
    if (this.peek()?.type === "operator" && this.peek()?.value === "+") {
      this.consume();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): SemanticExpressionNode {
    const token = this.consume();
    if (token.type === "number") {
      const value = Number(token.value);
      if (!Number.isFinite(value)) {
        throw new Error(`Invalid number "${token.value}" in expression "${this.source}".`);
      }
      return { type: "constant", value };
    }

    if (token.type === "identifier") {
      if ((token.value === "sin" || token.value === "cos") && this.peek()?.type === "paren" && this.peek()?.value === "(") {
        this.consume();
        const argument = this.parseSum();
        const close = this.consume();
        if (close.type !== "paren" || close.value !== ")") {
          throw new Error(`Function "${token.value}" in expression "${this.source}" must close with ")".`);
        }
        return { type: "function", name: token.value, argument };
      }
      return { type: "symbol", id: token.value };
    }

    if (token.type === "paren" && token.value === "(") {
      const expression = this.parseSum();
      const close = this.consume();
      if (close.type !== "paren" || close.value !== ")") {
        throw new Error(`Parenthesized expression "${this.source}" must close with ")".`);
      }
      return expression;
    }

    throw new Error(`Unexpected token in expression "${this.source}".`);
  }
}

const collectSymbols = (node: SemanticExpressionNode, symbols: Set<string>) => {
  if (node.type === "symbol") {
    symbols.add(node.id);
    return;
  }
  if (node.type === "unary") {
    collectSymbols(node.argument, symbols);
    return;
  }
  if (node.type === "binary") {
    collectSymbols(node.left, symbols);
    collectSymbols(node.right, symbols);
    return;
  }
  if (node.type === "function") {
    collectSymbols(node.argument, symbols);
  }
};

const normalizeNode = (node: SemanticExpressionNode): string => {
  if (node.type === "constant") {
    return Number.isInteger(node.value) ? String(node.value) : String(node.value);
  }
  if (node.type === "symbol") {
    return node.id;
  }
  if (node.type === "unary") {
    return `-${normalizeNode(node.argument)}`;
  }
  if (node.type === "function") {
    return `${node.name}(${normalizeNode(node.argument)})`;
  }
  return `(${normalizeNode(node.left)}${node.operator}${normalizeNode(node.right)})`;
};

const binaryPrecedence = (operator: "+" | "-" | "*" | "/"): number =>
  operator === "+" || operator === "-" ? 1 : 2;

const shouldParenthesizePlainChild = (
  child: SemanticExpressionNode,
  parentOperator: "+" | "-" | "*" | "/",
  side: "left" | "right",
): boolean => {
  if (child.type !== "binary") {
    return false;
  }
  const parentPrecedence = binaryPrecedence(parentOperator);
  const childPrecedence = binaryPrecedence(child.operator);
  if (childPrecedence < parentPrecedence) {
    return true;
  }
  if (childPrecedence > parentPrecedence) {
    return false;
  }
  return side === "right" && (parentOperator === "-" || parentOperator === "/");
};

export const parseSemanticExpression = (source: string): SemanticExpression => {
  const trimmed = source.trim();
  if (trimmed.length === 0) {
    throw new Error("Semantic expression must be non-empty.");
  }
  const ast = new Parser(tokenize(trimmed), trimmed).parse();
  const symbols = new Set<string>();
  collectSymbols(ast, symbols);
  return {
    source: trimmed,
    normalized: normalizeNode(ast),
    ast,
    symbols: [...symbols],
  };
};

const degreesToRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export const evaluateSemanticExpression = (
  expression: SemanticExpression,
  valuesBySymbol: ReadonlyMap<string, number>,
): number => {
  const evaluateNode = (node: SemanticExpressionNode): number => {
    if (node.type === "constant") {
      return node.value;
    }
    if (node.type === "symbol") {
      const value = valuesBySymbol.get(node.id);
      if (value === undefined) {
        throw new Error(`Semantic expression "${expression.source}" references missing value "${node.id}".`);
      }
      return value;
    }
    if (node.type === "unary") {
      return -evaluateNode(node.argument);
    }
    if (node.type === "binary") {
      const left = evaluateNode(node.left);
      const right = evaluateNode(node.right);
      if (node.operator === "+") {
        return left + right;
      }
      if (node.operator === "-") {
        return left - right;
      }
      if (node.operator === "*") {
        return left * right;
      }
      if (Math.abs(right) < 1e-12) {
        throw new Error(`Semantic expression "${expression.source}" divides by zero.`);
      }
      return left / right;
    }
    const argument = evaluateNode(node.argument);
    return node.name === "sin" ? Math.sin(degreesToRadians(argument)) : Math.cos(degreesToRadians(argument));
  };

  return evaluateNode(expression.ast);
};

export const renderSemanticExpression = (
  expression: SemanticExpression,
  labelsBySymbol: ReadonlyMap<string, string>,
): string => {
  const renderNode = (node: SemanticExpressionNode, parentOperator?: "+" | "-" | "*" | "/"): string => {
    if (node.type === "constant") {
      return Number.isInteger(node.value) ? String(node.value) : String(node.value);
    }
    if (node.type === "symbol") {
      return labelsBySymbol.get(node.id) ?? node.id;
    }
    if (node.type === "unary") {
      return `-${renderNode(node.argument)}`;
    }
    if (node.type === "function") {
      return `\\${node.name}(${renderNode(node.argument)})`;
    }
    if (node.operator === "/") {
      return `\\frac{${renderNode(node.left)}}{${renderNode(node.right)}}`;
    }
    const joiner = node.operator === "*" ? " \\cdot " : ` ${node.operator} `;
    const rendered = `${renderNode(node.left, node.operator)}${joiner}${renderNode(node.right, node.operator)}`;
    return parentOperator === "*" || parentOperator === "/" ? `(${rendered})` : rendered;
  };

  return renderNode(expression.ast);
};

export const renderPlainSemanticExpression = (
  expression: SemanticExpression,
  labelsBySymbol: ReadonlyMap<string, string>,
): string => {
  const renderNode = (
    node: SemanticExpressionNode,
    parentOperator?: "+" | "-" | "*" | "/",
    side: "left" | "right" = "left",
  ): string => {
    if (node.type === "constant") {
      return Number.isInteger(node.value) ? String(node.value) : String(node.value);
    }
    if (node.type === "symbol") {
      return labelsBySymbol.get(node.id) ?? node.id;
    }
    if (node.type === "unary") {
      const rendered = `-${renderNode(node.argument)}`;
      return parentOperator === "*" || parentOperator === "/" ? `(${rendered})` : rendered;
    }
    if (node.type === "function") {
      return `${node.name}(${renderNode(node.argument)})`;
    }

    const rendered = `${renderNode(node.left, node.operator, "left")}${node.operator}${renderNode(node.right, node.operator, "right")}`;
    return parentOperator !== undefined && shouldParenthesizePlainChild(node, parentOperator, side)
      ? `(${rendered})`
      : rendered;
  };

  return renderNode(expression.ast);
};
