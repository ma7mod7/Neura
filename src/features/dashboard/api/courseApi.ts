import type { CourseSchemaTypes } from "../schema/CourseFormSchema";
import axiosInstance from "../../../shared/api/axiosInstance";



// 1. Fetch Tags API
// This function fetches the available tags for the multi-select dropdown
export const fetchCourseTags = async () => {
    try {
        // TODO: Replace with your actual backend endpoint
        const response = await axiosInstance.get('/api/Tags/active');
        return response.data;

    } catch (error) {
        console.error("Error fetching tags:", error);
        throw new Error("Could not load tags");
    }
};

// 2. Save Course Step 1 API
// This function sends the FormData to the backend
export const saveCourseStep1 = async (formData: CourseSchemaTypes, courseId: string | null) => {
    try {
        if (!courseId) {
            // Create a new draft course
            const response = await axiosInstance.post('/api/Courses', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data; 


        } else {
            console.log("hello from save course step 1 api", formData, courseId)
            // Update existing draft course
            const response = await axiosInstance.put(`/api/Courses/${courseId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;

        }
    } catch (error) {
        console.error("Error saving course details:", error);
        throw new Error("Could not save course details");
    }
};


export interface CourseMetadataResponse {
    keyId: string | null;
    title: string | null;
    description: string | null;
    instructorName: string | null;
    imageUrl: string | null;
    price: number;
    tags: number[]; 
    learningOutcomes: string[];
    prerequisites: string[];
    
}


export const fetchCourseMetadata = async (courseId: string): Promise<CourseMetadataResponse> => {
    const response = await axiosInstance.get(`/api/Courses/${courseId}/metadata`);
    return response.data; 
};