import { useMutation } from "@tanstack/react-query";
// import axiosInstance from "@/lib/axios"; // استورد الـ instance بتاعك
import type { CourseFormValues } from "../schema/courseSchema";

// دي دالة وهمية، استبدلها بالـ API Call الحقيقي بتاعك
const createCourseApi = async (data: CourseFormValues) => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("instructor", data.instructor);
    formData.append("duration", data.duration);
    formData.append("price", data.price.toString());
    formData.append("category", data.category);

    if (data.thumbnail && data.thumbnail[0]) {
        formData.append("image", data.thumbnail[0]);
    }

    // محاكاة لنجاح العملية (شيل ده لما تربط بالباك اند)
    return new Promise((resolve) => setTimeout(resolve, 2000));
};

export const useCreateCourse = () => {

    return useMutation({
        mutationFn: createCourseApi,
        onSuccess: () => {
            // Invalidate queries to refresh the list
            // queryClient.invalidateQueries({ queryKey: ['courses'] });
            console.log("Course created successfully!");
        },
        onError: (error) => {
            console.error("Failed to create course", error);
        }
    });
};