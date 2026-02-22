
// src/features/auth/api/useLogin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance';



const bookMarkRequest = async (id: string) => {
    const response = await axiosInstance.post(`bookmark/${id}`)
    return response;
};

export const useBookMark = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bookMarkRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coursesMetaDataById'] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });

        },
        onError: (error: any) => {
            console.log("field to enroll", error.response)
        }
    });
};

export default useBookMark

