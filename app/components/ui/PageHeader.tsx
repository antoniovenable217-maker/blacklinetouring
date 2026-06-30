"use client";

import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  action?: ReactNode;
};

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="bl-page-header bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="text-slate-600 mt-1">{subtitle}</p>
        </div>
        {action ? <div className="self-start md:self-auto">{action}</div> : null}
      </div>
    </div>
  );
}
