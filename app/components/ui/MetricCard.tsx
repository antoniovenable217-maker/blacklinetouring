"use client";

type MetricTone =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "premium"
  | "archived";

type MetricCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  tone?: MetricTone;
};

const toneClassMap: Record<MetricTone, string> = {
  default: "border-slate-200 bg-white text-slate-900",
  success: "border-green-200 bg-green-50/50 text-green-900",
  warning: "border-amber-200 bg-amber-50/50 text-amber-900",
  danger: "border-red-200 bg-red-50/50 text-red-900",
  premium: "border-[#d4bf90] bg-[#f4f1eb] text-[#8c6a3e]",
  archived: "border-slate-300 bg-slate-50/70 text-slate-700",
};

export default function MetricCard({
  label,
  value,
  subtitle,
  tone = "default",
}: MetricCardProps) {
  return (
    <div className={`border rounded-lg p-3 ${toneClassMap[tone]}`}>
      <p className="text-xs uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subtitle ? <p className="text-xs mt-1 text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
