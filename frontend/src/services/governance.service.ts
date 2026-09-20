import {
  NationalKPIs,
  DomainDistribution,
  InnovationFunnelStage,
  DistrictDIRIScorecard,
  StatePerformanceSnapshot,
  UniversityUPIScorecard,
  SponsorSRIScorecard,
  ProjectSROIReport,
  PublicAuditEntry,
} from "@/features/governance/types/governance.types";
import {
  MOCK_NATIONAL_KPIS,
  MOCK_DOMAIN_DISTRIBUTIONS,
  MOCK_INNOVATION_FUNNEL,
  MOCK_DISTRICT_DIRI,
  MOCK_STATE_PERFORMANCE,
  MOCK_UNIVERSITY_UPI,
  MOCK_SPONSOR_SRI,
  MOCK_PROJECT_SROI_REPORTS,
  MOCK_PUBLIC_AUDIT_LEDGER,
} from "@/mock/governance.mock";

const AUDIT_LEDGER_STORAGE_KEY = "sicp_audit_ledger_v1";

function getStoredAuditLedger(): PublicAuditEntry[] {
  if (typeof window === "undefined") return MOCK_PUBLIC_AUDIT_LEDGER;
  try {
    const raw = localStorage.getItem(AUDIT_LEDGER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        AUDIT_LEDGER_STORAGE_KEY,
        JSON.stringify(MOCK_PUBLIC_AUDIT_LEDGER)
      );
      return MOCK_PUBLIC_AUDIT_LEDGER;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : MOCK_PUBLIC_AUDIT_LEDGER;
  } catch {
    return MOCK_PUBLIC_AUDIT_LEDGER;
  }
}

