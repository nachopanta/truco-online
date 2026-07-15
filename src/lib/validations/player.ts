import { z } from "zod";

export const playerSchema = z.object({
  first_name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().trim().min(2, "El apellido debe tener al menos 2 caracteres"),
  document: z.string().trim().optional().or(z.literal("")),
});

export type PlayerInput = z.infer<typeof playerSchema>;
