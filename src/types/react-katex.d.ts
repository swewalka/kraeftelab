declare module "react-katex" {
  import type { ComponentType, ReactNode } from "react";

  export type MathComponentProps = Readonly<{
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
  }>;

  export const InlineMath: ComponentType<MathComponentProps>;
  export const BlockMath: ComponentType<MathComponentProps>;
}
