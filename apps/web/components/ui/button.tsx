import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
};

const variantClasses = {
  default:
    "border-transparent bg-[var(--accent)] text-white hover:bg-[#1f5848]",
  outline:
    "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--accent)]",
  ghost:
    "border-transparent bg-transparent text-[var(--accent)] hover:bg-[var(--accent-soft)]",
};

const sizeClasses = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-xs",
};

export function Button({
  className,
  type = "button",
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-full border font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
