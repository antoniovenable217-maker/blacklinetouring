"use client";

import { ReactNode } from "react";

type BadgeTone = "success" | "warning" | "danger" | "info" | "archived" | "premium";

type StatusBadgeProps = {
  children: ReactNode;
  tone: BadgeTone;
};

const toneClassMap: Record<BadgeTone, string> = {
  success: "bl-badge-success",
  warning: "bl-badge-warning",
  danger: "bl-badge-danger",
  info: "bl-badge-info",
  archived: "bl-badge-archived",
  premium: "bl-badge-info",
};

export default function StatusBadge({ children, tone }: StatusBadgeProps) {
  return (
    <span
      className={`${toneClassMap[tone]} inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold`}
    >
      {children}
    </span>
  );
}
