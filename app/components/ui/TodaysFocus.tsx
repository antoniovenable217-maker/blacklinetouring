"use client";

import ActionButton from "@/app/components/ui/ActionButton";

export type FocusSeverity = "critical" | "high" | "medium" | "ready" | "information";

export type FocusItem = {
  id: string;
  severity: FocusSeverity;
  title: string;
  description: string;
  recommendedAction: string;
  actionLabel: string;
  onAction: () => void;
  entityType: string;
  entityId: string | number;
};

type TodaysFocusProps = {
  items: FocusItem[];
};

const severityConfig: Record<FocusSeverity, { borderClass: string; icon: string; iconClass: string }> = {
  critical: { borderClass: "border-l-red-500", icon: "●", iconClass: "text-red-600" },
  high: { borderClass: "border-l-[#b89552]", icon: "●", iconClass: "text-[#8c6a3e]" },
  medium: { borderClass: "border-l-amber-500", icon: "●", iconClass: "text-amber-600" },
  ready: { borderClass: "border-l-emerald-500", icon: "●", iconClass: "text-emerald-600" },
  information: { borderClass: "border-l-slate-500", icon: "●", iconClass: "text-slate-500" },
};

export default function TodaysFocus({ items }: TodaysFocusProps) {
  return (
    <section className="bg-white p-4 rounded-lg shadow mb-5">
      <div className="mb-4">
        <h3 className="text-2xl font-bold">Today&apos;s Focus</h3>
        <p className="text-slate-600 mt-1">The highest-priority items requiring your attention.</p>
      </div>

      {items.length === 0 ? (
        <div className="border rounded-lg p-4 bg-white text-slate-600 text-sm">
          Nothing requires your attention.
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {items.slice(0, 10).map((item) => {
            const config = severityConfig[item.severity];

            return (
              <article
                key={item.id}
                className={`border rounded-lg border-l-4 bg-white px-3 py-2 ${config.borderClass}`}
              >
                <div className="flex items-center gap-3 min-h-[32px]">
                  <div className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold shrink-0 ${config.iconClass}`}>
                    {config.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                    <p className="text-sm text-slate-600 truncate">{item.description}</p>
                  </div>

                  <ActionButton onClick={item.onAction} variant="details" className="shrink-0">
                    {item.actionLabel}
                  </ActionButton>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}