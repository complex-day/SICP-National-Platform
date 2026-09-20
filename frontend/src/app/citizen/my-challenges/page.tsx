"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Challenge } from "@/features/challenges/types/challenge.types";
import { ChallengeStatusBadge } from "@/features/challenge/components/ChallengeStatusBadge";
import { ChallengeUrgencyBadge } from "@/features/challenge/components/ChallengeUrgencyBadge";
import { challengeService } from "@/services/challenge.service";
import { useAuthStore } from "@/store/authStore";
import { Plus, ArrowUpRight, Inbox, MapPin, ThumbsUp } from "lucide-react";

export default function MyChallengesPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMyChallenges() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await challengeService.listMyChallenges(1, 50, user?.id);
        setChallenges(res.items);
      } catch (err: any) {
        setError(err.message || "Failed to load your submitted challenges.");
      } finally {
        setIsLoading(false);
      }
    }
    loadMyChallenges();
  }, [user?.id]);

  const columns: ColumnDef<Challenge>[] = [
    {
      key: "title",
      header: "Challenge Title",
      sortable: true,
      render: (row) => (
        <div className="max-w-md py-1">
          <Link
            href={`/challenges/${row.id}`}
            className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1 text-xs sm:text-sm"
          >
            {row.title}
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              {row.location?.district || "District"}, {row.location?.state || ""}
            </span>
            <span>•</span>
            <span>~{row.affectedPopulation.toLocaleString()} affected</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (row) => (
        <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-semibold whitespace-nowrap">
          {row.category}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <ChallengeStatusBadge status={row.status} />,
    },
    {
      key: "urgency",
      header: "Urgency",
      sortable: true,
      render: (row) => <ChallengeUrgencyBadge urgency={row.urgency} />,
    },
    {
      key: "createdAt",
      header: "Created Date",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <Link
          href={`/challenges/${row.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          <span>View</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        <PageHeader
          title="Citizen Challenge Tracker"
          description="Monitor verification progress, nodal officer triage, and academic R&D teams working on solutions for your reported challenges."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Citizen Portal", href: "/citizen/my-challenges" },
            { label: "My Challenges" },
          ]}
          actions={
            <Link
              href="/citizen/create-challenge"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Report New Challenge</span>
            </Link>
          }
        />

        {isLoading ? (
          <LoadingState message="Loading your submitted challenges..." />
        ) : challenges.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No challenges submitted yet"
            description="You haven't reported any societal problems yet. Step up for your community by reporting an issue in water, healthcare, education, or agriculture."
            action={{
              label: "Submit Your First Challenge",
              href: "/citizen/create-challenge",
            }}
          />
        ) : (
          <DataTable<Challenge>
            columns={columns}
            data={challenges}
            searchKey="title"
            searchPlaceholder="Filter your challenges by title..."
            pageSize={10}
            onRowClick={(row) => router.push(`/challenges/${row.id}`)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
