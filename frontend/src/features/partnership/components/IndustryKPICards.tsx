"use client";

import React from "react";
import { KPICard } from "@/components/ui/KPICard";
import { IndustryKPIs } from "../types/partnership.types";
import {
  Handshake,
  IndianRupee,
  Users,
  Compass,
  Percent,
  Sparkles,
} from "lucide-react";

interface IndustryKPICardsProps {
  kpis: IndustryKPIs | null;
  isLoading?: boolean;
}

export function IndustryKPICards({ kpis, isLoading = false }: IndustryKPICardsProps) {
  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard
        title="Active Partnerships"
        value={kpis ? kpis.activePartnerships : "--"}
        subtitle="MoU signed & active pilots"
        icon={Handshake}
        accentColor="brand"
        isLoading={isLoading}
        trend={{
          value: "+24% QoQ",
          direction: "up",
          isPositive: true,
        }}
      />

      <KPICard
        title="Total CSR Funding"
        value={kpis ? formatLakhs(kpis.totalCSRFundingCommitted) : "--"}
        subtitle={kpis ? `${formatLakhs(kpis.totalCSRFundingDisbursed)} disbursed` : "CSR Grants"}
        icon={IndianRupee}
        accentColor="emerald"
        isLoading={isLoading}
        trend={{
          value: "+₹28L",
          direction: "up",
          isPositive: true,
        }}
      />

      <KPICard
        title="Active Mentors"
        value={kpis ? kpis.activeIndustryMentors : "--"}
        subtitle="Senior technical advisors"
        icon={Users}
        accentColor="purple"
        isLoading={isLoading}
        trend={{
          value: "+8 this mo",
          direction: "up",
          isPositive: true,
        }}
      />

      <KPICard
        title="Pilot Deployments"
        value={kpis ? kpis.pilotDeploymentsCount : "--"}
        subtitle="Live field testbeds"
        icon={Compass}
        accentColor="amber"
        isLoading={isLoading}
        trend={{
          value: "100% active",
          direction: "neutral",
        }}
      />

      <KPICard
        title="Funding Utilization"
        value={kpis ? `${kpis.fundingUtilizationPercentage}%` : "--"}
        subtitle={kpis ? `${kpis.commercializedSolutions} Commercialized` : "Disbursement pace"}
        icon={Percent}
        accentColor="blue"
        isLoading={isLoading}
        trend={{
          value: "Target 60%",
          direction: "up",
          isPositive: true,
        }}
      />
    </div>
  );
}
