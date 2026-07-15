"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteButton({
  action,
  confirmMessage = "¿Seguro que querés eliminar este registro?",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(() => action());
        }
      }}
      className="flex size-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
      aria-label="Eliminar"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
