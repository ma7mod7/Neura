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
  range: string | null;
  count: number;
  percentage: number;
}

export interface AttemptSummary {
  attemptId: number;
  userId: string | null;
  studentName: string | null;
  studentEmail: string | null;
  score: number;
  scorePercentage: number;
  totalPoints: number;
  passed: boolean;
  status: string | null;
  startedAt: string;
  submittedAt: string | null;
  durationInSeconds: number | null;
  violationCount: number;
}

export interface EditableCourse {
  id: string;
  title: string;
  role: 'Owner' | 'CoInstructor';
}