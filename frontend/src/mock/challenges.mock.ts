import challengesData from "./challenges.json";
import { Challenge, ChallengeDetail, ChallengeTimelineEvent } from "@/features/challenges/types/challenge.types";

export const MOCK_CHALLENGES: Challenge[] = challengesData as Challenge[];

export const MOCK_TIMELINES: Record<string, ChallengeTimelineEvent[]> = {
  default: [
    {
      id: "tl-1",
      status: "DRAFT",
      title: "Challenge Draft Created",
      description: "Initial citizen observation recorded and saved as draft.",
      timestamp: "2026-02-10T09:00:00Z",
      author: "Citizen Reporter",
    },
    {
      id: "tl-2",
      status: "SUBMITTED",
      title: "Problem Formally Submitted",
      description: "Challenge verified by citizen with field photos and impact data.",
      timestamp: "2026-02-12T14:30:00Z",
      author: "Citizen Reporter",
    },
    {
      id: "tl-3",
      status: "UNDER_REVIEW",
      title: "AI & Nodal Officer Triage",
      description: "AI classification score 94%. Nodal officer validated urgency level and jurisdiction.",
      timestamp: "2026-02-15T11:20:00Z",
      author: "District Innovation Cell",
      role: "Government Nodal Officer",
    },
  ],
  claimed: [
    {
      id: "tl-1",
      status: "DRAFT",
      title: "Challenge Draft Created",
      description: "Initial draft recorded.",
      timestamp: "2026-01-15T08:00:00Z",
      author: "Citizen Reporter",
    },
    {
      id: "tl-2",
      status: "SUBMITTED",
      title: "Submitted to Portal",
      description: "Problem published for university discovery.",
      timestamp: "2026-01-16T10:00:00Z",
      author: "Citizen Reporter",
    },
    {
      id: "tl-3",
      status: "UNDER_REVIEW",
      title: "Triage Approved",
      description: "Approved for academic and R&D matching.",
      timestamp: "2026-01-18T12:00:00Z",
      author: "State Nodal Officer",
    },
    {
      id: "tl-4",
      status: "CLAIMED",
      title: "Claimed by Research Team",
      description: "Team IIT Roorkee HydroTech claimed this challenge for Capstone R&D.",
      timestamp: "2026-01-25T16:45:00Z",
      author: "Dr. Ananya Sharma",
      role: "Faculty Mentor",
    },
  ],
  in_progress: [
    {
      id: "tl-1",
      status: "DRAFT",
      title: "Draft Created",
      timestamp: "2026-01-05T09:00:00Z",
      author: "Citizen",
    },
    {
      id: "tl-2",
      status: "SUBMITTED",
      title: "Submitted",
      timestamp: "2026-01-07T10:00:00Z",
      author: "Citizen",
    },
    {
      id: "tl-3",
      status: "UNDER_REVIEW",
      title: "Reviewed & Verified",
      timestamp: "2026-01-10T14:00:00Z",
      author: "District Coordinator",
    },
    {
      id: "tl-4",
      status: "CLAIMED",
      title: "Claimed by University Lab",
      timestamp: "2026-01-15T11:00:00Z",
      author: "NIT Trichy Innovators",
    },
    {
      id: "tl-5",
      status: "IN_PROGRESS",
      title: "Prototype Field Deployment",
      description: "Hardware sensor nodes deployed on-site for water flow telemetry monitoring.",
      timestamp: "2026-02-01T09:30:00Z",
      author: "Team Lead",
    },
  ],
  resolved: [
    {
      id: "tl-1",
      status: "DRAFT",
      title: "Challenge Draft Created",
      timestamp: "2025-11-01T08:00:00Z",
      author: "Citizen",
    },
    {
      id: "tl-2",
      status: "SUBMITTED",
      title: "Challenge Submitted",
      timestamp: "2025-11-02T10:00:00Z",
      author: "Citizen",
    },
    {
      id: "tl-3",
      status: "UNDER_REVIEW",
      title: "Triage & Vetting",
      timestamp: "2025-11-05T12:00:00Z",
      author: "Nodal Officer",
    },
    {
      id: "tl-4",
      status: "CLAIMED",
      title: "Claimed by Academic Team",
      timestamp: "2025-11-12T15:00:00Z",
      author: "COEP Tech Team",
    },
    {
      id: "tl-5",
      status: "IN_PROGRESS",
      title: "Pilot Testing & Validation",
      timestamp: "2025-12-01T10:00:00Z",
      author: "COEP Tech Team",
    },
    {
      id: "tl-6",
      status: "RESOLVED",
      title: "Solution Deployed & Verified",
      description: "Solar-powered IoT water filtration unit operational. SROI evaluated at 4.2x.",
      timestamp: "2026-01-20T17:00:00Z",
      author: "District Collectorate Verification",
    },
  ],
};

export function getTimelineForStatus(status: string): ChallengeTimelineEvent[] {
  switch (status) {
    case "CLAIMED":
      return MOCK_TIMELINES.claimed;
    case "IN_PROGRESS":
      return MOCK_TIMELINES.in_progress;
    case "RESOLVED":
      return MOCK_TIMELINES.resolved;
    default:
      return MOCK_TIMELINES.default;
  }
}
