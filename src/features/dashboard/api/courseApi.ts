import type { CourseApiPayload } from "../schema/CourseFormSchema";
import axiosInstance from "../../../shared/api/axiosInstance";

// 1. Fetch Tags API
// This function fetches the available tags for the multi-select dropdown
export const fetchCourseTags = async () => {
    try {
        const response = await axiosInstance.get('/api/Tags/active');
        return response.data;

    } catch (error) {
        console.error("Error fetching tags:", error);
        throw new Error("Could not load tags");
    }
};

// 2. Save Course Step 1 API
// This function sends the FormData to the backend
export const saveCourseStep1 = async (formData: CourseApiPayload, courseId: string | null) => {
    try {
        if (!courseId) {
            // Create a new draft course
            const response = await axiosInstance.post('/api/Courses', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data; 
        } else {
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
    sections: any;
    keyId: string | null;
    title: string | null;
    description: string | null;
    instructorName: string | null;
    imageUrl: string | null;
    price: number;
    tags: number[]; 
    learningOutcomes: string[];
    prerequisites: string[];
    isActive:boolean

}

export const fetchCourseMetadata = async (courseId: string): Promise<CourseMetadataResponse> => {
    const response = await axiosInstance.get(`/api/Courses/${courseId}/metadata`);
    return response.data; 
};

// 3. Create Course Section API
export interface CreateCourseSectionPayload {
    title: string;
    position: number;
}

export const createCourseSection = async (courseId: string, sectionData: CreateCourseSectionPayload) => {
    const response = await axiosInstance.post(`/api/courses/${courseId}/sections`, sectionData);
    return response.data; 
};

// 4. Update Course Section API
export const updateCourseSection = async ( sectionId: string, sectionData: CreateCourseSectionPayload) => {
    const response = await axiosInstance.put(`/api/sections/${sectionId}`, sectionData);
    return response.data; 
};

// 5. Delete Course Section API
export const deleteCourseSection = async (sectionId: number) => {
    const response = await axiosInstance.delete(`/api/sections/${sectionId}`);
    return response.data; 
};

export const publishCourse = async ({courseId}: { courseId: string }) => {
    try {
        const response = await axiosInstance.post(`/api/Courses/${courseId}/activate`);
        console.log("from publish course api", response.data);
        return response.data;
    } catch (error: any) {
        console.log("422 details:", error.response?.data);
        throw error;
    }
};

export const publishLesson = async (lessonId: string) => {
    const response = await axiosInstance.put(`/api/Lessons/${lessonId}/privacy`, {
        isVideoPrivate: false,
        isPreview: false,
        isPubliclyVisible: true
    });
    return response.data;
};

export const getSectionLessons = async (sectionId: string) => {
    const response = await axiosInstance.get(`/api/Lessons/section/${sectionId}`);
    return response.data;
};

export const getCourseListDashboard = async ({PageNumber, PageSize}: { PageNumber: number; PageSize: number }) => {
    const response = await axiosInstance.get(`/api/Courses/my/editable?pageNumber=${PageNumber}&pageSize=${PageSize}`);
    console.log("from get course list api", response.data)
    return response.data; 
};

export const deleteCourse = async (courseId:string ) => {
    const response = await axiosInstance.delete(`/api/Courses/${courseId}`);
    console.log("from get course list api", response.data)
    return response.data; 
};

// ============================================================================
// ========================= Video Upload APIs ================================
// ============================================================================

export interface VideoSignatureRequest {
    fileName: string;
    fileSize: number;
    mimeType: string;
}

export interface SignedVideoUploadResponse {
    allowedFormats:string
    apiKey: string;
    cloudName: string;
    folder: string;
    maxFileSize: number;
    publicId: string;
    signature: string;
    timestamp: number;
    uploadUrl?: string;
}

export const getVideoUploadSignature = async (lessonId: string, payload: VideoSignatureRequest): Promise<SignedVideoUploadResponse> => {
    const response = await axiosInstance.post(`/api/Lessons/${lessonId}/video/signed-upload`, payload);
    return response.data;
};

export interface SaveVideoMetadataPayload {
    publicId: string;
    videoUrl: string;        
    durationSeconds: number; 
    fileSize: number;
    format: string;
}

export const saveLessonVideoMetadata = async (lessonId: string, payload: SaveVideoMetadataPayload) => {
    const response = await axiosInstance.post(`/api/Lessons/${lessonId}/video/finalize`, payload);
    console.log("Saved lesson video metadata", response);
    return response.data;
};

// ============================================================================
// ========================= Items / Lessons API ==============================
// ============================================================================

export interface CreateLessonPayload {
    title: string;
    type: number;
    position: number;
}

// ⭐ FIX: Modified to return response.data to avoid undefined issues later
export const createSectionItem = async (sectionId: number, payload: CreateLessonPayload) => {
    const response = await axiosInstance.post(`/api/Lessons/${sectionId}/init`, payload); 
    console.log("createSectionItem response", response.data);
    return response.data; 
};

export const deleteLesson = async (lessonId: number) => {
    const response = await axiosInstance.delete(`/api/Lessons/${lessonId}`); 
    return response.data; 
};

// ================= Update Article Content API =================
export interface UpdateArticlePayload {
    htmlContent: string | null;
}

export const updateLessonArticle = async (lessonId: number, payload: UpdateArticlePayload) => {
    const response = await axiosInstance.put(`/api/Lessons/${lessonId}/article`, payload);
    console.log("updateLessonArticle response", response.data);
    return response.data;
};


// ================= Course Activation APIs =================
export const activateCourse = async ({courseId}: { courseId: string }) => {
    const response = await axiosInstance.post(`/api/Courses/${courseId}/activate`);
    return response.data;
};



export const deactivateCourse = async ({courseId}: { courseId: string }) => {
    const response = await axiosInstance.post(`/api/Courses/${courseId}/deactivate`);
    return response.data;
};