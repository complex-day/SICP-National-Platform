export interface NationalKPIs {
  totalChallenges: number;
  resolvedChallenges: number;
  resolutionRate: number; // percentage
  activeProjects: number;
  activeStudentTeams: number;
  universitiesParticipating: number;
  industryPartners: number;
  totalCSRCapitalCommitted: number; // in INR
  totalCSRCapitalDisbursed: number; // in INR
  verifiedBeneficiaries: number;
  averageSROIRatio: number; // e.g. 4.82x
  deploymentSuccessRate: number; // percentage
  publicAuditRecordsCount: number;
}

export interface DomainDistribution {
  category: string;
  challengesCount: number;
  activeProjectsCount: number;
  csrCapitalAllocated: number; // in INR
  verifiedBeneficiaries: number;
  sroiRatio: number;
  percentageShare: number;
  color: string;
}

export interface InnovationFunnelStage {
  id: string;
  stageName: string;
  count: number;
  conversionRateFromPrevious: number; // percentage (100% for first)
  averageDurationDays: number;
  description: string;
}

export type DIRITier = "TIER_1_EXCELLENCE" | "TIER_2_PROGRESSIVE" | "TIER_3_ASPIRATIONAL";

export interface DistrictDIRIScorecard {
  districtCode: string;
  districtName: string;
  stateName: string;
  totalChallenges: number;
  resolvedChallenges: number;
  resolutionRate: number; // 0 - 100
  activeProjects: number;
  activeStudentTeams: number;
  totalCSRCommitted: number;
  verifiedBeneficiaries: number;
  diriScore: number; // 0 - 100
  ranking: number;
  tier: DIRITier;
  topDomain: string;
}

export interface StatePerformanceSnapshot {
  stateCode: string;
  stateName: string;
  region: "NORTH" | "SOUTH" | "WEST" | "EAST" | "CENTRAL" | "NORTH_EAST";
  districtsCount: number;
  totalChallenges: number;
  resolvedChallenges: number;
  resolutionRate: number;
  universitiesCount: number;
  activeProjects: number;
  totalCSRDeployed: number;
  verifiedBeneficiaries: number;
  averageSROI: number;
  ranking: number;
}

export type UPITier = "PLATINUM" | "GOLD" | "SILVER" | "BRONZE";

export interface UniversityUPIScorecard {
  universityId: string;
  universityName: string;
  stateName: string;
  claimedChallenges: number;
  allocatedTeams: number;
  activeProjects: number;
  completedProjects: number;
  approvedMilestones: number;
  activeFacultyMentors: number;
  totalFundingSecured: number;
  patentsFiled: number;
  upiScore: number; // 0 - 100
  ranking: number;
  tier: UPITier;
  accreditationGrade: string; // e.g. "NAAC A++"
}

export type SRITier = "TIER_1_AAA" | "TIER_2_AA" | "TIER_3_A";

export interface SponsorSRIScorecard {
  partnerId: string;
  companyName: string;
  partnerType: "CORPORATE_CSR" | "MSME" | "PSU" | "STARTUP_INCUBATOR";
  committedFunds: number;
  releasedFunds: number;
  utilizationPercentage: number;
  scheduledTranchesCount: number;
  onTimeDisbursementsCount: number;
  mentorshipHoursDelivered: number;
  activeProjectsSponsored: number;
  sriScore: number; // 0 - 100
  ranking: number;
  tier: SRITier;
  complianceRating: string; // e.g. "MCA CSR-1 Certified"
}

export interface ProjectSROIReport {
  projectId: string;
  projectTitle: string;
  domainCategory: string;
  districtName: string;
  stateName: string;
  institutionName: string;
  capitalInvested: number;
  annualCivicCostSavings: number;
  verifiedBeneficiaries: number;
  netPresentSocietalValue: number;
  sroiRatio: number; // e.g. 5.40x
  psiScore: number; // Project Success Index 0 - 100
  crlLevel: number;
  isAudited: boolean;
}

export interface PublicAuditEntry {
  id: string;
  timestamp: string;
  eventType: string;
  sourceModule: "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7";
  entityType: string;
  entityId: string;
  entityTitle: string;
  actorRole: string;
  sha256Digest: string;
  previousBlockDigest: string;
  isVerified: boolean;
  metadataSummary: string;
}
