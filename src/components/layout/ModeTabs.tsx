import { BookOpen, PencilRuler, Target } from "lucide-react";

export type AppMode = "explore" | "explain" | "practice";

const modes: readonly { id: AppMode; label: string; icon: typeof BookOpen }[] = [
  { id: "explore", label: "Explore", icon: BookOpen },
  { id: "explain", label: "Solve", icon: PencilRuler },
  { id: "practice", label: "Practice", icon: Target },
];

type ModeTabsProps = Readonly<{
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}>;

export const ModeTabs = ({ activeMode, onModeChange }: ModeTabsProps) => (
  <div className="inline-flex rounded-md border border-ink/15 bg-white p-1 shadow-sm" role="tablist" aria-label="Learning modes">
    {modes.map((mode) => {
      const Icon = mode.icon;
      const isActive = mode.id === activeMode;

      return (
        <button
          key={mode.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          className={[
            "flex min-h-10 items-center gap-2 rounded px-3 text-sm font-medium transition",
            isActive ? "bg-ink text-white" : "text-steel hover:bg-ink/5 hover:text-ink",
          ].join(" ")}
          onClick={() => onModeChange(mode.id)}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {mode.label}
        </button>
      );
    })}
  </div>
);
