import axiosInstance from "../../../shared/api/axiosInstance"; 

// ==========================================
// 1. Exam Metadata
// ==========================================
export interface CreateExamPayload {
    lessonId: number;
    title: string | null;
    description: string | null;
    durationInMinutes: number | null;
    maxAttempts: number | null;
    passingScorePercentage: number;
    shuffleAnswers: boolean;
    shuffleQuestions: boolean;
    maxViolationsBeforeAutoSubmit: number | null;
    enableTabSwitchDetection: boolean;
    numberOfQuestionsToServe: number | null;
}

// ⭐ الجديد: إضافة دالة جلب بيانات الكويز والأسئلة من الباك إند
export const getExamDetails = async (lessonId: number) => {
    const response = await axiosInstance.get(`/api/Exams/${lessonId}`);
    return response.data;
};

export const createExamMetadata = async (payload: CreateExamPayload) => {
    const response = await axiosInstance.post('/api/Exams', payload);
    return response.data;
};

export const updateExamMetadata = async (lessonId: number, payload: CreateExamPayload) => {
    const response = await axiosInstance.put(`/api/Exams/${lessonId}/settings`, payload);
    return response.data;
};

// ==========================================
// 2. Exam Questions
// ==========================================
export interface CreateAnswerOptionRequest {
    text: string;
    isCorrect: boolean;
}

export interface CreateQuestionPayload {
    questionText: string | null;
    points: number;
    questionType: number; 
    options: CreateAnswerOptionRequest[] | null;
}

export const addExamQuestion = async (lessonId: number, payload: CreateQuestionPayload) => {
    const response = await axiosInstance.post(`/api/exams/${lessonId}/questions`, payload);
    return response.data;
};

export const updateExamQuestion = async (lessonId: number, questionId: number, payload: CreateQuestionPayload) => {
    const response = await axiosInstance.put(`/api/exams/${lessonId}/questions/${questionId}`, payload);
    return response.data;
};

export const publishExam = async (lessonId: number) => {
    const response = await axiosInstance.put(`/api/Exams/${lessonId}/publish`);
    return response.data;
};

export const deleteExamQuestion = async (lessonId: number, questionId: number) => {
    const response = await axiosInstance.delete(`/api/exams/${lessonId}/questions/${questionId}`);
    return response.data;
};

export const deleteExam = async (lessonId: number) => {
    const response = await axiosInstance.delete(`/api/Lessons/${lessonId}`);
    return response.data;
};