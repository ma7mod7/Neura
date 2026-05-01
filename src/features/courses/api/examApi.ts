import axiosInstance from '../../../shared/api/axiosInstance';

// ================= Exam Attempts =================
// lessonId = examId (backend treats them the same)

export const getExamInfo = async (lessonId: string) => {
    const res = await axiosInstance.get(`/api/ExamAttempts/exam/${lessonId}/info`);
    console.log("exam info", res.data);
    return res.data;
};

export const startExamAttempt = async (lessonId: string) => {
    const res = await axiosInstance.post(`/api/ExamAttempts/exam/${lessonId}/start`);
    return res.data;
};

export const resumeAttempt = async (attemptId: string) => {
    const res = await axiosInstance.get(`/api/ExamAttempts/${attemptId}/resume`);
    return res.data;
};

export const saveAnswer = async (attemptId: string, questionId: string, selectedOptionId: string) => {
    const res = await axiosInstance.put(`/api/ExamAttempts/${attemptId}/answers/${questionId}`, {
        selectedOptionId
    });
    return res.data;
};

export const submitAttempt = async (attemptId: string) => {
    const res = await axiosInstance.post(`/api/ExamAttempts/${attemptId}/submit`);
    return res.data;
};

export const getAttemptResults = async (attemptId: string) => {
    const res = await axiosInstance.get(`/api/ExamAttempts/${attemptId}/results`);
    return res.data;
};

export const reportViolation = async (attemptId: string, type: string) => {
    const res = await axiosInstance.post(`/api/ExamAttempts/${attemptId}/violations`, { type });
    return res.data;
};

// ================= Exam Analytics =================
export const getExamAnalytics = async (lessonId: string) => {
    const res = await axiosInstance.get(`/api/exams/${lessonId}/analytics`);
    return res.data;
};

export const getExamAttempts = async (lessonId: string) => {
    const res = await axiosInstance.get(`/api/exams/${lessonId}/analytics/attempts`);
    return res.data;
};

export const getAttemptAnalytics = async (lessonId: string, attemptId: string) => {
    const res = await axiosInstance.get(`/api/exams/${lessonId}/analytics/attempts/${attemptId}`);
    return res.data;
};

export const getScoreDistribution = async (lessonId: string) => {
    const res = await axiosInstance.get(`/api/exams/${lessonId}/analytics/score-distribution`);
    return res.data;
};