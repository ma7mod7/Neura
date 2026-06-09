import axiosInstance from '../../../shared/api/axiosInstance';

// ================= Exam Attempts =================
// lessonId = examId (backend treats them the same)

export const getExamInfo = async (lessonId: string) => {
    const res = await axiosInstance.get(`/api/ExamAttempts/exam/${lessonId}/info`);
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

    const payload = {
        selectedOptionIds: [Number(selectedOptionId)]
    };

    const res = await axiosInstance.put(`/api/ExamAttempts/${attemptId}/answers/${questionId}`, payload);
    
    return res;
};

export const submitAttempt = async (attemptId: string) => {
    const res = await axiosInstance.post(`/api/ExamAttempts/${attemptId}/submit`);
    console.log("submit",res.data)
    return res.data;
};

export const getAttemptResults = async (attemptId: string) => {
    console.log("resultsId",attemptId)
    const res = await axiosInstance.get(`/api/ExamAttempts/${attemptId}/results`);
    console.log("exam result",res)
    return res.data;
};

/**
 * Report a violation to the backend for instructor review.
 * Wrapped in try/catch so it never breaks the exam flow.
 * 
 * Backend expects: POST /api/ExamAttempts/{attemptId}/violations
 * Body: { type: string, timestamp: string, details?: string }
 * 
 * Violation types:
 *   - "TabSwitch"         → Student switched tabs (counts toward auto-submit)
 *   - "MultiScreen"       → Multiple screens detected (counts toward auto-submit)
 *   - "CopyPasteAttempt"  → Student tried copy/paste/right-click (logged only)
 *   - "AIViolation"       → AI proctoring detected anomaly (logged)
 */
export const reportViolation = async (attemptId: string, type: string, details?: string) => {
    try {
        const res = await axiosInstance.post(`/api/ExamAttempts/${attemptId}/violations`, {
            type,
            timestamp: new Date().toISOString(),
            details: details || null,
        });
        return res.data;
    } catch (error) {
        // Don't throw — violation reporting must never break the exam
        console.warn('[Violation Report] Failed to send to backend:', { attemptId, type, details }, error);
        return null;
    }
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
    return res.data?.buckets ?? res.data;
};