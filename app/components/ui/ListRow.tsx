"use client";

import { ReactNode } from "react";

type ListRowProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function ListRow({ children, className, onClick }: ListRowProps) {
  const rootClass =
    `border rounded-lg px-3 py-1 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-1.5 shadow-sm hover:shadow ${
      className || ""
    }`.trim();

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rootClass}>
        {children}
      </button>
    );
  }

  return <article className={rootClass}>{children}</article>;
}
