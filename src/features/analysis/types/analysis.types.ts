export interface ExamOption {
  examId: string;
  examTitle: string;
  courseTitle: string;
  courseId: string;
}

export interface ExamAnalytics {
  examId: number;
  examTitle: string;
  totalAttempts: number;
  uniqueStudents: number;
  completedAttempts: number;
  inProgressAttempts: number;
  averageScore: number;
  averageScorePercentage: number;
  highestScorePercentage: number;
  lowestScorePercentage: number;
  medianScorePercentage: number;
  passedCount: number;
  failedCount: number;
  passRate: number;
  totalViolations: number;
  studentsWithViolations: number;
  questions: unknown[];
}

export interface ScoreDistributionItem {
  range: string;
  count: number;
}

export interface AttemptSummary {
  scorePercentage?: number;
  timeTakenInSeconds?: number;
  attemptId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string;
  timeTakenMinutes: number;
}

export interface EditableCourse {
  id: string;
  title: string;
  role: 'Admin' | 'Instructor';
}