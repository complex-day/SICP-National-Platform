import { z } from "zod";

export const locationSchema = z.object({
  lat: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  lng: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
  address_text: z.string().max(255).optional(),
  district: z.string().max(150).optional(),
  state: z.string().max(100).optional(),
});

export const challengeFormSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(500, "Title cannot exceed 500 characters"),
  description: z
    .string()
    .min(30, "Description must be at least 30 characters")
    .max(5000, "Description cannot exceed 5000 characters"),
  category: z.string().min(1, "Please select a category"),
  subcategory: z.string().max(100).optional(),
  affected_population: z
    .number({ invalid_type_error: "Please enter an integer" })
    .int("Population must be an integer")
    .positive("Affected population must be greater than 0")
    .max(10000000, "Population exceeds allowable limit"),
  location: locationSchema,
  status: z.enum(["draft", "submitted"]).default("draft"),
  visibility: z.enum(["PRIVATE", "INSTITUTION", "PUBLIC", "ARCHIVED"]).default("PUBLIC"),
});

export type ChallengeFormValues = z.infer<typeof challengeFormSchema>;
