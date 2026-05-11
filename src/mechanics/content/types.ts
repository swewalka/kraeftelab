export type ContentBlock =
  | Readonly<{
      type: "paragraph";
      text: string;
    }>
  | Readonly<{
      type: "math";
      latex: string;
      display?: "block" | "inline";
      tone?: "default" | "result";
    }>
  | Readonly<{
      type: "list";
      items: readonly string[];
    }>;
