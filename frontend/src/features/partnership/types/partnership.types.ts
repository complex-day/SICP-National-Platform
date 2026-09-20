export type PartnershipType =
  | "CSR_FUNDING"
  | "EQUIPMENT_SPONSORSHIP"
  | "MENTORSHIP_ADVISORY"
  | "JOINT_PILOT"
  | "TECH_TRANSFER";

export const PARTNERSHIP_TYPES: PartnershipType[] = [
  "CSR_FUNDING",
  "EQUIPMENT_SPONSORSHIP",
  "MENTORSHIP_ADVISORY",
  "JOINT_PILOT",
  "TECH_TRANSFER",
];

export type PartnershipStatus =
  | "PROPOSED"
  | "MOU_SIGNED"
  | "ACTIVE"
  | "COMPLETED"
  | "TERMINATED";

export const PARTNERSHIP_STATUSES: PartnershipStatus[] = [
  "PROPOSED",
  "MOU_SIGNED",
  "ACTIVE",
  "COMPLETED",
  "TERMINATED",
];

export type TrancheStatus =
  | "COMMITTED"
  | "ELIGIBLE"
  | "RELEASED"
  | "BLOCKED";

export interface FundingTranche {
  id: string;
  partnershipId: string;
  trancheNumber: number;
  amount: number;
  linkedMilestoneId: string;
  linkedMilestoneTitle: string;
  status: TrancheStatus;
  releaseDate?: string;
  disbursedBy?: string;
  notes?: string;
  evidenceRequired: string;
}

export interface IndustryMentor {
  id: string;
  name: string;
  designation: string;
  company: string;
  email: string;
  expertise: string[];
  totalHoursLogged: number;
  assignedProjectsCount: number;
  avatarUrl?: string;
}

export interface MentorshipSession {
  id: string;
  partnershipId: string;
  projectId: string;
  mentorId: string;
  mentorName: string;
  sessionDate: string;
  durationHours: number;
  topic: string;
  notes: string;
  actionItems: string[];
}

export type DeploymentStatus =
  | "SITE_IDENTIFIED"
  | "HARDWARE_INSTALLED"
  | "LIVE_TELEMETRY"
  | "EVALUATED"
  | "COMMERCIALIZED";

export const DEPLOYMENT_STATUSES: DeploymentStatus[] = [
  "SITE_IDENTIFIED",
  "HARDWARE_INSTALLED",
  "LIVE_TELEMETRY",
  "EVALUATED",
  "COMMERCIALIZED",
];

export interface DeploymentEvidenceFile {
  id: string;
  title: string;
  type: "PHOTO" | "TELEMETRY_LOG" | "MOU_COPY" | "FIELD_SURVEY";
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PilotDeployment {
  id: string;
  partnershipId: string;
  projectId: string;
  projectTitle: string;
  locationName: string;
  district: string;
  state: string;
  status: DeploymentStatus;
  installedUnits: number;
  beneficiariesCount: number;
  startDate: string;
  telemetryLiveUrl?: string;
  evidenceCount: number;
  evidenceFiles: DeploymentEvidenceFile[];
  impactSummary: string;
}

export type LicenseType =
  | "PROVISIONAL"
  | "NON_EXCLUSIVE_COMMERCIAL"
  | "EXCLUSIVE_PATENT"
  | "PUBLIC_COMMONS";

export type AdoptionStatus =
  | "LAB_TEST"
  | "PILOT_VALIDATED"
  | "PRODUCTION_READY"
  | "COMMERCIAL_SCALE";

export interface TechTransferTracker {
  id: string;
  partnershipId: string;
  projectId: string;
  licenseType: LicenseType;
  commercializationReadinessLevel: number; // 1 to 9 (CRL / TRL)
  patentApplicationNumber?: string;
  royaltyPercentage?: number;
  targetMarket: string;
  adoptionStatus: AdoptionStatus;
  agreementDate?: string;
}

export interface Partnership {
  id: string;
  partnerName: string;
  partnerLogoUrl?: string;
  partnerType: "CORPORATE_CSR" | "MSME" | "PSU" | "STARTUP_INCUBATOR";
  contactPerson: string;
  contactEmail: string;
  projectId: string;
  projectTitle: string;
  projectCategory: string;
  teamName: string;
  institutionName: string;
  partnershipType: PartnershipType;
  status: PartnershipStatus;
  totalCommittedFunding: number;
  totalReleasedFunding: number;
  equipmentSponsorshipValue?: number;
  equipmentDetails?: string;
  mouSignedDate: string;
  tranches: FundingTranche[];
  mentors: IndustryMentor[];
  sessions: MentorshipSession[];
  deployments: PilotDeployment[];
  techTransfer: TechTransferTracker;
  synopsis: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndustryKPIs {
  activePartnerships: number;
  totalCSRFundingCommitted: number;
  totalCSRFundingDisbursed: number;
  activeIndustryMentors: number;
  pilotDeploymentsCount: number;
  fundingUtilizationPercentage: number;
  commercializedSolutions: number;
}
