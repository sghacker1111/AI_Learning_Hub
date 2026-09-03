import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  // Administrative roles are assigned only by an authenticated administrator.
  role: z.enum(["STUDENT", "PARENT"]).default("STUDENT"),
  gradeId: z.string().trim().max(64).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
