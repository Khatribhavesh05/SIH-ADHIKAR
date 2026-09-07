import { STAGES, stageOrder, type ProjectStage } from "@/lib/domain/stages";

export function StageTracker({
  currentStage,
  compact = false,
}: {
  currentStage: ProjectStage;
  compact?: boolean;
}) {
  const currentOrder = stageOrder(currentStage);

  return (
    <div className="w-full overflow-x-auto">
      <ol className="flex items-start min-w-max">
        {STAGES.map((stage, idx) => {
          const isDone = stage.order < currentOrder;
          const isCurrent = stage.order === currentOrder;
          const isLast = idx === STAGES.length - 1;

          return (
            <li key={stage.key} className="flex items-start">
              <div
                className={`flex flex-col items-center ${compact ? "w-[4.25rem]" : "w-24"}`}
                title={`${stage.order} — ${stage.shortLabel}: ${stage.description}`}
              >
                <div
                  className={`flex items-center justify-center rounded-full border font-mono-data text-xs cursor-default ${
                    compact ? "w-6 h-6" : "w-8 h-8"
                  } ${
                    isDone
                      ? "bg-green text-white border-green"
                      : isCurrent
                      ? "bg-brand text-white border-brand"
                      : "bg-paper text-ink-muted border-hairline-strong"
                  }`}
                >
                  {isDone ? "✓" : stage.order}
                </div>
                <div
                  className={`mt-2 text-center leading-tight px-0.5 ${
                    compact ? "text-[9px]" : "text-[11px]"
                  } ${
                    isCurrent
                      ? "text-ink font-medium"
                      : compact
                      ? "text-ink-muted/70"
                      : "text-ink-muted"
                  }`}
                >
                  {stage.shortLabel}
                </div>
              </div>
              {!isLast && (
                <div
                  className={`${compact ? "w-3" : "w-6"} h-px shrink-0 ${
                    isDone ? "bg-green" : "bg-hairline-strong"
                  }`}
                  style={{ marginTop: compact ? "11px" : "15px" }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
