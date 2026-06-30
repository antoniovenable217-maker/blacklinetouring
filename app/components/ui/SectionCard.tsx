"use client";

import { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export default function SectionCard({
  title,
  subtitle,
  children,
  action,
  className,
}: SectionCardProps) {
  const rootClass = `bl-work-area bg-white p-6 rounded-lg shadow ${className || ""}`.trim();

  return (
    <section className={rootClass}>
      {(title || subtitle || action) && (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
          <div>
            {title ? <h3 className="text-2xl font-bold mb-1">{title}</h3> : null}
            {subtitle ? <p className="text-slate-600 text-sm">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
