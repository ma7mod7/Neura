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

//  Exam Review 
export type ExamReviewStatus = 'Draft' | 'PendingReview' | 'Approved' | 'Rejected';

export interface ExamReviewItem {
  examId: number;
  examTitle: string;
  courseId: string;
  courseTitle: string;
  submittedByName: string;
  submittedByRole: 'Owner' | 'CoInstructor' | string;
  status: ExamReviewStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedByName?: string | null;
  rejectionReason?: string | null;
  questionCount: number;
  totalPoints: number;
}

export interface ExamReviewOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface ExamReviewQuestion {
  id: number;
  text: string;
  points: number;
  options: ExamReviewOption[];
}

export interface ExamReviewDetail extends ExamReviewItem {
  questions: ExamReviewQuestion[];
  durationMinutes?: number | null;
  passingScore?: number | null;
}

export interface ExamReviewStats {
  pendingCount: number;
  approvedToday: number;
  rejectedCount: number;
  totalReviewed: number;
}

//  Attempt Result Review 
export type AttemptReviewStatus = 'UnderReview' | 'Approved' | 'Rejected';

export interface AttemptReviewItem {
  attemptId: number;
  examId: number;
  examTitle: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  score: number;
  scorePercentage: number;
  totalPoints: number;
  passed: boolean;
  status: AttemptReviewStatus;
  submittedAt: string;
  violationCount: number;
  reviewedAt?: string | null;
  reviewedByName?: string | null;
}

export interface AttemptReviewOption {
  id: number;
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
}

export interface AttemptReviewAnswer {
  questionId: number;
  questionText: string;
  points: number;
  earnedPoints: number;
  options: AttemptReviewOption[];
}

export interface AttemptReviewDetail extends AttemptReviewItem {
  answers: AttemptReviewAnswer[];
  durationInSeconds: number | null;
}

export interface AttemptReviewStats {
  pendingCount: number;
  approvedToday: number;
  rejectedToday: number;
  totalReviewed: number;
}

export interface AttemptReviewStatusResponse {
  status: AttemptReviewStatus;
  reviewedAt?: string | null;
}