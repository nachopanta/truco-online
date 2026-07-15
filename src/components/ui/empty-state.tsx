import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <Icon className="size-8 text-neutral-400 dark:text-neutral-600" />
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-500">{description}</p>
      )}
      {action}
    </div>
  );
}
