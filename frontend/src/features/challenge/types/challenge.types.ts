export type ChallengeCategory =
  | "Water"
  | "Healthcare"
  | "Agriculture"
  | "Infrastructure"
  | "Sanitation"
  | "Education"
  | "Environment"
  | "Energy"
  | "Accessibility"
  | "Public Administration"
  | "Rural Livelihood";

export type ChallengeStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "published"
  | "closed"
  | "rejected"
  | "archived";

export type ChallengeVisibility = "PRIVATE" | "INSTITUTION" | "PUBLIC" | "ARCHIVED";

export type MediaType = "image" | "video" | "document";

export interface LocationData {
  lat: number;
  lng: number;
  address_text?: string;
  district?: string;
  state?: string;
}

export interface ChallengeAsset {
  id: string;
  challenge_id: string;
  media_type: string;
  storage_url: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  uploaded_at: string;
}

export interface CitizenBrief {
  user_id: string;
  full_name: string;
  district?: string;
  state?: string;
}

export interface ChallengeDetail {
  id: string;
  citizen_id: string;
  created_by: string;
  updated_by?: string | null;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  affected_population: number;
  location: LocationData;
  status: ChallengeStatus;
  visibility: ChallengeVisibility;
  version: number;
  published_at?: string | null;
  archived_at?: string | null;
  priority_score?: number | null;
  ai_confidence?: number | null;
  citizen?: CitizenBrief | null;
  assets: ChallengeAsset[];
  created_at: string;
  updated_at: string;
}

export interface ChallengeListItem {
  id: string;
  citizen_id: string;
  created_by: string;
  title: string;
  category: string;
  status: ChallengeStatus;
  visibility: ChallengeVisibility;
  affected_population: number;
  district?: string | null;
  state?: string | null;
  assets_count: number;
  priority_score?: number | null;
  published_at?: string | null;
  created_at: string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ChallengePaginationResult {
  items: ChallengeListItem[];
  pagination: PaginationMetadata;
}

export interface ChallengeFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  district?: string;
  state?: string;
  search?: string;
  visibility?: string;
  sort_by?: string;
}
