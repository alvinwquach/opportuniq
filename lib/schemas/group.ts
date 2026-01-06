import { z } from "zod";

export const createGroupFormSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(100, "Group name must be 100 characters or less"),
  postalCode: z
    .string()
    .min(3, "Postal code must be at least 3 characters")
    .max(10, "Postal code must be 10 characters or less")
    .optional(),
  defaultSearchRadius: z.coerce
    .number()
    .min(5, "Minimum radius is 5 miles")
    .max(100, "Maximum radius is 100 miles"),
});

export type CreateGroupFormValues = z.infer<typeof createGroupFormSchema>;

export const updateGroupFormSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(100, "Group name must be 100 characters or less"),
  postalCode: z
    .string()
    .min(3, "Postal code must be at least 3 characters")
    .max(10, "Postal code must be 10 characters or less")
    .optional(),
  defaultSearchRadius: z.coerce
    .number()
    .min(5, "Minimum radius is 5 miles")
    .max(100, "Maximum radius is 100 miles"),
});

export type UpdateGroupFormValues = z.infer<typeof updateGroupFormSchema>;
