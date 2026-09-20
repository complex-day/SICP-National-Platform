export interface University {
  id: string;
  name: string;
  code: string;
  state: string;
  district: string;
  tier: "TIER_1" | "TIER_2" | "TIER_3";
  departmentsCount: number;
  facultyCount: number;
  activeProjectsCount: number;
}

export interface Department {
  id: string;
  universityId: string;
  universityName: string;
  name: string;
  code: string;
  headName: string;
  headEmail: string;
  assignedChallengesCount: number;
  activeProjectsCount: number;
  facultyCapacity: number;
  activeFacultyCount: number;
  specializations: string[];
}

export type FacultyDesignation =
  | "Professor"
  | "Associate Professor"
  | "Assistant Professor"
  | "Dean R&D"
  | "Head of Department";

export type FacultyAvailability = "AVAILABLE" | "NEAR_CAPACITY" | "FULL";

export interface Faculty {
  id: string;
  userId: string;
  name: string;
  email: string;
  universityId: string;
  universityName: string;
  departmentId: string;
  departmentName: string;
  designation: FacultyDesignation;
  specializations: string[];
  activeMentorshipCount: number; // Max 3
  maxMentorshipCapacity: number; // 3
  availability: FacultyAvailability;
  avatarUrl?: string;
  hIndex?: number;
  patentsCount?: number;
  successRate?: number; // e.g. 92%
}

export interface MentorshipAssignment {
  id: string;
  facultyId: string;
  facultyName: string;
  teamId: string;
  teamName: string;
  challengeId: string;
  challengeTitle: string;
  status: "ACTIVE" | "COMPLETED" | "REVOKED";
  assignedAt: string;
  role: "PRIMARY_MENTOR" | "CO_MENTOR";
}

export type ChallengeAssignmentStatus =
  | "INTAKE_PENDING"
  | "CLAIMED"
  | "DEPARTMENT_ASSIGNED"
  | "ACTIVE_RESEARCH"
  | "RESOLVED";

export interface ChallengeAssignment {
  id: string;
  challengeId: string;
  challengeTitle: string;
  category: string;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  universityId: string;
  universityName: string;
  departmentId?: string;
  departmentName?: string;
  leadFacultyId?: string;
  leadFacultyName?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  status: ChallengeAssignmentStatus;
  assignedAt: string;
  proposalsCount: number;
}

export interface MatchScoreBreakdown {
  domainExpertise: number; // Max 30 (30%)
  pastSuccess: number; // Max 25 (25%)
  capacity: number; // Max 20 (20%)
  proximity: number; // Max 15 (15%)
  alignment: number; // Max 10 (10%)
}

export interface MatchRecommendation {
  id: string;
  challengeId: string;
  challengeTitle: string;
  challengeCategory: string;
  facultyId: string;
  facultyName: string;
  facultyDepartment: string;
  facultyInstitution: string;
  facultySpecialization: string[];
  totalMatchScore: number; // 0 - 100
  breakdown: MatchScoreBreakdown;
  reasoning: string;
  status: "RECOMMENDED" | "ACCEPTED" | "OVERRIDDEN" | "REJECTED";
  generatedAt: string;
}

export interface AcademicKPIs {
  totalAssignedChallenges: number;
  activeFacultyMentors: number;
  activeStudentTeams: number;
  solutionProposalsSubmitted: number;
  averageMatchScore: number;
  completedPilots: number;
}
