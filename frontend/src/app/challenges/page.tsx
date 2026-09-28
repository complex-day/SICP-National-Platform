"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  Challenge,
  ChallengeFiltersState,
} from "@/features/challenges/types/challenge.types";
import { ChallengeCard } from "@/features/challenge/components/ChallengeCard";
import { ChallengeFilters } from "@/features/challenge/components/ChallengeFilters";
import { ChallengeStatusBadge } from "@/features/challenge/components/ChallengeStatusBadge";
import { ChallengeUrgencyBadge } from "@/features/challenge/components/ChallengeUrgencyBadge";
import { challengeService } from "@/services/challenge.service";
import {
  LayoutGrid,
  List,
  Plus,
  Compass,
  ThumbsUp,
  MapPin,
  Calendar,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChallengesMarketplacePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ChallengeFiltersState>({
    page: 1,
    limit: 50,
    sortBy: "newest",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load Challenges
  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const res = await challengeService.listChallenges(filters);
      setChallenges(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to load challenges catalog:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [filters]);

  // Extract unique states and districts for filters dropdowns
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    challenges.forEach((c) => {
      if (c.location?.state) states.add(c.location.state);
    });
    return ["All States", ...Array.from(states).sort()];
  }, [challenges]);

  const availableDistricts = useMemo(() => {
    const districts = new Set<string>();
    challenges.forEach((c) => {
      if (filters.state && c.location?.state !== filters.state) return;
      if (c.location?.district) districts.add(c.location.district);
    });
    return Array.from(districts).sort();
  }, [challenges, filters.state]);

  // Table Columns Definition
  const tableColumns: ColumnDef<Challenge>[] = [
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
          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
            {row.description}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (row) => (
        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-[#166534] border border-emerald-200 text-[11px] font-bold whitespace-nowrap">
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
      key: "location",
      header: "District & State",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-foreground/90 whitespace-nowrap">
          <MapPin className="h-3 w-3 text-primary shrink-0" />
          <span>
            {row.location?.district || "—"}, {row.location?.state || ""}
          </span>
        </div>
      ),
    },
    {
      key: "urgency",
      header: "Urgency",
      sortable: true,
      render: (row) => <ChallengeUrgencyBadge urgency={row.urgency} />,
    },
    {
      key: "upvotes",
      header: "Upvotes",
      sortable: true,
      align: "center",
      render: (row) => (
        <div className="inline-flex items-center gap-1 font-bold text-xs text-foreground">
          <ThumbsUp className="h-3 w-3 text-primary" />
          <span>{row.upvotes || 0}</span>
        </div>
      ),
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
          title="Public Challenge Marketplace"
          description="Explore verified grassroots societal challenges submitted by citizens across India, open for university research solving and corporate CSR backing."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Challenge Marketplace" },
          ]}
          actions={
            <Link
              href="/citizen/create-challenge"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#166534] text-white font-bold text-xs hover:bg-[#14532D] transition-all shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Submit Challenge</span>
            </Link>
          }
        />

        {/* Filters Bar */}
        <ChallengeFilters
          filters={filters}
          onChange={setFilters}
          availableStates={availableStates}
          availableDistricts={availableDistricts}
        />

        {/* View Switcher & Result Count Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-muted-foreground">
            Showing <strong className="text-foreground">{challenges.length}</strong> of{" "}
            <strong className="text-foreground">{total}</strong> verified challenges
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === "card"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Card Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Data Table View"
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Content Render */}
        {isLoading ? (
          <LoadingState message="Loading societal challenge marketplace..." />
        ) : challenges.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No challenges found"
            description="Try adjusting your search criteria, category filters, or location selectors."
            action={{
              label: "Reset All Filters",
              onClick: () =>
                setFilters({
                  page: 1,
                  limit: 50,
                  sortBy: "newest",
                }),
            }}
            secondaryAction={{
              label: "Report a New Challenge",
              href: "/citizen/create-challenge",
            }}
          />
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onUpvoteChange={(id, newCount) => {
                  setChallenges((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, upvotes: newCount } : c))
                  );
                }}
              />
            ))}
          </div>
        ) : (
          <DataTable<Challenge>
            columns={tableColumns}
            data={challenges}
            pageSize={10}
            onRowClick={(row) => router.push(`/challenges/${row.id}`)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
