"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "details"
  | "edit"
  | "save"
  | "danger"
  | "cancel";

type ActionButtonProps = {
  children: ReactNode;
  variant: ButtonVariant;
  className?: string;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type" | "disabled">;

const variantClassMap: Record<ButtonVariant, string> = {
  primary: "lux-primary-button text-white px-4 py-2 rounded font-semibold",
  secondary: "lux-secondary-button px-4 py-2 rounded font-semibold",
  details: "lux-details-button text-white px-3 py-1 rounded text-sm font-semibold",
  edit: "bg-yellow-500 text-white px-4 py-2 rounded font-semibold",
  save: "bg-emerald-600 text-white px-4 py-2 rounded font-semibold",
  danger: "bg-red-700 text-white px-4 py-2 rounded font-semibold",
  cancel: "border border-slate-300 px-4 py-2 rounded font-semibold",
};

export default function ActionButton({
  children,
  variant,
  onClick,
  type = "button",
  disabled,
  className,
}: ActionButtonProps) {
  const classes = `${variantClassMap[variant]} ${className || ""}`.trim();

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
