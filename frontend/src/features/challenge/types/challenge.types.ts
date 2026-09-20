export * from "@/features/challenges/types/challenge.types";

// Aliases for backwards compatibility
export type LocationData = {
  lat: number;
  lng: number;
  address_text?: string;
  district?: string;
  state?: string;
};

export type MediaType = "image" | "video" | "document";

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

export interface ChallengeListItem {
  id: string;
  citizen_id: string;
  created_by: string;
  title: string;
  category: string;
  status: string;
  visibility?: string;
  affected_population: number;
  district?: string | null;
  state?: string | null;
  assets_count?: number;
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
