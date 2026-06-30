"use client";

import { ReactNode } from "react";

type FilterBarProps = {
  children: ReactNode;
};

export default function FilterBar({ children }: FilterBarProps) {
  return <div className="bl-filter-bar bg-white p-6 rounded-lg shadow mb-6">{children}</div>;
}
