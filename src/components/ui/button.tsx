import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-600/50",
  secondary:
    "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white",
  outline:
    "border border-neutral-300 text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800",
  ghost:
    "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function LinkButton({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
    </Link>
  );
}
