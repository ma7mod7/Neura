import { z } from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const courseSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    instructor: z.string().min(3, "Instructor name is required"),
    duration: z.string().min(1, "Duration is required (e.g., 45h)"),
    price: z.coerce.number().min(0, "Price cannot be negative"), 
    category: z.string().min(1, "Please select a category"),

    thumbnail: z
        .any()
        .refine((files) => files?.length >= 1, "Thumbnail is required")
        .refine(
            (files) => files?.[0]?.size <= MAX_FILE_SIZE,
            `Max file size is 5MB.`
        )
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        ),
});

export type CourseFormValues = z.infer<typeof courseSchema>;