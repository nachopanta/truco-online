import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Division } from "@/types/database.types";

export function DivisionTabs({
  divisions,
  activeDivisionId,
  basePath,
}: {
  divisions: Division[];
  activeDivisionId: string;
  basePath: string;
}) {
  if (divisions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
      {divisions.map((division) => (
        <Link
          key={division.id}
          href={`${basePath}?division=${division.id}`}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            division.id === activeDivisionId
              ? "bg-emerald-600 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          )}
        >
          {division.name}
        </Link>
      ))}
    </div>
  );
}
