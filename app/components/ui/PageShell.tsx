"use client";

import { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return <div className="bl-page">{children}</div>;
}
