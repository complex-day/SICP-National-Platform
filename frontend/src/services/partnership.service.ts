import {
  Partnership,
  IndustryKPIs,
  IndustryMentor,
  FundingTranche,
  MentorshipSession,
  PilotDeployment,
  TechTransferTracker,
} from "@/features/partnership/types/partnership.types";
import {
  MOCK_PARTNERSHIPS,
  MOCK_INDUSTRY_KPIS,
  MOCK_INDUSTRY_MENTORS,
} from "@/mock/partnership.mock";

const PARTNERSHIPS_STORAGE_KEY = "sicp_partnerships_v1";
const MENTORS_STORAGE_KEY = "sicp_industry_mentors_v1";

function getStoredPartnerships(): Partnership[] {
  if (typeof window === "undefined") return MOCK_PARTNERSHIPS;
  try {
    const raw = localStorage.getItem(PARTNERSHIPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PARTNERSHIPS_STORAGE_KEY, JSON.stringify(MOCK_PARTNERSHIPS));
      return MOCK_PARTNERSHIPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_PARTNERSHIPS;
  } catch {
    return MOCK_PARTNERSHIPS;
  }
}

function saveStoredPartnerships(data: Partnership[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PARTNERSHIPS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save partnerships:", err);
  }
}

function getStoredMentors(): IndustryMentor[] {
  if (typeof window === "undefined") return MOCK_INDUSTRY_MENTORS;
  try {
    const raw = localStorage.getItem(MENTORS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MENTORS_STORAGE_KEY, JSON.stringify(MOCK_INDUSTRY_MENTORS));
      return MOCK_INDUSTRY_MENTORS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_INDUSTRY_MENTORS;
  } catch {
    return MOCK_INDUSTRY_MENTORS;
  }
}

function saveStoredMentors(data: IndustryMentor[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MENTORS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save mentors:", err);
  }
}

