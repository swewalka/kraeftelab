import type { ReactNode } from "react";
import { DraftingCompass } from "lucide-react";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export const AppShell = ({ children }: AppShellProps) => (
  <div className="min-h-screen min-w-[1180px] bg-paper text-ink">
    <header className="border-b border-ink/15 bg-paper/95">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-ink/20 bg-white">
          <DraftingCompass className="h-5 w-5 text-signal" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-steel">Statics MVP</p>
          <h1 className="text-xl font-semibold tracking-normal">Mechanics Playground</h1>
        </div>
      </div>
    </header>
    <main className="h-[calc(100vh-4rem)] overflow-hidden">{children}</main>
  </div>
);
