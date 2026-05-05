import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance';

export const useGetCourseReviews = (courseId: string) => {
    return useQuery({
        queryKey: ['course-reviews', courseId],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/Reviews/course/${courseId}`);
            return data;
        },
        enabled: !!courseId,
    });
};

export const useAddCourseReview = (courseId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reviewData: { rating: number; comment: string | null }) => {
            const { data } = await axiosInstance.post(`/api/courses/${courseId}/reviews`, reviewData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-reviews', courseId] });
            queryClient.invalidateQueries({ queryKey: ['coursesMetaDataById', courseId] });
        }
    });
};