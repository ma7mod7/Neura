import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCourseContent,
    getCourseMetadata,
    getLessonVideoLink,
    getLessonArticle,
    completeCourse,
    completeLesson,
    getNextLesson,
} from './coursePlayerApi';

// ================= Course =================
export const useGetCourseContent = (courseId: string) =>
    useQuery({
        queryKey: ['courseContent', courseId],
        queryFn: () => getCourseContent(courseId),
        enabled: !!courseId,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

export const useGetCourseMetadata = (courseId: string) =>
    useQuery({
        queryKey: ['courseMetadata', courseId],
        queryFn: () => getCourseMetadata(courseId),
        enabled: !!courseId,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

export const useGetNextLesson = (courseId: string) =>
    useQuery({
        queryKey: ['nextLesson', courseId],
        queryFn: () => getNextLesson(courseId),
        enabled: !!courseId,
        retry: false,
    });
                                                                                                                                                            
// ================= Lesson: Video =================
// Only works when lessonId is provided AND lesson type is video (1)
export const useGetLessonVideoLink = (lessonId: string | null) =>
    useQuery({
        queryKey: ['lessonVideoLink', lessonId],
        queryFn: () => getLessonVideoLink(lessonId!),
        enabled: !!lessonId,
        staleTime: 1000 * 60 * 10,
        retry: false,
    });

// ================= Lesson: Article =================
// Only works when lessonId is provided AND lesson type is article (2)
export const useGetLessonArticle = (lessonId: string | null) =>
    useQuery({
        queryKey: ['lessonArticle', lessonId],
        queryFn: () => getLessonArticle(lessonId!),
        enabled: !!lessonId,
        retry: false,
    });
// ================= Complete Course =================
export const useCompleteCourse = (courseId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => completeCourse(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseMetadata', courseId] });
        },
    });
};

export const useCompleteLesson = (courseId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (lessonId: string) => completeLesson(lessonId),
        onSuccess: () => {
            // Refetch course content so lesson isCompleted flags are up-to-date
            queryClient.invalidateQueries({ queryKey: ['courseContent', courseId] });
        },
    });
};