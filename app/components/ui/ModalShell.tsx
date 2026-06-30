"use client";

import { ReactNode } from "react";

type ModalShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  className?: string;
};

export default function ModalShell({
  title,
  subtitle,
  children,
  footer,
  onClose,
  className,
}: ModalShellProps) {
  const panelClass =
    `lux-modal bg-white rounded-lg shadow-2xl w-full max-w-5xl p-6 md:p-8 max-h-[90vh] overflow-y-auto ${
      className || ""
    }`.trim();

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4">
      <div className={panelClass}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-2xl font-bold">{title}</h3>
            {subtitle ? <p className="text-sm text-slate-600 mt-1">{subtitle}</p> : null}
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="border border-slate-300 px-4 py-2 rounded text-sm font-semibold"
            >
              Close
            </button>
          ) : null}
        </div>

        <div>{children}</div>

        {footer ? <div className="mt-6 flex justify-end items-center gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
