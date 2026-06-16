import { z } from 'zod';

export const instructorApplicationSchema = z.object({
  bio: z.string()
    .min(50, 'Tell us a bit more — at least 50 characters.')
    .max(2000, 'Keep it under 2000 characters.'),
  experience: z.string()
    .min(50, 'Tell us a bit more — at least 50 characters.')
    .max(2000, 'Keep it under 2000 characters.'),
});

export type InstructorApplicationFormValues = z.infer<typeof instructorApplicationSchema>;