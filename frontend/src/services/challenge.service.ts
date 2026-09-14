import { apiClient } from "@/lib/api";
import {
  ChallengeDetail,
  ChallengePaginationResult,
  ChallengeFilters,
  ChallengeAsset,
} from "@/features/challenge/types/challenge.types";
import { ChallengeFormValues } from "@/features/challenge/schemas/challenge.schema";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const challengeService = {
  async createChallenge(data: ChallengeFormValues, token: string): Promise<ChallengeDetail> {
    return apiClient<ChallengeDetail>("/challenges", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  async getChallenge(id: string, token?: string | null): Promise<ChallengeDetail> {
    return apiClient<ChallengeDetail>(`/challenges/${id}`, {
      method: "GET",
      token,
    });
  },

  async listChallenges(filters: ChallengeFilters = {}, token?: string | null): Promise<ChallengePaginationResult> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.district) queryParams.append("district", filters.district);
    if (filters.state) queryParams.append("state", filters.state);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.visibility) queryParams.append("visibility", filters.visibility);
    if (filters.sort_by) queryParams.append("sort_by", filters.sort_by);

    const qs = queryParams.toString();
    const endpoint = `/challenges${qs ? `?${qs}` : ""}`;

    return apiClient<ChallengePaginationResult>(endpoint, {
      method: "GET",
      token,
    });
  },

  async listMyChallenges(page: number = 1, limit: number = 20, token: string): Promise<ChallengePaginationResult> {
    return apiClient<ChallengePaginationResult>(`/challenges/my-challenges?page=${page}&limit=${limit}`, {
      method: "GET",
      token,
    });
  },

  async updateChallenge(
    id: string,
    data: Partial<ChallengeFormValues> & { version: number },
    token: string
  ): Promise<ChallengeDetail> {
    return apiClient<ChallengeDetail>(`/challenges/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    });
  },

  async transitionStatus(
    id: string,
    status: string,
    version: number,
    reason: string | undefined,
    token: string
  ): Promise<ChallengeDetail> {
    return apiClient<ChallengeDetail>(`/challenges/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status, version, reason }),
    });
  },

  async uploadAsset(
    challengeId: string,
    file: File,
    mediaType: string,
    token: string
  ): Promise<ChallengeAsset> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_type", mediaType);

    const url = `${API_BASE_URL}/challenges/${challengeId}/assets`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.error?.message || "Failed to upload asset");
    }
    return json.data;
  },

  async deleteChallenge(id: string, token: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/challenges/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
