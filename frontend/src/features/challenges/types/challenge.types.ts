export type ChallengeCategory =
  | "Water Conservation"
  | "Healthcare"
  | "Education"
  | "Agriculture"
  | "Infrastructure"
  | "Waste Management"
  | "Clean Energy";

export const CHALLENGE_CATEGORIES: ChallengeCategory[] = [
  "Water Conservation",
  "Healthcare",
  "Education",
  "Agriculture",
  "Infrastructure",
  "Waste Management",
  "Clean Energy",
];

export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const URGENCY_LEVELS: UrgencyLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export type ChallengeStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CLAIMED"
  | "IN_PROGRESS"
  | "RESOLVED";

export const CHALLENGE_STATUSES: ChallengeStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CLAIMED",
  "IN_PROGRESS",
  "RESOLVED",
];

export interface ChallengeLocation {
  state: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface ChallengeMedia {
  id: string;
  name: string;
  url: string;
  type: "image" | "document" | "video";
  sizeBytes?: number;
  mimeType?: string;
  uploadedAt?: string;
}

export interface ChallengeTimelineEvent {
  id: string;
  status: ChallengeStatus;
  title: string;
  description?: string;
  timestamp: string;
  author?: string;
  role?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  status: ChallengeStatus;
  urgency: UrgencyLevel;
  location: ChallengeLocation;
  affectedPopulation: number;
  media: ChallengeMedia[];
  upvotes: number;
  isUpvoted?: boolean;
  createdAt: string;
  updatedAt: string;
  citizenId: string;
  citizenName: string;
  citizenEmail?: string;
  tags?: string[];
  claimedBy?: {
    teamId: string;
    teamName: string;
    leadName: string;
    institution: string;
  };
}

export interface ChallengeDetail extends Challenge {
  timeline: ChallengeTimelineEvent[];
  relatedChallenges?: Challenge[];
  interestedPartiesCount?: number;
}

export interface CreateChallengeInput {
  title: string;
  description: string;
  category: ChallengeCategory;
  location: ChallengeLocation;
  affectedPopulation: number;
  urgency: UrgencyLevel;
  mediaFiles?: File[];
}

export interface ChallengeFiltersState {
  search?: string;
  category?: string;
  state?: string;
  district?: string;
  status?: string;
  urgency?: string;
  sortBy?: "newest" | "oldest" | "upvotes" | "affected";
  page?: number;
  limit?: number;
}

export interface ExpressInterestInput {
  challengeId: string;
  name: string;
  email: string;
  organization: string;
  role: "student" | "faculty" | "industry" | "government" | "other";
  proposedApproach: string;
  estimatedTimelineWeeks?: number;
}
