"use client";

type EmptyStateProps = {
  title: string;
  subtitle?: string;
};

export default function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <div className="border rounded-lg p-4 text-sm text-slate-600 bg-slate-50 text-center">
      <p className="font-semibold text-slate-700">{title}</p>
      {subtitle ? <p className="mt-1">{subtitle}</p> : null}
    </div>
  );
}
