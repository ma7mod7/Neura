export interface CheckoutResponse {
    sessionId: string | null;
    sessionUrl: string | null;
    publishableKey: string | null;
}

export interface VerifyPaymentResponse {
    courseId: number;
    courseName: string | null;
    courseThumbnail: string | null;
    userId: string | null;
    userName: string | null;
    role: 1 | 2 | 3 | 4;
    roleName: string | null;
    enrolledOn: string;
    lastAccessedOn: string | null;
    isActive: boolean;
}

export interface ApiError {
    detail: string | null;
    instance: string | null;
    status: number | null;
    title: string | null;
    type: string | null;
    propertyName?: unknown;
}

export type PaymentStep = 'preview' | 'processing' | 'verifying' | 'success' | 'error';

export interface CourseInfo {
    title: string;
    imageUrl?: string;
    price: number;
    rating?: number;
    totalReviews?: number;
    numberOfStudents?: number;
    tags?: { id: number; name: string }[];
    instructorName?: string;
    hours?: number;
    numberOfLessons?: number;
}