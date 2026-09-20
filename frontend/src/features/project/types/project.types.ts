export type ProjectStage = "PROPOSAL" | "DEVELOPMENT" | "PILOT" | "COMPLETED";

export const PROJECT_STAGES: ProjectStage[] = [
  "PROPOSAL",
  "DEVELOPMENT",
  "PILOT",
  "COMPLETED",
];

export type MilestoneStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "VERIFIED"
  | "REJECTED";

export const MILESTONE_STATUSES: MilestoneStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "SUBMITTED",
  "VERIFIED",
  "REJECTED",
];

export type DeliverableType =
  | "DOCUMENT"
  | "PROTOTYPE"
  | "VIDEO_DEMO"
  | "SOURCE_CODE"
  | "PILOT_DATA";

export interface ProjectDeliverable {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description: string;
  type: DeliverableType;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  version: string;
  uploadedBy: string;
  uploadedByRole: string;
  uploadedAt: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  stage: ProjectStage;
  targetDate: string;
  completionDate?: string;
  status: MilestoneStatus;
  progressPercentage: number;
  deliverablesCount: number;
  assignedMemberName?: string;
  reviewScore?: number;
  reviewNotes?: string;
}

export interface FacultyReviewScoreRubric {
  innovationFeasibility: number; // 0 to 25
  prototypeMaturity: number; // 0 to 25
  fieldValidation: number; // 0 to 25
  technicalDocumentation: number; // 0 to 25
}

export interface FacultyReview {
  id: string;
  projectId: string;
  milestoneId?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerDesignation: string;
  reviewerDepartment: string;
  reviewerInstitution: string;
  status: "APPROVED" | "REVISION_REQUESTED" | "REJECTED";
  rubric: FacultyReviewScoreRubric;
  totalScore: number; // 0 to 100
  comments: string;
  strengths: string[];
  improvements: string[];
  createdAt: string;
}

export interface BurnDownDataPoint {
  milestone: string;
  plannedProgress: number;
  actualProgress: number;
  date: string;
}

export interface ProjectAnalytics {
  completionPercentage: number;
  daysRemaining: number;
  totalMilestones: number;
  completedMilestones: number;
  pendingMilestones: number;
  burnDownData: BurnDownDataPoint[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  synopsis: string;
  category: string;
  challengeId: string;
  challengeTitle: string;
  teamId: string;
  teamName: string;
  teamLeadName: string;
  teamMembersCount: number;
  facultyMentorId: string;
  facultyMentorName: string;
  facultyMentorInstitution: string;
  stage: ProjectStage;
  progressPercentage: number;
  startDate: string;
  targetCompletionDate: string;
  tags: string[];
  budgetAllocated?: number;
  budgetUtilized?: number;
  repoUrl?: string;
  demoUrl?: string;
  milestones: ProjectMilestone[];
  deliverables: ProjectDeliverable[];
  reviews: FacultyReview[];
  analytics: ProjectAnalytics;
  updatedAt: string;
  createdAt: string;
}

export interface ProjectKPIs {
  totalProjects: number;
  inProposal: number;
  inDevelopment: number;
  inPilot: number;
  completed: number;
  averageProgress: number;
  avgReviewScore: number;
}
