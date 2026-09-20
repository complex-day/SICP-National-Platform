import {
  University,
  Department,
  Faculty,
  ChallengeAssignment,
  MatchRecommendation,
  AcademicKPIs,
} from "@/features/academic/types/academic.types";
import {
  MOCK_UNIVERSITIES,
  MOCK_DEPARTMENTS,
  MOCK_FACULTY,
  MOCK_CHALLENGE_ASSIGNMENTS,
  MOCK_MATCH_RECOMMENDATIONS,
  MOCK_ACADEMIC_KPIS,
} from "@/mock/academic.mock";

const ASSIGNMENTS_STORAGE_KEY = "sicp_academic_assignments_v1";
const FACULTY_STORAGE_KEY = "sicp_academic_faculty_v1";
const DEPARTMENTS_STORAGE_KEY = "sicp_academic_departments_v1";
const MATCHES_STORAGE_KEY = "sicp_academic_matches_v1";

function getStored<T>(key: string, defaultData: T[]): T[] {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultData;
  } catch {
    return defaultData;
  }
}

function saveStored<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key}:`, err);
  }
}

export const academicService = {
  async getKPIs(): Promise<AcademicKPIs> {
    await new Promise((res) => setTimeout(res, 50));
    const assignments = getStored<ChallengeAssignment>(
      ASSIGNMENTS_STORAGE_KEY,
      MOCK_CHALLENGE_ASSIGNMENTS
    );
    const faculty = getStored<Faculty>(FACULTY_STORAGE_KEY, MOCK_FACULTY);

    const activeFacultyMentors = faculty.filter((f) => f.activeMentorshipCount > 0).length;

    return {
      totalAssignedChallenges: assignments.length,
      activeFacultyMentors,
      activeStudentTeams: 42,
      solutionProposalsSubmitted: assignments.reduce((acc, curr) => acc + curr.proposalsCount, 0),
      averageMatchScore: 92.4,
      completedPilots: assignments.filter((a) => a.status === "RESOLVED").length,
    };
  },

  async listAssignedChallenges(filters: {
    search?: string;
    category?: string;
    status?: string;
    department?: string;
  } = {}): Promise<ChallengeAssignment[]> {
    await new Promise((res) => setTimeout(res, 70));
    const all = getStored<ChallengeAssignment>(
      ASSIGNMENTS_STORAGE_KEY,
      MOCK_CHALLENGE_ASSIGNMENTS
    );

    return all.filter((a) => {
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesTitle = a.challengeTitle.toLowerCase().includes(q);
        const matchesCategory = a.category.toLowerCase().includes(q);
        const matchesUniv = a.universityName.toLowerCase().includes(q);
        const matchesDept = a.departmentName?.toLowerCase().includes(q) || false;
        const matchesLead = a.leadFacultyName?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesCategory && !matchesUniv && !matchesDept && !matchesLead) {
          return false;
        }
      }

      if (filters.category && filters.category !== "ALL" && filters.category !== "All Categories") {
        if (a.category !== filters.category) return false;
      }

      if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
        if (a.status !== filters.status) return false;
      }

      if (filters.department && filters.department !== "ALL") {
        if (a.departmentName !== filters.department) return false;
      }

      return true;
    });
  },

  async claimChallenge(
    challengeId: string,
    challengeTitle: string,
    category: string,
    departmentId: string,
    leadFacultyId: string
  ): Promise<ChallengeAssignment> {
    await new Promise((res) => setTimeout(res, 100));
    const all = getStored<ChallengeAssignment>(
      ASSIGNMENTS_STORAGE_KEY,
      MOCK_CHALLENGE_ASSIGNMENTS
    );
    const depts = getStored<Department>(DEPARTMENTS_STORAGE_KEY, MOCK_DEPARTMENTS);
    const faculty = getStored<Faculty>(FACULTY_STORAGE_KEY, MOCK_FACULTY);

    const targetDept = depts.find((d) => d.id === departmentId) || depts[0];
    const targetFaculty = faculty.find((f) => f.id === leadFacultyId) || faculty[0];

    const newAssignment: ChallengeAssignment = {
      id: `assign-${Date.now()}`,
      challengeId,
      challengeTitle,
      category,
      urgency: "HIGH",
      universityId: targetDept.universityId,
      universityName: targetDept.universityName,
      departmentId: targetDept.id,
      departmentName: targetDept.name,
      leadFacultyId: targetFaculty.id,
      leadFacultyName: targetFaculty.name,
      status: "CLAIMED",
      assignedAt: new Date().toISOString(),
      proposalsCount: 1,
    };

    const updated = [newAssignment, ...all];
    saveStored<ChallengeAssignment>(ASSIGNMENTS_STORAGE_KEY, updated);
    return newAssignment;
  },

  async assignDepartment(
    assignmentId: string,
    departmentId: string,
    leadFacultyId: string
  ): Promise<ChallengeAssignment> {
    await new Promise((res) => setTimeout(res, 80));
    const all = getStored<ChallengeAssignment>(
      ASSIGNMENTS_STORAGE_KEY,
      MOCK_CHALLENGE_ASSIGNMENTS
    );
    const depts = getStored<Department>(DEPARTMENTS_STORAGE_KEY, MOCK_DEPARTMENTS);
    const faculty = getStored<Faculty>(FACULTY_STORAGE_KEY, MOCK_FACULTY);

    const assignment = all.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error("Assignment not found.");

    const targetDept = depts.find((d) => d.id === departmentId);
    const targetFaculty = faculty.find((f) => f.id === leadFacultyId);

    if (targetDept) {
      assignment.departmentId = targetDept.id;
      assignment.departmentName = targetDept.name;
    }
    if (targetFaculty) {
      assignment.leadFacultyId = targetFaculty.id;
      assignment.leadFacultyName = targetFaculty.name;
    }
    assignment.status = "DEPARTMENT_ASSIGNED";

    saveStored<ChallengeAssignment>(ASSIGNMENTS_STORAGE_KEY, all);
    return assignment;
  },

  async listFaculty(filters: {
    search?: string;
    department?: string;
    availability?: string;
  } = {}): Promise<Faculty[]> {
    await new Promise((res) => setTimeout(res, 60));
    const all = getStored<Faculty>(FACULTY_STORAGE_KEY, MOCK_FACULTY);

    return all.filter((f) => {
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesEmail = f.email.toLowerCase().includes(q);
        const matchesDept = f.departmentName.toLowerCase().includes(q);
        const matchesUniv = f.universityName.toLowerCase().includes(q);
        const matchesSpec = f.specializations.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesEmail && !matchesDept && !matchesUniv && !matchesSpec) {
          return false;
        }
      }

      if (filters.department && filters.department !== "ALL") {
        if (f.departmentName !== filters.department) return false;
      }

      if (filters.availability && filters.availability !== "ALL") {
        if (f.availability !== filters.availability) return false;
      }

      return true;
    });
  },

  async assignMentor(
    facultyId: string,
    teamId: string,
    challengeId: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 90));
    const facultyList = getStored<Faculty>(FACULTY_STORAGE_KEY, MOCK_FACULTY);
    const faculty = facultyList.find((f) => f.id === facultyId);

    if (!faculty) throw new Error("Faculty member not found.");

    // Strict constraint: Maximum 3 active mentorships
    if (faculty.activeMentorshipCount >= 3) {
      throw new Error(
        `${faculty.name} has reached the maximum mentorship threshold (3/3). Please select an available faculty mentor.`
      );
    }

    faculty.activeMentorshipCount += 1;
    faculty.availability =
      faculty.activeMentorshipCount >= 3
        ? "FULL"
        : faculty.activeMentorshipCount === 2
        ? "NEAR_CAPACITY"
        : "AVAILABLE";

    saveStored<Faculty>(FACULTY_STORAGE_KEY, facultyList);
    return {
      success: true,
      message: `Successfully appointed ${faculty.name} as Faculty Mentor (Current workload: ${faculty.activeMentorshipCount}/3).`,
    };
  },

  async listDepartments(universityId?: string): Promise<Department[]> {
    await new Promise((res) => setTimeout(res, 50));
    const all = getStored<Department>(DEPARTMENTS_STORAGE_KEY, MOCK_DEPARTMENTS);
    if (universityId) {
      return all.filter((d) => d.universityId === universityId);
    }
    return all;
  },

  async listMatchRecommendations(): Promise<MatchRecommendation[]> {
    await new Promise((res) => setTimeout(res, 60));
    return getStored<MatchRecommendation>(MATCHES_STORAGE_KEY, MOCK_MATCH_RECOMMENDATIONS);
  },

  async respondMatchRecommendation(
    recommendationId: string,
    action: "ACCEPT" | "OVERRIDE" | "REJECT",
    overrideFacultyId?: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 80));
    const all = getStored<MatchRecommendation>(
      MATCHES_STORAGE_KEY,
      MOCK_MATCH_RECOMMENDATIONS
    );
    const rec = all.find((r) => r.id === recommendationId);
    if (!rec) throw new Error("Match recommendation not found.");

    if (action === "ACCEPT") {
      rec.status = "ACCEPTED";
      // Update faculty mentorship count
      await this.assignMentor(rec.facultyId, "team-auto", rec.challengeId).catch(() => {});
    } else if (action === "OVERRIDE") {
      rec.status = "OVERRIDDEN";
      if (overrideFacultyId) {
        const facultyList = getStored<Faculty>(FACULTY_STORAGE_KEY, MOCK_FACULTY);
        const overrideFac = facultyList.find((f) => f.id === overrideFacultyId);
        if (overrideFac) {
          rec.facultyId = overrideFac.id;
          rec.facultyName = overrideFac.name;
          rec.facultyDepartment = overrideFac.departmentName;
          rec.reasoning = `Overridden by Department Chair: Manually assigned to ${overrideFac.name} based on targeted lab availability.`;
        }
      }
    } else {
      rec.status = "REJECTED";
    }

    saveStored<MatchRecommendation>(MATCHES_STORAGE_KEY, all);
    return {
      success: true,
      message: `AI recommendation successfully ${action.toLowerCase()}ed.`,
    };
  },
};