export const governanceService = {
  async getNationalKPIs(): Promise<NationalKPIs> {
    await new Promise((res) => setTimeout(res, 50));
    return MOCK_NATIONAL_KPIS;
  },

  async getDomainDistributions(): Promise<DomainDistribution[]> {
    await new Promise((res) => setTimeout(res, 40));
    return MOCK_DOMAIN_DISTRIBUTIONS;
  },

  async getInnovationFunnel(): Promise<InnovationFunnelStage[]> {
    await new Promise((res) => setTimeout(res, 40));
    return MOCK_INNOVATION_FUNNEL;
  },

  async listDistrictRankings(
    filters: {
      search?: string;
      tier?: string;
      state?: string;
    } = {}
  ): Promise<DistrictDIRIScorecard[]> {
    await new Promise((res) => setTimeout(res, 60));
    let data = [...MOCK_DISTRICT_DIRI];

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      data = data.filter(
        (d) =>
          d.districtName.toLowerCase().includes(q) ||
          d.stateName.toLowerCase().includes(q) ||
          d.topDomain.toLowerCase().includes(q)
      );
    }

    if (filters.tier && filters.tier !== "ALL") {
      data = data.filter((d) => d.tier === filters.tier);
    }

    if (filters.state && filters.state !== "ALL") {
      data = data.filter((d) => d.stateName === filters.state);
    }

    return data;
  },

  async listStateRankings(
    filters: {
      search?: string;
      region?: string;
    } = {}
  ): Promise<StatePerformanceSnapshot[]> {
    await new Promise((res) => setTimeout(res, 60));
    let data = [...MOCK_STATE_PERFORMANCE];

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      data = data.filter(
        (s) =>
          s.stateName.toLowerCase().includes(q) ||
          s.stateCode.toLowerCase().includes(q)
      );
    }

    if (filters.region && filters.region !== "ALL") {
      data = data.filter((s) => s.region === filters.region);
    }

    return data;
  },

  async listUniversityRankings(
    filters: {
      search?: string;
      tier?: string;
      state?: string;
    } = {}
  ): Promise<UniversityUPIScorecard[]> {
    await new Promise((res) => setTimeout(res, 60));
    let data = [...MOCK_UNIVERSITY_UPI];

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      data = data.filter(
        (u) =>
          u.universityName.toLowerCase().includes(q) ||
          u.stateName.toLowerCase().includes(q) ||
          u.accreditationGrade.toLowerCase().includes(q)
      );
    }

    if (filters.tier && filters.tier !== "ALL") {
      data = data.filter((u) => u.tier === filters.tier);
    }

    if (filters.state && filters.state !== "ALL") {
      data = data.filter((u) => u.stateName === filters.state);
    }

    return data;
  },

  async listSponsorRankings(
    filters: {
      search?: string;
      tier?: string;
      type?: string;
    } = {}
  ): Promise<SponsorSRIScorecard[]> {
    await new Promise((res) => setTimeout(res, 60));
    let data = [...MOCK_SPONSOR_SRI];

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      data = data.filter(
        (s) =>
          s.companyName.toLowerCase().includes(q) ||
          s.complianceRating.toLowerCase().includes(q)
      );
    }

    if (filters.tier && filters.tier !== "ALL") {
      data = data.filter((s) => s.tier === filters.tier);
    }

    if (filters.type && filters.type !== "ALL") {
      data = data.filter((s) => s.partnerType === filters.type);
    }

    return data;
  },

  async listProjectSROIReports(
    filters: {
      search?: string;
      category?: string;
    } = {}
  ): Promise<ProjectSROIReport[]> {
    await new Promise((res) => setTimeout(res, 50));
    let data = [...MOCK_PROJECT_SROI_REPORTS];

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      data = data.filter(
        (p) =>
          p.projectTitle.toLowerCase().includes(q) ||
          p.districtName.toLowerCase().includes(q) ||
          p.institutionName.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== "ALL") {
      data = data.filter((p) => p.domainCategory === filters.category);
    }

    return data;
  },

  async getPublicAuditLedger(
    filters: {
      search?: string;
      module?: string;
      eventType?: string;
    } = {}
  ): Promise<PublicAuditEntry[]> {
    await new Promise((res) => setTimeout(res, 60));
    let data = getStoredAuditLedger();

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      data = data.filter(
        (e) =>
          e.entityTitle.toLowerCase().includes(q) ||
          e.sha256Digest.toLowerCase().includes(q) ||
          e.eventType.toLowerCase().includes(q) ||
          e.actorRole.toLowerCase().includes(q)
      );
    }

    if (filters.module && filters.module !== "ALL") {
      data = data.filter((e) => e.sourceModule === filters.module);
    }

    if (filters.eventType && filters.eventType !== "ALL") {
      data = data.filter((e) => e.eventType === filters.eventType);
    }

    return data;
  },

  async verifySha256Digest(digest: string): Promise<{
    isValid: boolean;
    entry: PublicAuditEntry | null;
    timestamp?: string;
    blockIndex?: number;
  }> {
    await new Promise((res) => setTimeout(res, 70));
    const ledger = getStoredAuditLedger();
    const index = ledger.findIndex(
      (e) => e.sha256Digest.toLowerCase() === digest.toLowerCase().trim()
    );

    if (index !== -1) {
      return {
        isValid: true,
        entry: ledger[index],
        timestamp: ledger[index].timestamp,
        blockIndex: ledger.length - index,
      };
    }

    return {
      isValid: false,
      entry: null,
    };
  },

  async exportMcaCsrPackage(partnerId: string): Promise<{
    success: boolean;
    certificateNumber: string;
    disbursedAmount: number;
    financialYear: string;
    partnerName: string;
  }> {
    await new Promise((res) => setTimeout(res, 90));
    const sponsor = MOCK_SPONSOR_SRI.find((s) => s.partnerId === partnerId);
    return {
      success: true,
      certificateNumber: `MCA-CSR1-${Date.now().toString().slice(-8)}`,
      disbursedAmount: sponsor ? sponsor.releasedFunds : 1500000,
      financialYear: "FY 2026-27",
      partnerName: sponsor ? sponsor.companyName : "Corporate CSR Partner",
    };
  },

  async exportNaacNirfPackage(universityId: string): Promise<{
    success: boolean;
    dossierId: string;
    academicYear: string;
    universityName: string;
    verifiedProjectsCount: number;
  }> {
    await new Promise((res) => setTimeout(res, 90));
    const univ = MOCK_UNIVERSITY_UPI.find((u) => u.universityId === universityId);
    return {
      success: true,
      dossierId: `NAAC-NIRF-EV-${Date.now().toString().slice(-8)}`,
      academicYear: "AY 2026-27",
      universityName: univ ? univ.universityName : "Higher Education Institution",
      verifiedProjectsCount: univ ? univ.activeProjects : 28,
    };
  },
};
