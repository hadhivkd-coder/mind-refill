import { z } from "zod";

/**
 * Common shared Zod validators
 */
export const CommonValidations = {
  uuid: z.string().uuid("Invalid UUID identifier"),
  email: z.string().email("Invalid email address").max(255),
  currency: z.string().length(3).regex(/^[A-Z]{3}$/, "Currency must be 3 uppercase letters"),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
};