export const partnershipService = {
  async getKPIs(): Promise<IndustryKPIs> {
    await new Promise((res) => setTimeout(res, 50));
    const all = getStoredPartnerships();
    const mentors = getStoredMentors();

    const activePartnerships = all.filter((p) => p.status === "ACTIVE" || p.status === "MOU_SIGNED").length;
    const totalCSRFundingCommitted = all.reduce((acc, p) => acc + p.totalCommittedFunding, 0);
    const totalCSRFundingDisbursed = all.reduce((acc, p) => acc + p.totalReleasedFunding, 0);

    const fundingUtilizationPercentage =
      totalCSRFundingCommitted > 0
        ? Number(((totalCSRFundingDisbursed / totalCSRFundingCommitted) * 100).toFixed(1))
        : 0;

    const pilotDeploymentsCount = all.reduce((acc, p) => acc + p.deployments.length, 0);
    const commercializedSolutions = all.filter(
      (p) => p.techTransfer.adoptionStatus === "COMMERCIAL_SCALE" || p.status === "COMPLETED"
    ).length;

    return {
      activePartnerships,
      totalCSRFundingCommitted,
      totalCSRFundingDisbursed,
      activeIndustryMentors: mentors.length,
      pilotDeploymentsCount,
      fundingUtilizationPercentage,
      commercializedSolutions,
    };
  },

  async listPartnerships(filters: {
    search?: string;
    type?: string;
    status?: string;
    category?: string;
  } = {}): Promise<Partnership[]> {
    await new Promise((res) => setTimeout(res, 60));
    const all = getStoredPartnerships();

    return all.filter((p) => {
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesPartner = p.partnerName.toLowerCase().includes(q);
        const matchesProject = p.projectTitle.toLowerCase().includes(q);
        const matchesCategory = p.projectCategory.toLowerCase().includes(q);
        const matchesTeam = p.teamName.toLowerCase().includes(q);
        const matchesInst = p.institutionName.toLowerCase().includes(q);
        if (!matchesPartner && !matchesProject && !matchesCategory && !matchesTeam && !matchesInst) {
          return false;
        }
      }

      if (filters.type && filters.type !== "ALL" && filters.type !== "All Types") {
        if (p.partnershipType !== filters.type) return false;
      }

      if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
        if (p.status !== filters.status) return false;
      }

      if (filters.category && filters.category !== "ALL" && filters.category !== "All Categories") {
        if (p.projectCategory !== filters.category) return false;
      }

      return true;
    });
  },

  async getPartnershipById(id: string): Promise<Partnership | null> {
    await new Promise((res) => setTimeout(res, 50));
    const all = getStoredPartnerships();
    return all.find((p) => p.id === id) || null;
  },

  async createPartnership(data: {
    partnerName: string;
    partnerType: Partnership["partnerType"];
    contactPerson: string;
    contactEmail: string;
    projectId: string;
    projectTitle: string;
    projectCategory: string;
    teamName: string;
    institutionName: string;
    partnershipType: Partnership["partnershipType"];
    totalCommittedFunding: number;
    equipmentSponsorshipValue?: number;
    equipmentDetails?: string;
    synopsis: string;
    initialTrancheAmount?: number;
  }): Promise<Partnership> {
    await new Promise((res) => setTimeout(res, 90));
    const all = getStoredPartnerships();

    const newId = `part-${Date.now()}`;
    const initialTranches: FundingTranche[] = [];

    if (data.totalCommittedFunding > 0) {
      const firstAmount = data.initialTrancheAmount || Math.round(data.totalCommittedFunding * 0.4);
      initialTranches.push({
        id: `tr-${Date.now()}-1`,
        partnershipId: newId,
        trancheNumber: 1,
        amount: firstAmount,
        linkedMilestoneId: "ms-init-1",
        linkedMilestoneTitle: "Initial Architecture & Proof of Concept Verification",
        status: "ELIGIBLE",
        evidenceRequired: "Detailed research architecture and approved proposal dossier.",
      });

      if (data.totalCommittedFunding > firstAmount) {
        initialTranches.push({
          id: `tr-${Date.now()}-2`,
          partnershipId: newId,
          trancheNumber: 2,
          amount: data.totalCommittedFunding - firstAmount,
          linkedMilestoneId: "ms-init-2",
          linkedMilestoneTitle: "Working Prototype & Field Pilot Demonstration",
          status: "COMMITTED",
          evidenceRequired: "Working prototype test logs and Gram Panchayat/Municipal pilot agreement.",
        });
      }
    }

    const newPartnership: Partnership = {
      id: newId,
      partnerName: data.partnerName,
      partnerType: data.partnerType,
      contactPerson: data.contactPerson,
      contactEmail: data.contactEmail,
      projectId: data.projectId,
      projectTitle: data.projectTitle,
      projectCategory: data.projectCategory,
      teamName: data.teamName,
      institutionName: data.institutionName,
      partnershipType: data.partnershipType,
      status: "ACTIVE",
      totalCommittedFunding: data.totalCommittedFunding,
      totalReleasedFunding: 0,
      equipmentSponsorshipValue: data.equipmentSponsorshipValue || 0,
      equipmentDetails: data.equipmentDetails,
      mouSignedDate: new Date().toISOString(),
      tranches: initialTranches,
      mentors: [],
      sessions: [],
      deployments: [],
      techTransfer: {
        id: `tt-${Date.now()}`,
        partnershipId: newId,
        projectId: data.projectId,
        licenseType: "NON_EXCLUSIVE_COMMERCIAL",
        commercializationReadinessLevel: 4,
        targetMarket: "Corporate & Municipal Infrastructure",
        adoptionStatus: "LAB_TEST",
        agreementDate: new Date().toISOString(),
      },
      synopsis: data.synopsis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newPartnership, ...all];
    saveStoredPartnerships(updated);
    return newPartnership;
  },

  async releaseFundingTranche(
    partnershipId: string,
    trancheId: string,
    disbursedBy: string = "Corporate CSR Bureau",
    notes?: string
  ): Promise<FundingTranche> {
    await new Promise((res) => setTimeout(res, 80));
    const all = getStoredPartnerships();
    const partnership = all.find((p) => p.id === partnershipId);
    if (!partnership) throw new Error("Partnership not found");

    const tranche = partnership.tranches.find((t) => t.id === trancheId);
    if (!tranche) throw new Error("Tranche not found");

    tranche.status = "RELEASED";
    tranche.releaseDate = new Date().toISOString();
    tranche.disbursedBy = disbursedBy;
    if (notes) tranche.notes = notes;

    partnership.totalReleasedFunding = partnership.tranches
      .filter((t) => t.status === "RELEASED")
      .reduce((acc, t) => acc + t.amount, 0);

    partnership.updatedAt = new Date().toISOString();
    saveStoredPartnerships(all);
    return tranche;
  },

  async logMentorshipSession(
    partnershipId: string,
    sessionData: {
      mentorId: string;
      mentorName: string;
      sessionDate: string;
      durationHours: number;
      topic: string;
      notes: string;
      actionItems: string[];
    }
  ): Promise<MentorshipSession> {
    await new Promise((res) => setTimeout(res, 80));
    const all = getStoredPartnerships();
    const mentors = getStoredMentors();
    const partnership = all.find((p) => p.id === partnershipId);
    if (!partnership) throw new Error("Partnership not found");

    const newSession: MentorshipSession = {
      id: `sess-${Date.now()}`,
      partnershipId,
      projectId: partnership.projectId,
      mentorId: sessionData.mentorId,
      mentorName: sessionData.mentorName,
      sessionDate: sessionData.sessionDate,
      durationHours: sessionData.durationHours,
      topic: sessionData.topic,
      notes: sessionData.notes,
      actionItems: sessionData.actionItems,
    };

    partnership.sessions.unshift(newSession);

    // Update mentor total logged hours
    const mentor = mentors.find((m) => m.id === sessionData.mentorId);
    if (mentor) {
      mentor.totalHoursLogged += sessionData.durationHours;
      saveStoredMentors(mentors);
    }

    partnership.updatedAt = new Date().toISOString();
    saveStoredPartnerships(all);
    return newSession;
  },

  async recordPilotEvidence(
    partnershipId: string,
    deploymentId: string,
    evidenceData: {
      title: string;
      type: "PHOTO" | "TELEMETRY_LOG" | "MOU_COPY" | "FIELD_SURVEY";
      url: string;
      uploadedBy: string;
    }
  ): Promise<PilotDeployment> {
    await new Promise((res) => setTimeout(res, 90));
    const all = getStoredPartnerships();
    const partnership = all.find((p) => p.id === partnershipId);
    if (!partnership) throw new Error("Partnership not found");

    const deployment = partnership.deployments.find((d) => d.id === deploymentId);
    if (!deployment) throw new Error("Deployment not found");

    deployment.evidenceFiles.unshift({
      id: `ev-${Date.now()}`,
      title: evidenceData.title,
      type: evidenceData.type,
      url: evidenceData.url,
      uploadedAt: new Date().toISOString(),
      uploadedBy: evidenceData.uploadedBy,
    });
    deployment.evidenceCount = deployment.evidenceFiles.length;

    partnership.updatedAt = new Date().toISOString();
    saveStoredPartnerships(all);
    return deployment;
  },

  async createDeployment(
    partnershipId: string,
    deploymentData: {
      locationName: string;
      district: string;
      state: string;
      installedUnits: number;
      beneficiariesCount: number;
      impactSummary: string;
      telemetryLiveUrl?: string;
    }
  ): Promise<PilotDeployment> {
    await new Promise((res) => setTimeout(res, 80));
    const all = getStoredPartnerships();
    const partnership = all.find((p) => p.id === partnershipId);
    if (!partnership) throw new Error("Partnership not found");

    const newDep: PilotDeployment = {
      id: `dep-${Date.now()}`,
      partnershipId,
      projectId: partnership.projectId,
      projectTitle: partnership.projectTitle,
      locationName: deploymentData.locationName,
      district: deploymentData.district,
      state: deploymentData.state,
      status: "LIVE_TELEMETRY",
      installedUnits: deploymentData.installedUnits,
      beneficiariesCount: deploymentData.beneficiariesCount,
      startDate: new Date().toISOString(),
      telemetryLiveUrl: deploymentData.telemetryLiveUrl,
      evidenceCount: 1,
      evidenceFiles: [
        {
          id: `ev-${Date.now()}`,
          title: `Field Commissioning Certificate - ${deploymentData.locationName}`,
          type: "MOU_COPY",
          url: "https://sicp.gov.in/evidence/commissioning-cert.pdf",
          uploadedAt: new Date().toISOString(),
          uploadedBy: partnership.contactPerson,
        },
      ],
      impactSummary: deploymentData.impactSummary,
    };

    partnership.deployments.unshift(newDep);
    partnership.updatedAt = new Date().toISOString();
    saveStoredPartnerships(all);
    return newDep;
  },

  async updateTechTransfer(
    partnershipId: string,
    techTransferData: Partial<TechTransferTracker>
  ): Promise<TechTransferTracker> {
    await new Promise((res) => setTimeout(res, 70));
    const all = getStoredPartnerships();
    const partnership = all.find((p) => p.id === partnershipId);
    if (!partnership) throw new Error("Partnership not found");

    partnership.techTransfer = {
      ...partnership.techTransfer,
      ...techTransferData,
    };

    partnership.updatedAt = new Date().toISOString();
    saveStoredPartnerships(all);
    return partnership.techTransfer;
  },

  async listAllFundingTranches(filters: {
    status?: string;
    search?: string;
  } = {}): Promise<
    (FundingTranche & {
      partnerName: string;
      projectTitle: string;
      category: string;
    })[]
  > {
    await new Promise((res) => setTimeout(res, 60));
    const all = getStoredPartnerships();

    const flattened = all.flatMap((p) =>
      p.tranches.map((t) => ({
        ...t,
        partnerName: p.partnerName,
        projectTitle: p.projectTitle,
        category: p.projectCategory,
      }))
    );

    return flattened.filter((t) => {
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesPartner = t.partnerName.toLowerCase().includes(q);
        const matchesProject = t.projectTitle.toLowerCase().includes(q);
        const matchesMilestone = t.linkedMilestoneTitle.toLowerCase().includes(q);
        if (!matchesPartner && !matchesProject && !matchesMilestone) return false;
      }

      if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
        if (t.status !== filters.status) return false;
      }

      return true;
    });
  },

  async listAllMentors(filters: { search?: string } = {}): Promise<IndustryMentor[]> {
    await new Promise((res) => setTimeout(res, 50));
    const mentors = getStoredMentors();
    if (!filters.search || !filters.search.trim()) return mentors;
    const q = filters.search.toLowerCase().trim();
    return mentors.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.expertise.some((e) => e.toLowerCase().includes(q))
    );
  },

  async listAllDeployments(filters: {
    status?: string;
    search?: string;
  } = {}): Promise<PilotDeployment[]> {
    await new Promise((res) => setTimeout(res, 60));
    const all = getStoredPartnerships();
    const flattened = all.flatMap((p) => p.deployments);

    return flattened.filter((d) => {
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesLoc = d.locationName.toLowerCase().includes(q);
        const matchesDist = d.district.toLowerCase().includes(q);
        const matchesState = d.state.toLowerCase().includes(q);
        const matchesProj = d.projectTitle.toLowerCase().includes(q);
        if (!matchesLoc && !matchesDist && !matchesState && !matchesProj) return false;
      }

      if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
        if (d.status !== filters.status) return false;
      }

      return true;
    });
  },
};
