import {
  Team,
  TeamMember,
  TeamInvitation,
  JoinRequest,
  TeamActivity,
  CreateTeamInput,
  TeamFiltersState,
  TeamRole,
} from "@/features/teams/types/team.types";
import {
  MOCK_TEAMS,
  MOCK_INVITATIONS,
  MOCK_JOIN_REQUESTS,
  MOCK_ACTIVITIES,
} from "@/mock/teams.mock";

const TEAMS_STORAGE_KEY = "sicp_teams_store_v1";
const INVITATIONS_STORAGE_KEY = "sicp_invitations_store_v1";
const REQUESTS_STORAGE_KEY = "sicp_requests_store_v1";
const ACTIVITIES_STORAGE_KEY = "sicp_activities_store_v1";

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
    console.error(`Failed to persist storage for ${key}:`, err);
  }
}

export const teamService = {
  async listTeams(filters: TeamFiltersState = {}): Promise<{
    items: Team[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    await new Promise((res) => setTimeout(res, 80));
    const all = getStored<Team>(TEAMS_STORAGE_KEY, MOCK_TEAMS);

    let filtered = all.filter((t) => {
      // Search
      if (filters.search && filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesLeader = t.leaderName.toLowerCase().includes(query);
        const matchesInst = t.institution.toLowerCase().includes(query);
        const matchesChallenge = t.challengeTitle?.toLowerCase().includes(query) || false;
        const matchesSkills = t.requiredSkills.some((s) => s.toLowerCase().includes(query));

        if (!matchesName && !matchesDesc && !matchesLeader && !matchesInst && !matchesChallenge && !matchesSkills) {
          return false;
        }
      }

      // Skill filter
      if (filters.skill && filters.skill !== "ALL" && filters.skill !== "All Skills") {
        const hasSkill =
          t.requiredSkills.includes(filters.skill) ||
          t.members.some((m) => m.skills.includes(filters.skill as any));
        if (!hasSkill) return false;
      }

      // Status filter
      if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
        if (t.status !== filters.status) return false;
      }

      // Open slots filter
      if (filters.hasOpenSlots) {
        if (t.members.length >= t.maxMembers || t.status === "LOCKED" || t.status === "COMPLETED") {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (filters.sortBy === "members") {
      filtered.sort((a, b) => b.members.length - a.members.length);
    } else if (filters.sortBy === "progress") {
      filtered.sort((a, b) => (b.projectProgress || 0) - (a.projectProgress || 0));
    } else if (filters.sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
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

    return { items, total, page, limit, totalPages };
  },

  async getTeam(id: string): Promise<Team & { activities: TeamActivity[]; joinRequests: JoinRequest[] }> {
    await new Promise((res) => setTimeout(res, 60));
    const all = getStored<Team>(TEAMS_STORAGE_KEY, MOCK_TEAMS);
    const found = all.find((t) => t.id === id);

    if (!found) {
      throw new Error(`Team with ID "${id}" was not found.`);
    }

    const allActivities = getStored<TeamActivity>(ACTIVITIES_STORAGE_KEY, MOCK_ACTIVITIES);
    const teamActivities = allActivities.filter((a) => a.teamId === id);

    const allRequests = getStored<JoinRequest>(REQUESTS_STORAGE_KEY, MOCK_JOIN_REQUESTS);
    const teamRequests = allRequests.filter((r) => r.teamId === id);

    return {
      ...found,
      activities: teamActivities.length > 0 ? teamActivities : MOCK_ACTIVITIES.slice(0, 3),
      joinRequests: teamRequests,
    };
  },

  async createTeam(
    input: CreateTeamInput,
    currentUser: { id: string; name: string; email: string; institution?: string; department?: string }
  ): Promise<Team> {
    await new Promise((res) => setTimeout(res, 120));
    const all = getStored<Team>(TEAMS_STORAGE_KEY, MOCK_TEAMS);

    const newId = `team-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();

    const leaderMember: TeamMember = {
      id: `tm-${Date.now()}-lead`,
      userId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: "LEADER",
      skills: ["Product Lead", "Coordination", ...input.requiredSkills.slice(0, 2)],
      department: currentUser.department || "Academic Research Division",
      institution: currentUser.institution || "University Innovation Center",
      joinedAt: nowIso,
    };

    const newTeam: Team = {
      id: newId,
      name: input.name,
      description: input.description,
      challengeId: input.challengeId,
      challengeTitle: input.challengeTitle,
      challengeCategory: input.challengeCategory || "General Innovation",
      status: "RECRUITING",
      leaderId: currentUser.id,
      leaderName: currentUser.name,
      institution: currentUser.institution || "University Innovation Center",
      members: [leaderMember],
      requiredSkills: input.requiredSkills,
      maxMembers: input.maxMembers || 6,
      minMembers: input.minMembers || 2,
      createdAt: nowIso,
      updatedAt: nowIso,
      projectProgress: 10,
      tags: ["student-innovation", "capstone-squad"],
    };

    const updatedTeams = [newTeam, ...all];
    saveStored<Team>(TEAMS_STORAGE_KEY, updatedTeams);

    // Add activity log
    const allActivities = getStored<TeamActivity>(ACTIVITIES_STORAGE_KEY, MOCK_ACTIVITIES);
    const newActivity: TeamActivity = {
      id: `act-${Date.now()}`,
      teamId: newId,
      type: "MEMBER_JOINED",
      title: "Team Created",
      description: `${currentUser.name} established team '${input.name}'.`,
      actorName: currentUser.name,
      timestamp: nowIso,
    };
    saveStored<TeamActivity>(ACTIVITIES_STORAGE_KEY, [newActivity, ...allActivities]);

    return newTeam;
  },

  async requestJoin(
    teamId: string,
    user: { id: string; name: string; email: string; institution?: string; skills: string[] },
    statement: string
  ): Promise<JoinRequest> {
    await new Promise((res) => setTimeout(res, 80));
    const allTeams = getStored<Team>(TEAMS_STORAGE_KEY, MOCK_TEAMS);
    const team = allTeams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found.");

    const allRequests = getStored<JoinRequest>(REQUESTS_STORAGE_KEY, MOCK_JOIN_REQUESTS);
    const newReq: JoinRequest = {
      id: `req-${Date.now()}`,
      teamId,
      teamName: team.name,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userSkills: user.skills.length > 0 ? user.skills : ["General Engineering"],
      institution: user.institution || "National Tech Institute",
      status: "PENDING",
      statement,
      createdAt: new Date().toISOString(),
    };

    saveStored<JoinRequest>(REQUESTS_STORAGE_KEY, [newReq, ...allRequests]);

    // Log activity
    const allActivities = getStored<TeamActivity>(ACTIVITIES_STORAGE_KEY, MOCK_ACTIVITIES);
    const newAct: TeamActivity = {
      id: `act-${Date.now()}`,
      teamId,
      type: "JOIN_REQUEST",
      title: "Join Request Received",
      description: `${user.name} requested to join the squad.`,
      actorName: user.name,
      timestamp: new Date().toISOString(),
    };
    saveStored<TeamActivity>(ACTIVITIES_STORAGE_KEY, [newAct, ...allActivities]);

    return newReq;
  },

  async listInvitations(type: "incoming" | "outgoing" = "incoming"): Promise<TeamInvitation[]> {
    await new Promise((res) => setTimeout(res, 50));
    const all = getStored<TeamInvitation>(INVITATIONS_STORAGE_KEY, MOCK_INVITATIONS);
    if (type === "incoming") {
      return all.filter((inv) => inv.inviteeId === "usr-current" || inv.inviteeEmail.includes("student"));
    }
    return all.filter((inv) => inv.inviterId === "usr-current" || inv.inviterName === "Current User");
  },

  async respondInvitation(
    invitationId: string,
    action: "ACCEPT" | "REJECT" | "CANCEL"
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 70));
    const all = getStored<TeamInvitation>(INVITATIONS_STORAGE_KEY, MOCK_INVITATIONS);
    const inv = all.find((i) => i.id === invitationId);
    if (!inv) throw new Error("Invitation not found.");

    inv.status = action === "ACCEPT" ? "ACCEPTED" : action === "REJECT" ? "REJECTED" : "CANCELLED";
    inv.respondedAt = new Date().toISOString();
    saveStored<TeamInvitation>(INVITATIONS_STORAGE_KEY, all);

    if (action === "ACCEPT") {
      // Add member to team
      const allTeams = getStored<Team>(TEAMS_STORAGE_KEY, MOCK_TEAMS);
      const team = allTeams.find((t) => t.id === inv.teamId);
      if (team && !team.members.some((m) => m.userId === inv.inviteeId)) {
        team.members.push({
          id: `tm-${Date.now()}`,
          userId: inv.inviteeId,
          name: inv.inviteeName,
          email: inv.inviteeEmail,
          role: inv.role,
          skills: ["Engineering", "Collaboration"],
          joinedAt: new Date().toISOString(),
        });
        saveStored<Team>(TEAMS_STORAGE_KEY, allTeams);
      }
    }

    return {
      success: true,
      message: `Invitation ${action.toLowerCase()}ed successfully.`,
    };
  },

  async sendInvitation(
    teamId: string,
    invitee: { name: string; email: string; role: TeamRole; message?: string },
    inviter: { id: string; name: string }
  ): Promise<TeamInvitation> {
    await new Promise((res) => setTimeout(res, 80));
    const allTeams = getStored<Team>(TEAMS_STORAGE_KEY, MOCK_TEAMS);
    const team = allTeams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found.");

    const allInvitations = getStored<TeamInvitation>(INVITATIONS_STORAGE_KEY, MOCK_INVITATIONS);
    const newInv: TeamInvitation = {
      id: `inv-${Date.now()}`,
      teamId,
      teamName: team.name,
      inviterId: inviter.id,
      inviterName: inviter.name,
      inviteeId: `usr-${Date.now()}`,
      inviteeName: invitee.name,
      inviteeEmail: invitee.email,
      role: invitee.role,
      status: "PENDING",
      message: invitee.message,
      createdAt: new Date().toISOString(),
    };

    saveStored<TeamInvitation>(INVITATIONS_STORAGE_KEY, [newInv, ...allInvitations]);
    return newInv;
  },

  async listJoinRequests(teamId?: string): Promise<JoinRequest[]> {
    await new Promise((res) => setTimeout(res, 50));
    const all = getStored<JoinRequest>(REQUESTS_STORAGE_KEY, MOCK_JOIN_REQUESTS);
    if (teamId) {
      return all.filter((r) => r.teamId === teamId);
    }
    return all;
  },

  async respondJoinRequest(
    requestId: string,
    action: "APPROVE" | "REJECT"
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 70));
    const all = getStored<JoinRequest>(REQUESTS_STORAGE_KEY, MOCK_JOIN_REQUESTS);
    const req = all.find((r) => r.id === requestId);
    if (!req) throw new Error("Join request not found.");

    req.status = action === "APPROVE" ? "APPROVED" : "REJECTED";
    req.respondedAt = new Date().toISOString();
    saveStored<JoinRequest>(REQUESTS_STORAGE_KEY, all);

    if (action === "APPROVE") {
      const allTeams = getStored<Team>(TEAMS_STORAGE_KEY, MOCK_TEAMS);
      const team = allTeams.find((t) => t.id === req.teamId);
      if (team && !team.members.some((m) => m.userId === req.userId)) {
        team.members.push({
          id: `tm-${Date.now()}`,
          userId: req.userId,
          name: req.userName,
          email: req.userEmail,
          role: "MEMBER",
          skills: req.userSkills,
          institution: req.institution,
          joinedAt: new Date().toISOString(),
        });
        saveStored<Team>(TEAMS_STORAGE_KEY, allTeams);
      }
    }

    return {
      success: true,
      message: `Join request ${action.toLowerCase()}d successfully.`,
    };
  },
};
