import { z } from "zod";

export const seasonSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  year: z.coerce.number().int().min(2000).max(2100),
  status: z.enum(["planificada", "activa", "finalizada"]),
  start_date: z.string().trim().optional().or(z.literal("")),
  end_date: z.string().trim().optional().or(z.literal("")),
  champion_team_id: z.string().trim().optional().or(z.literal("")),
});

export type SeasonInput = z.infer<typeof seasonSchema>;

export const divisionSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  promotion_slots: z.coerce.number().int().min(0).max(10),
  relegation_slots: z.coerce.number().int().min(0).max(10),
});

export type DivisionInput = z.infer<typeof divisionSchema>;
