
// src/features/auth/api/useLogin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance'; 



const enrollRequest = async (id:string) => {
    const response = await axiosInstance.post(`api/Courses/enroll/${id}`)
    console.log("hello world")
    console.log(response)
    return response;
};

export const useEnroll = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: enrollRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
        onError: (error: any) => {
            console.log("field to enroll",error.response)
        }
    });
};

export default useEnroll

