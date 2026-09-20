import {
  Challenge,
  ChallengeDetail,
  ChallengeFiltersState,
  CreateChallengeInput,
  ExpressInterestInput,
  ChallengeCategory,
  UrgencyLevel,
} from "@/features/challenges/types/challenge.types";
import { MOCK_CHALLENGES, getTimelineForStatus } from "@/mock/challenges.mock";

const STORAGE_KEY = "sicp_challenges_store_v1";

function getStoredChallenges(): Challenge[] {
  if (typeof window === "undefined") {
    return MOCK_CHALLENGES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CHALLENGES));
      return MOCK_CHALLENGES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return MOCK_CHALLENGES;
  } catch {
    return MOCK_CHALLENGES;
  }
}

function saveStoredChallenges(challenges: Challenge[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
  } catch (err) {
    console.error("Failed to persist challenges:", err);
  }
}

export const challengeService = {
  async listChallenges(filters: ChallengeFiltersState = {}): Promise<{
    items: Challenge[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    await new Promise((res) => setTimeout(res, 80)); // Realistic fast mock delay
    const all = getStoredChallenges();

    let filtered = all.filter((c) => {
      // Search
      if (filters.search && filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesDesc = c.description.toLowerCase().includes(query);
        const matchesDistrict = c.location?.district?.toLowerCase().includes(query) || false;
        const matchesState = c.location?.state?.toLowerCase().includes(query) || false;
        const matchesCategory = c.category?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDesc && !matchesDistrict && !matchesState && !matchesCategory) {
          return false;
        }
      }

      // Category
      if (filters.category && filters.category !== "ALL" && filters.category !== "All Categories") {
        if (c.category !== filters.category) return false;
      }

      // Status
      if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
        if (c.status !== filters.status) return false;
      }

      // State
      if (filters.state && filters.state !== "ALL" && filters.state !== "All States") {
        if (c.location?.state !== filters.state) return false;
      }

      // District
      if (filters.district && filters.district !== "ALL" && filters.district !== "All Districts") {
        if (c.location?.district !== filters.district) return false;
      }

      // Urgency
      if (filters.urgency && filters.urgency !== "ALL" && filters.urgency !== "All Urgencies") {
        if (c.urgency !== filters.urgency) return false;
      }

      return true;
    });

    // Sorting
    if (filters.sortBy === "upvotes") {
      filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (filters.sortBy === "affected") {
      filtered.sort((a, b) => (b.affectedPopulation || 0) - (a.affectedPopulation || 0));
    } else if (filters.sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // default newest
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getChallenge(id: string): Promise<ChallengeDetail> {
    await new Promise((res) => setTimeout(res, 60));
    const all = getStoredChallenges();
    const found = all.find((c) => c.id === id);

    if (!found) {
      throw new Error(`Challenge with ID "${id}" not found.`);
    }

    const related = all
      .filter((c) => c.id !== found.id && (c.category === found.category || c.location?.state === found.location?.state))
      .slice(0, 3);

    const timeline = getTimelineForStatus(found.status);

    return {
      ...found,
      timeline,
      relatedChallenges: related,
      interestedPartiesCount: found.claimedBy ? 4 : Math.floor((found.upvotes || 5) / 6),
    };
  },

  async listMyChallenges(
    page: number = 1,
    limit: number = 50,
    citizenId?: string
  ): Promise<{
    items: Challenge[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    await new Promise((res) => setTimeout(res, 50));
    const all = getStoredChallenges();
    // In mock mode, if citizenId is supplied, filter by it, otherwise show citizen submissions
    const mySubmissions = citizenId
      ? all.filter((c) => c.citizenId === citizenId)
      : all.slice(0, 10); // fallback first 10 for demo

    const total = mySubmissions.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = mySubmissions.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  },

  async createChallenge(input: CreateChallengeInput, citizenId: string = "cit-current", citizenName: string = "Verified Citizen"): Promise<ChallengeDetail> {
    await new Promise((res) => setTimeout(res, 120));
    const all = getStoredChallenges();

    const newId = `ch-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();

    const mockMedia = (input.mediaFiles || []).map((file, idx) => ({
      id: `m-${Date.now()}-${idx}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: (file.type.startsWith("image/") ? "image" : "document") as "image" | "document",
      sizeBytes: file.size,
      uploadedAt: nowIso,
    }));

    // If no media uploaded, supply default fallback image based on category
    if (mockMedia.length === 0) {
      mockMedia.push({
        id: `m-${Date.now()}-default`,
        name: "field_documentation.jpg",
        url: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80",
        type: "image",
        sizeBytes: 850000,
        uploadedAt: nowIso,
      });
    }

    const newChallenge: Challenge = {
      id: newId,
      title: input.title,
      description: input.description,
      category: input.category,
      status: "SUBMITTED",
      urgency: input.urgency,
      location: input.location,
      affectedPopulation: input.affectedPopulation,
      media: mockMedia,
      upvotes: 1,
      isUpvoted: true,
      createdAt: nowIso,
      updatedAt: nowIso,
      citizenId,
      citizenName,
      tags: [input.category.toLowerCase().replace(/\s+/g, "-"), "community-submission"],
    };

    const updatedList = [newChallenge, ...all];
    saveStoredChallenges(updatedList);

    return {
      ...newChallenge,
      timeline: getTimelineForStatus("SUBMITTED"),
      relatedChallenges: all.slice(0, 3),
      interestedPartiesCount: 0,
    };
  },

  async upvoteChallenge(id: string): Promise<{ upvotes: number; isUpvoted: boolean }> {
    const all = getStoredChallenges();
    let updatedUpvotes = 0;
    let isUpvoted = false;

    const updated = all.map((c) => {
      if (c.id === id) {
        isUpvoted = !c.isUpvoted;
        updatedUpvotes = isUpvoted ? (c.upvotes || 0) + 1 : Math.max(0, (c.upvotes || 1) - 1);
        return {
          ...c,
          upvotes: updatedUpvotes,
          isUpvoted,
        };
      }
      return c;
    });

    saveStoredChallenges(updated);
    return { upvotes: updatedUpvotes, isUpvoted };
  },

  async expressInterest(input: ExpressInterestInput): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 100));
    return {
      success: true,
      message: `Your interest in challenge "${input.challengeId}" has been recorded. The nodal officer and challenge owner have been notified.`,
    };
  },

  async resetMockData(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};
