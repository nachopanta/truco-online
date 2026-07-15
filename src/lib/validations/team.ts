import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  logo_url: z
    .string()
    .trim()
    .url("Ingresá una URL válida")
    .optional()
    .or(z.literal("")),
});

export type TeamInput = z.infer<typeof teamSchema>;
