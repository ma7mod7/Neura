// src/features/auth/api/useSignup.ts
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance';
import { type SignUpFormValues } from '../schema/SignUpSchema';

interface SignupResponse {
    message: string;
    token?: string;
    user?: {
        id: number;
        username: string;
        email: string;
    };
}

const signupRequest = async (formData: SignUpFormValues): Promise<SignupResponse> => {
    const response = await axiosInstance.post('/Auth/register', formData);
    return response.data;
};

export const useSignup = () => {
    return useMutation({
        mutationFn: signupRequest,
        onError: (error: any) => {
            const errorMessage = error.response?.data?.errors?.[1] || 'Failed to create account. Please try again.';
            console.error('Signup Error:', errorMessage);
        }
    });
};