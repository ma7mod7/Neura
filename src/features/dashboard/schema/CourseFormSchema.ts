import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const courseSchema = z.object({
    Title: z.string().min(1, "Course Title is required"),
    description: z.string().min(1, "Description is required"),
    price: z.string().min(1, "Put the Price Of Course"),
    instructorName: z.string().min(1, "Instructor Name is required"),

    // Zod array for dynamic inputs
    LearningOutcomes: z.array(z.object({ value: z.string().min(1, "Required") })).min(1, "Add at least one outcome"),
    Prerequisites: z.array(z.object({ value: z.string().min(1, "Required") })).min(1, "Add at least one prerequisite"),
    // غير السطر ده
    Tags: z.array(z.number()).min(1, "Please select at least one tag"),
    // ======== الحقل الجديد للصورة ========
    Image: z.any()
        .refine((file) => file instanceof File, "Course Photo is required")
        .refine((file) => file?.size <= MAX_FILE_SIZE, "Max image size is 5MB.")
        .refine(
            (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        ).optional(),
});

export type CourseSchemaTypes = z.infer<typeof courseSchema>;