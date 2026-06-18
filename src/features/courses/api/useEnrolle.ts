
// src/features/auth/api/useLogin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance'; 
const enrollRequest = async (id: string) => {
    const response = await axiosInstance.post(
        `/api/courses/${id}/enroll`,
        null, 
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    console.log("hello world")
    console.log(response)
    return response;
};

export const useEnroll = (courseId?:string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: enrollRequest,
       onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['coursesMetaDataById', courseId] });
        queryClient.invalidateQueries({ queryKey: ['profileCourses'] });
        queryClient.invalidateQueries({ queryKey: ['enrollmentDashboard'] });
    },
        onError: (error: any) => {
            console.log("failed to enroll", error.response?.data?.errors);
            console.log("full error", error.response?.data);
        }
    });
};

export default useEnroll

