// src/features/auth/api/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance'; 
import { type LoginFormValues } from '../schema/LoginSchmea';

export interface LoginResponse {
    id: string;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    discordHandle: string;
    token: string;          
    expiresin: number;
    refreshToken: string;  
    refreshTokenExpiration: string;
}

const loginRequest = async (credentials: LoginFormValues): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/Auth/login', credentials);
    return response.data;
};

export const useLogin = () => {
    return useMutation({
        mutationFn: loginRequest,
        onError: (error: any) => {
            console.log(error.response.data)
            const message = error.response?.data?.errors?.[1] || 'Login failed';
            console.error('Login error:', message);
        }
    });
};