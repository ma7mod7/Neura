import axiosInstance from '../../../shared/api/axiosInstance';
// ================= Lessons =================

export const getLessonVideoLink = async (lessonId: string) => {
    const res = await axiosInstance.get(`/api/Lessons/${lessonId}/video/link`);
    return res.data;
};

export const getLessonArticle = async (lessonId: string) => {
    const res = await axiosInstance.get(`/api/Lessons/${lessonId}/article`);
    return res.data; 
};
// ================= Courses =================
export const getCourseContent = async (courseId: string) => {
    const res = await axiosInstance.get(`/api/Courses/${courseId}/content`);
    console.log("course content",res.data)
    return res.data;
};

export const getCourseMetadata = async (courseId: string) => {
    const res = await axiosInstance.get(`/api/Courses/${courseId}/metadata`);
    return res.data;
};

export const completeCourse = async (courseId: string) => {
    const res = await axiosInstance.post(`/api/Courses/${courseId}/complete`);
    return res.data;
};

export const completeLesson = async (lessonId: string) => {
    try {
        const res = await axiosInstance.post(`/api/Lessons/${lessonId}/complete`);
        return res.data;
    } catch {
        // Endpoint may not exist on all backends — fail silently
        return null;
    }
};
