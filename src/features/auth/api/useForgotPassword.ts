import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance'; // النسخة اللي عملناها
import { type ForgotPasswordValues,type ResetPasswordValues } from '../schema/ForgotPasswordSchema';

type ResetPasswordPayload = ResetPasswordValues & { 
    email: string; 
    code: string; 
};

const sendForgotPasswordEmail = async (data: ForgotPasswordValues) => {
    return await axiosInstance.post('/Auth/forgot-password', data);
};


// 2. تحديث الدالة لتستقبل النوع الجديد
const resetPassword = async (data: ResetPasswordPayload) => {
    return await axiosInstance.post('/Auth/reset-password', data);
};

export const useForgotPassword = () => {
    return useMutation({ mutationFn: sendForgotPasswordEmail });
};

export const useResetPassword = () => {
    return useMutation({ mutationFn: resetPassword });
};