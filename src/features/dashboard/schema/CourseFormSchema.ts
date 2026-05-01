import z from "zod";



export const courseSchema = z.object({
    Title: z.string().min(1, "Course Title is required"),
    description: z.string().min(1, "Description is required"),
    price: z.string().min(1, "Price is required"),
    instructorName: z.string().min(1, "Instructor Name is required"),
    LearningOutcomes: z.array(z.object({ value: z.string().min(1, "Required") })).min(1, "Add at least one outcome"),
    Prerequisites: z.array(z.object({ value: z.string().min(1, "Required") })).min(1, "Add at least one prerequisite"),
    Tags: z.array(z.number()).min(1, "Please select at least one tag"),
    // جعل الصورة اختيارية لضمان عدم اعتراض النوع عند عدم رفع ملف جديد
    Image: z.any().optional(), 
});

export type CourseSchemaTypes = z.infer<typeof courseSchema>;

export type CourseApiPayload = Omit<CourseSchemaTypes, "LearningOutcomes" | "Prerequisites"> & {
    LearningOutcomes: string[];
    Prerequisites: string[];
};