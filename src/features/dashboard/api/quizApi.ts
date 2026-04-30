// src/api/quizApi.ts
import axiosInstance from "../../../shared/api/axiosInstance"; // Adjust path if needed

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

export const createExamMetadata = async (payload: CreateExamPayload) => {
    const response = await axiosInstance.post('/api/Exams', payload);

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
    questionType: number; // 0: Single Choice, 1: True/False, 2: Multiple Choice
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

// Delete the entire Exam metadata if needed (optional based on your backend)
export const deleteExam = async (examId: number) => {
    const response = await axiosInstance.delete(`/api/Exams/${examId}`);
    return response.data;
};

