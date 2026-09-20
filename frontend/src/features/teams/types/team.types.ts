export type Skill =
  | "Frontend"
  | "Backend"
  | "AI/ML"
  | "IoT"
  | "CAD"
  | "Embedded"
  | "UI/UX"
  | "Data Science"
  | "Cloud/DevOps"
  | "Robotics"
  | "Mobile App"
  | "Cybersecurity";

export const PRESET_SKILLS: Skill[] = [
  "Frontend",
  "Backend",
  "AI/ML",
  "IoT",
  "CAD",
  "Embedded",
  "UI/UX",
  "Data Science",
  "Cloud/DevOps",
  "Robotics",
  "Mobile App",
  "Cybersecurity",
];

export type TeamRole = "LEADER" | "CO_LEADER" | "MEMBER" | "MENTOR";

export type TeamStatus =
  | "FORMING"
  | "RECRUITING"
  | "LOCKED"
  | "ACTIVE"
  | "COMPLETED"
  | "DISBANDED";

export const TEAM_STATUSES: TeamStatus[] = [
  "FORMING",
  "RECRUITING",
  "LOCKED",
  "ACTIVE",
  "COMPLETED",
  "DISBANDED",
];

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: TeamRole;
  skills: string[];
  department?: string;
  institution?: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  challengeId?: string;
  challengeTitle?: string;
  challengeCategory?: string;
  status: TeamStatus;
  leaderId: string;
  leaderName: string;
  institution: string;
  members: TeamMember[];
  requiredSkills: string[];
  maxMembers: number;
  minMembers: number;
  createdAt: string;
  updatedAt: string;
  projectProgress?: number;
  tags?: string[];
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeName: string;
  inviteeEmail: string;
  role: TeamRole;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  message?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface JoinRequest {
  id: string;
  teamId: string;
  teamName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userSkills: string[];
  institution?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  statement: string;
  createdAt: string;
  respondedAt?: string;
}

export interface TeamActivity {
  id: string;
  teamId: string;
  type:
    | "JOIN_REQUEST"
    | "INVITATION"
    | "MEMBER_JOINED"
    | "MEMBER_LEFT"
    | "MILESTONE_UPDATED"
    | "CHALLENGE_LINKED";
  title: string;
  description: string;
  actorName: string;
  timestamp: string;
}

export interface CreateTeamInput {
  name: string;
  description: string;
  challengeId?: string;
  challengeTitle?: string;
  challengeCategory?: string;
  requiredSkills: string[];
  maxMembers?: number;
  minMembers?: number;
}

export interface TeamFiltersState {
  search?: string;
  skill?: string;
  status?: string;
  institution?: string;
  hasOpenSlots?: boolean;
  sortBy?: "newest" | "members" | "progress" | "name";
  page?: number;
  limit?: number;
}
