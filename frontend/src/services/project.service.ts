import {
  Project,
  ProjectStage,
  ProjectMilestone,
  ProjectDeliverable,
  FacultyReview,
  ProjectKPIs,
  MilestoneStatus,
} from "@/features/project/types/project.types";
import { MOCK_PROJECTS, MOCK_PROJECT_KPIS } from "@/mock/project.mock";

const PROJECTS_STORAGE_KEY = "sicp_projects_v1";

function getStoredProjects(): Project[] {
  if (typeof window === "undefined") return MOCK_PROJECTS;
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(MOCK_PROJECTS));
      return MOCK_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_PROJECTS;
  } catch {
    return MOCK_PROJECTS;
  }
}

function saveStoredProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error("Failed to save projects in localStorage:", err);
  }
}

export const projectService = {
  async getKPIs(): Promise<ProjectKPIs> {
    await new Promise((res) => setTimeout(res, 50));
    const all = getStoredProjects();

    const inProposal = all.filter((p) => p.stage === "PROPOSAL").length;
    const inDevelopment = all.filter((p) => p.stage === "DEVELOPMENT").length;
    const inPilot = all.filter((p) => p.stage === "PILOT").length;
    const completed = all.filter((p) => p.stage === "COMPLETED").length;

    const totalProgress = all.reduce((acc, p) => acc + p.progressPercentage, 0);
    const averageProgress = all.length > 0 ? Number((totalProgress / all.length).toFixed(1)) : 0;

    const allReviews = all.flatMap((p) => p.reviews);
    const avgReviewScore =
      allReviews.length > 0
        ? Number((allReviews.reduce((acc, r) => acc + r.totalScore, 0) / allReviews.length).toFixed(1))
        : 92.4;

    return {
      totalProjects: all.length,
      inProposal,
      inDevelopment,
      inPilot,
      completed,
      averageProgress,
      avgReviewScore,
    };
  },

  async listProjects(filters: {
    search?: string;
    stage?: string;
    category?: string;
  } = {}): Promise<Project[]> {
    await new Promise((res) => setTimeout(res, 60));
    const all = getStoredProjects();

    return all.filter((p) => {
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesTeam = p.teamName.toLowerCase().includes(q);
        const matchesMentor = p.facultyMentorName.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTeam && !matchesMentor && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      if (filters.stage && filters.stage !== "ALL" && filters.stage !== "All Stages") {
        if (p.stage !== filters.stage) return false;
      }

      if (filters.category && filters.category !== "ALL" && filters.category !== "All Categories") {
        if (p.category !== filters.category) return false;
      }

      return true;
    });
  },

  async getProjectById(id: string): Promise<Project | null> {
    await new Promise((res) => setTimeout(res, 50));
    const all = getStoredProjects();
    return all.find((p) => p.id === id) || null;
  },

  async createProject(projectData: {
    title: string;
    synopsis: string;
    description: string;
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
    targetCompletionDate: string;
    tags: string[];
    budgetAllocated?: number;
    repoUrl?: string;
    demoUrl?: string;
    initialMilestones?: { title: string; description: string; targetDate: string }[];
  }): Promise<Project> {
    await new Promise((res) => setTimeout(res, 100));
    const all = getStoredProjects();

    const newId = `proj-${Date.now()}`;
    const initialMilestones: ProjectMilestone[] = (projectData.initialMilestones || []).map(
      (m, idx) => ({
        id: `ms-${Date.now()}-${idx + 1}`,
        projectId: newId,
        title: m.title,
        description: m.description,
        stage: "PROPOSAL",
        targetDate: m.targetDate,
        status: "PENDING",
        progressPercentage: 0,
        deliverablesCount: 0,
        assignedMemberName: projectData.teamLeadName,
      })
    );

    // If none provided, add default proposal milestone
    if (initialMilestones.length === 0) {
      initialMilestones.push({
        id: `ms-${Date.now()}-1`,
        projectId: newId,
        title: "Technical Specification & Architecture Review",
        description: "Formulation of mathematical models, system schematics, and simulation benchmarks.",
        stage: "PROPOSAL",
        targetDate: projectData.targetCompletionDate,
        status: "PENDING",
        progressPercentage: 0,
        deliverablesCount: 0,
        assignedMemberName: projectData.teamLeadName,
      });
    }

    const newProject: Project = {
      id: newId,
      title: projectData.title,
      synopsis: projectData.synopsis,
      description: projectData.description,
      category: projectData.category,
      challengeId: projectData.challengeId,
      challengeTitle: projectData.challengeTitle,
      teamId: projectData.teamId,
      teamName: projectData.teamName,
      teamLeadName: projectData.teamLeadName,
      teamMembersCount: projectData.teamMembersCount || 4,
      facultyMentorId: projectData.facultyMentorId,
      facultyMentorName: projectData.facultyMentorName,
      facultyMentorInstitution: projectData.facultyMentorInstitution,
      stage: "PROPOSAL",
      progressPercentage: 5,
      startDate: new Date().toISOString(),
      targetCompletionDate: projectData.targetCompletionDate,
      tags: projectData.tags,
      budgetAllocated: projectData.budgetAllocated || 250000,
      budgetUtilized: 0,
      repoUrl: projectData.repoUrl,
      demoUrl: projectData.demoUrl,
      milestones: initialMilestones,
      deliverables: [],
      reviews: [],
      analytics: {
        completionPercentage: 5,
        daysRemaining: Math.max(
          1,
          Math.ceil(
            (new Date(projectData.targetCompletionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        ),
        totalMilestones: initialMilestones.length,
        completedMilestones: 0,
        pendingMilestones: initialMilestones.length,
        burnDownData: [
          { milestone: "Kickoff", plannedProgress: 10, actualProgress: 5, date: "Initiated" },
          { milestone: "Target Completion", plannedProgress: 100, actualProgress: 5, date: "Planned" },
        ],
      },
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newProject, ...all];
    saveStoredProjects(updated);
    return newProject;
  },

  async updateProjectStage(projectId: string, stage: ProjectStage): Promise<Project> {
    await new Promise((res) => setTimeout(res, 80));
    const all = getStoredProjects();
    const project = all.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found");

    project.stage = stage;
    if (stage === "COMPLETED") {
      project.progressPercentage = 100;
      project.analytics.completionPercentage = 100;
      project.analytics.daysRemaining = 0;
    } else if (stage === "PILOT" && project.progressPercentage < 65) {
      project.progressPercentage = 65;
      project.analytics.completionPercentage = 65;
    } else if (stage === "DEVELOPMENT" && project.progressPercentage < 35) {
      project.progressPercentage = 35;
      project.analytics.completionPercentage = 35;
    }
    project.updatedAt = new Date().toISOString();

    saveStoredProjects(all);
    return project;
  },

  async createMilestone(
    projectId: string,
    milestoneData: {
      title: string;
      description: string;
      stage: ProjectStage;
      targetDate: string;
      assignedMemberName?: string;
    }
  ): Promise<ProjectMilestone> {
    await new Promise((res) => setTimeout(res, 80));
    const all = getStoredProjects();
    const project = all.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found");

    const newMilestone: ProjectMilestone = {
      id: `ms-${Date.now()}`,
      projectId,
      title: milestoneData.title,
      description: milestoneData.description,
      stage: milestoneData.stage,
      targetDate: milestoneData.targetDate,
      status: "PENDING",
      progressPercentage: 0,
      deliverablesCount: 0,
      assignedMemberName: milestoneData.assignedMemberName || project.teamLeadName,
    };

    project.milestones.push(newMilestone);
    project.analytics.totalMilestones = project.milestones.length;
    project.analytics.pendingMilestones = project.milestones.filter((m) => m.status !== "VERIFIED").length;
    project.updatedAt = new Date().toISOString();

    saveStoredProjects(all);
    return newMilestone;
  },

  async updateMilestoneProgress(
    projectId: string,
    milestoneId: string,
    progress: number,
    status: MilestoneStatus,
    reviewNotes?: string
  ): Promise<ProjectMilestone> {
    await new Promise((res) => setTimeout(res, 70));
    const all = getStoredProjects();
    const project = all.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found");

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    milestone.progressPercentage = Math.min(100, Math.max(0, progress));
    milestone.status = status;
    if (status === "VERIFIED") {
      milestone.completionDate = new Date().toISOString();
      milestone.progressPercentage = 100;
    }
    if (reviewNotes) {
      milestone.reviewNotes = reviewNotes;
    }

    // Recalculate project total progress
    const totalMs = project.milestones.length;
    if (totalMs > 0) {
      const avgMsProgress =
        project.milestones.reduce((acc, m) => acc + m.progressPercentage, 0) / totalMs;
      project.progressPercentage = Math.round(avgMsProgress);
      project.analytics.completionPercentage = Math.round(avgMsProgress);
      project.analytics.completedMilestones = project.milestones.filter((m) => m.status === "VERIFIED").length;
      project.analytics.pendingMilestones = project.milestones.filter((m) => m.status !== "VERIFIED").length;
    }
    project.updatedAt = new Date().toISOString();

    saveStoredProjects(all);
    return milestone;
  },

  async uploadDeliverable(
    projectId: string,
    deliverableData: {
      milestoneId?: string;
      title: string;
      description: string;
      type: ProjectDeliverable["type"];
      fileUrl: string;
      fileName: string;
      fileSize: string;
      version: string;
      uploadedBy: string;
      uploadedByRole: string;
    }
  ): Promise<ProjectDeliverable> {
    await new Promise((res) => setTimeout(res, 90));
    const all = getStoredProjects();
    const project = all.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found");

    const newDeliverable: ProjectDeliverable = {
      id: `deliv-${Date.now()}`,
      projectId,
      milestoneId: deliverableData.milestoneId,
      title: deliverableData.title,
      description: deliverableData.description,
      type: deliverableData.type,
      fileUrl: deliverableData.fileUrl,
      fileName: deliverableData.fileName,
      fileSize: deliverableData.fileSize,
      version: deliverableData.version || "v1.0",
      uploadedBy: deliverableData.uploadedBy,
      uploadedByRole: deliverableData.uploadedByRole,
      uploadedAt: new Date().toISOString(),
      verificationStatus: "PENDING",
    };

    project.deliverables.unshift(newDeliverable);

    // If attached to milestone, update milestone deliverable count
    if (deliverableData.milestoneId) {
      const ms = project.milestones.find((m) => m.id === deliverableData.milestoneId);
      if (ms) {
        ms.deliverablesCount += 1;
        if (ms.status === "PENDING") {
          ms.status = "SUBMITTED";
        }
      }
    }
    project.updatedAt = new Date().toISOString();

    saveStoredProjects(all);
    return newDeliverable;
  },

  async submitFacultyReview(
    projectId: string,
    reviewData: {
      milestoneId?: string;
      reviewerId: string;
      reviewerName: string;
      reviewerDesignation: string;
      reviewerDepartment: string;
      reviewerInstitution: string;
      status: "APPROVED" | "REVISION_REQUESTED" | "REJECTED";
      rubric: {
        innovationFeasibility: number;
        prototypeMaturity: number;
        fieldValidation: number;
        technicalDocumentation: number;
      };
      comments: string;
      strengths: string[];
      improvements: string[];
    }
  ): Promise<FacultyReview> {
    await new Promise((res) => setTimeout(res, 100));
    const all = getStoredProjects();
    const project = all.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found");

    const totalScore =
      reviewData.rubric.innovationFeasibility +
      reviewData.rubric.prototypeMaturity +
      reviewData.rubric.fieldValidation +
      reviewData.rubric.technicalDocumentation;

    const newReview: FacultyReview = {
      id: `rev-${Date.now()}`,
      projectId,
      milestoneId: reviewData.milestoneId,
      reviewerId: reviewData.reviewerId,
      reviewerName: reviewData.reviewerName,
      reviewerDesignation: reviewData.reviewerDesignation,
      reviewerDepartment: reviewData.reviewerDepartment,
      reviewerInstitution: reviewData.reviewerInstitution,
      status: reviewData.status,
      rubric: reviewData.rubric,
      totalScore,
      comments: reviewData.comments,
      strengths: reviewData.strengths,
      improvements: reviewData.improvements,
      createdAt: new Date().toISOString(),
    };

    project.reviews.unshift(newReview);

    // If attached to a milestone, mark milestone verified or rejected
    if (reviewData.milestoneId) {
      const ms = project.milestones.find((m) => m.id === reviewData.milestoneId);
      if (ms) {
        ms.reviewScore = totalScore;
        ms.reviewNotes = reviewData.comments;
        if (reviewData.status === "APPROVED") {
          ms.status = "VERIFIED";
          ms.progressPercentage = 100;
          ms.completionDate = new Date().toISOString();
        } else if (reviewData.status === "REVISION_REQUESTED") {
          ms.status = "IN_PROGRESS";
        } else {
          ms.status = "REJECTED";
        }
      }
    }
    project.updatedAt = new Date().toISOString();

    saveStoredProjects(all);
    return newReview;
  },

  async listAllMilestones(filters: {
    status?: string;
    stage?: string;
    search?: string;
  } = {}): Promise<
    (ProjectMilestone & {
      projectTitle: string;
      teamName: string;
      category: string;
    })[]
  > {
    await new Promise((res) => setTimeout(res, 60));
    const all = getStoredProjects();

    const flattened = all.flatMap((p) =>
      p.milestones.map((m) => ({
        ...m,
        projectTitle: p.title,
        teamName: p.teamName,
        category: p.category,
      }))
    );

    return flattened.filter((m) => {
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesProject = m.projectTitle.toLowerCase().includes(q);
        const matchesTeam = m.teamName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesProject && !matchesTeam) return false;
      }

      if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
        if (m.status !== filters.status) return false;
      }

      if (filters.stage && filters.stage !== "ALL" && filters.stage !== "All Stages") {
        if (m.stage !== filters.stage) return false;
      }

      return true;
    });
  },

  async listAllReviews(filters: {
    status?: string;
    search?: string;
  } = {}): Promise<
    (FacultyReview & {
      projectTitle: string;
      teamName: string;
      category: string;
    })[]
  > {
    await new Promise((res) => setTimeout(res, 60));
    const all = getStoredProjects();

    const flattened = all.flatMap((p) =>
      p.reviews.map((r) => ({
        ...r,
        projectTitle: p.title,
        teamName: p.teamName,
        category: p.category,
      }))
    );

    return flattened.filter((r) => {
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesProject = r.projectTitle.toLowerCase().includes(q);
        const matchesReviewer = r.reviewerName.toLowerCase().includes(q);
        const matchesComments = r.comments.toLowerCase().includes(q);
        if (!matchesProject && !matchesReviewer && !matchesComments) return false;
      }

      if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
        if (r.status !== filters.status) return false;
      }

      return true;
    });
  },
};
