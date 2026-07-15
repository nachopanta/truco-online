import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300",
        className
      )}
      {...props}
    />
  );
}

const fieldClasses =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClasses, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClasses, className)} {...props} />;
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-red-600 dark:text-red-400">{children}</p>;
}
