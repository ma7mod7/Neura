export type ApplicationStatusCode = 0 | 1 | 2; // 0 Pending, 1 Approved, 2 Rejected

export interface InstructorApplication {
  id: number;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  status: ApplicationStatusCode;
  statusText: string | null;
  bio: string | null;
  experience: string | null;
  rejectionReason: string | null;
  createdOn: string;
  reviewedOn: string | null;
  reviewedByName: string | null;
  canReapplyAfter: string | null;
}

export interface MyApplicationStatus {
  hasApplication: boolean;
  isInstructor: boolean;
  canApply: boolean;
  applicationId: number | null;
  status: ApplicationStatusCode;
  statusText: string | null;
  rejectionReason: string | null;
  createdOn: string | null;
  reviewedOn: string | null;
  canReapplyAfter: string | null;
  message: string | null;
}

export interface ApplicationsListParams {
  status?: ApplicationStatusCode;
  page?: number;
  pageSize?: number;
}

export interface ApplicationsListResponse {
  items: InstructorApplication[];
  totalCount: number;
  page: number;
  pageSize: number;
}