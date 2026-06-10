import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../shared/api/axiosInstance';
import type { CheckoutResponse, VerifyPaymentResponse } from '../types/payment.types';

async function createCheckoutSession(courseId: string): Promise<CheckoutResponse> {
    const res = await axiosInstance.post(`api/payments/checkout/${courseId}`);
    return res.data;
}

async function verifyPayment(courseId: string): Promise<VerifyPaymentResponse> {
    const res = await axiosInstance.post(`api/payments/verify/${courseId}`);
    return res.data;
}

export function useCreateCheckout() {
    return useMutation<CheckoutResponse, Error, string>({
        mutationFn: createCheckoutSession,
    });
}

export function useVerifyPayment() {
    return useMutation<VerifyPaymentResponse, Error, string>({
        mutationFn: verifyPayment,
    });
}