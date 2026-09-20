"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  CHALLENGE_CATEGORIES,
  ChallengeCategory,
  UrgencyLevel,
  URGENCY_LEVELS,
  CreateChallengeInput,
} from "@/features/challenges/types/challenge.types";
import { challengeService } from "@/services/challenge.service";
import { useAuthStore } from "@/store/authStore";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  MapPin,
  Users,
  AlertTriangle,
  Info,
  Sparkles,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_TITLES = [
  { step: 1, title: "Problem Definition", desc: "Title, scope & domain" },
  { step: 2, title: "Geospatial Location", desc: "State, district & GPS" },
  { step: 3, title: "Impact & Urgency", desc: "Affected people & severity" },
  { step: 4, title: "Evidence Uploads", desc: "Field photos & documents" },
  { step: 5, title: "Review & Submit", desc: "Final validation" },
];

export default function CreateChallengePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ChallengeCategory>("Water Conservation");

  const [stateName, setStateName] = useState("Maharashtra");
  const [district, setDistrict] = useState("Pune");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number>(18.5204);
  const [longitude, setLongitude] = useState<number>(73.8567);

  const [affectedPopulation, setAffectedPopulation] = useState<number>(5000);
  const [urgency, setUrgency] = useState<UrgencyLevel>("HIGH");

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ name: string; size: string; isImage: boolean; url: string }[]>([]);

  // Step 4 File Upload Handler (Max 5 files)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 5) {
      setErrorMessage("Maximum 5 files allowed in total.");
      return;
    }

    setErrorMessage(null);
    const newFiles = [...files, ...selected].slice(0, 5);
    setFiles(newFiles);

    const newPreviews = newFiles.map((file) => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      isImage: file.type.startsWith("image/"),
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  // Quick GPS coordinate preset
  const handleUseCurrentLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
        },
        () => {
          // Fallback demo coordinates
          setLatitude(18.5204);
          setLongitude(73.8567);
        }
      );
    }
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!title.trim() || title.trim().length < 5) {
        setErrorMessage("Please enter a meaningful challenge title (minimum 5 characters).");
        return false;
      }
      if (!description.trim() || description.trim().length < 20) {
        setErrorMessage("Please provide a detailed problem description (minimum 20 characters).");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!stateName.trim() || !district.trim() || !address.trim()) {
        setErrorMessage("Please provide state, district, and specific address/landmark.");
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!affectedPopulation || affectedPopulation <= 0) {
        setErrorMessage("Please specify the estimated affected citizen population.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(5, s + 1));
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const input: CreateChallengeInput = {
        title,
        description,
        category,
        location: {
          state: stateName,
          district,
          address,
          latitude,
          longitude,
        },
        affectedPopulation,
        urgency,
        mediaFiles: files,
      };

      const created = await challengeService.createChallenge(
        input,
        user?.id || "cit-current",
        user?.full_name || "Verified Citizen"
      );

      // Redirect to challenge detail view or my challenges
      router.push(`/challenges/${created.id}`);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred while saving the challenge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Submit a Societal Challenge"
          description="Report local grassroots issues in water, healthcare, infrastructure, or agriculture to connect with academic problem-solvers, university labs, and CSR sponsors."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Challenges", href: "/challenges" },
            { label: "Submit Challenge" },
          ]}
        />

        {/* Wizard Progress Indicator */}
        <div className="glass-panel border border-border/80 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none gap-2">
            {STEP_TITLES.map((st) => {
              const isDone = st.step < currentStep;
              const isCurrent = st.step === currentStep;

              return (
                <div
                  key={st.step}
                  onClick={() => {
                    if (isDone) setCurrentStep(st.step);
                  }}
                  className={cn(
                    "flex items-center gap-3 shrink-0 cursor-pointer select-none transition-all",
                    isDone && "opacity-80 hover:opacity-100",
                    !isDone && !isCurrent && "opacity-40"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-xs",
                      isDone && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !isDone && !isCurrent && "bg-muted border border-border text-muted-foreground"
                    )}
                  >
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : st.step}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div
                      className={cn(
                        "text-xs font-bold leading-none",
                        isCurrent ? "text-foreground font-extrabold" : "text-muted-foreground"
                      )}
                    >
                      {st.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{st.desc}</div>
                  </div>
                  {st.step < 5 && <div className="hidden md:block w-8 h-0.5 bg-border ml-2" />}
                </div>
              );
            })}
          </div>

          {/* Mobile Current Step Subtitle */}
          <div className="sm:hidden mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="font-bold text-primary">
              Step {currentStep} of 5: {STEP_TITLES[currentStep - 1]?.title}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {STEP_TITLES[currentStep - 1]?.desc}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Wizard Steps Form */}
        <div className="glass-panel border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* STEP 1: Problem Definition */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-lg font-bold text-foreground">Step 1: Challenge Overview</h2>
                <p className="text-xs text-muted-foreground">
                  Clearly define the problem statement and domain category.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Challenge Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., High Fluoride Contamination in Rural Dug Wells"
                    className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Write a crisp, actionable title describing the specific local issue.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Domain Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {CHALLENGE_CATEGORIES.map((cat) => {
                      const isSelected = category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={cn(
                            "p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px]",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-background border-border text-foreground hover:bg-muted"
                          )}
                        >
                          <span>{cat}</span>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 self-end" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Detailed Problem Description *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the background, symptoms, existing failed attempts, daily impact on families, and what technical help is needed..."
                    className="w-full rounded-xl bg-background border border-border p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Geospatial & Location */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-lg font-bold text-foreground">Step 2: Location Information</h2>
                <p className="text-xs text-muted-foreground">
                  Specify the regional jurisdiction and GPS location coordinates.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      State / Union Territory *
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g., Maharashtra"
                      className="w-full rounded-xl bg-background border border-border px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      District *
                    </label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g., Pune"
                      className="w-full rounded-xl bg-background border border-border px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Address / Gram Panchayat / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., Sector 4, Gram Panchayat Office, Makrana Block"
                    className="w-full rounded-xl bg-background border border-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Compass className="h-4 w-4 text-primary" />
                      GPS Coordinates (Latitude & Longitude)
                    </span>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Auto-Detect Coordinates
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Impact & Urgency */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-lg font-bold text-foreground">Step 3: Impact Scope & Severity</h2>
                <p className="text-xs text-muted-foreground">
                  Estimate the scale of citizens affected and the urgency tier for problem triage.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Estimated Affected Population *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="number"
                        min={1}
                        max={10000000}
                        value={affectedPopulation}
                        onChange={(e) => setAffectedPopulation(parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  {/* Preset Chips */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">Quick Presets:</span>
                    {[500, 2500, 10000, 50000, 150000].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setAffectedPopulation(num)}
                        className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-semibold text-foreground transition-colors cursor-pointer"
                      >
                        ~{num.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Urgency Level *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {URGENCY_LEVELS.map((lvl) => {
                      const isSelected = urgency === lvl;
                      const colors: Record<UrgencyLevel, { ring: string; badge: string }> = {
                        LOW: { ring: "border-slate-400 bg-slate-100", badge: "text-slate-700" },
                        MEDIUM: { ring: "border-amber-400 bg-amber-50", badge: "text-amber-800" },
                        HIGH: { ring: "border-orange-400 bg-orange-50", badge: "text-orange-800" },
                        CRITICAL: { ring: "border-rose-400 bg-rose-50", badge: "text-rose-800" },
                      };

                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setUrgency(lvl)}
                          className={cn(
                            "p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                            isSelected
                              ? `${colors[lvl].ring} ring-2 ring-primary`
                              : "bg-background border-border hover:bg-muted"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn("text-xs font-bold", colors[lvl].badge)}>{lvl}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            {lvl === "LOW" && "Routine issue without health hazards."}
                            {lvl === "MEDIUM" && "Moderate seasonal distress or hardship."}
                            {lvl === "HIGH" && "Severe livelihood or health danger."}
                            {lvl === "CRITICAL" && "Immediate emergency life/safety risk."}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Uploads & Evidence */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-lg font-bold text-foreground">Step 4: Evidence & Documentation</h2>
                <p className="text-xs text-muted-foreground">
                  Upload field photographs, test reports, or water analysis documents (Maximum 5 files).
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-muted/20 hover:bg-muted/40 transition-colors relative">
                <input
                  type="file"
                  multiple
                  disabled={files.length >= 5}
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Click or drag field files to upload
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Supports JPG, PNG, WebP images and PDF documents up to 10MB each. Maximum 5 files ({files.length}/5 uploaded).
                  </p>
                </div>
              </div>

              {/* File Previews List */}
              {previews.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Uploaded Attachments ({previews.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {previews.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-border bg-background flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.isImage && item.url ? (
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                            <span className="text-[10px] text-muted-foreground">{item.size}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove File"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Review & Submission */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-lg font-bold text-foreground">Step 5: Review & Submit</h2>
                <p className="text-xs text-muted-foreground">
                  Double check all details before formal submission to the innovation marketplace.
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl border border-border bg-muted/30 p-6 space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                    {category}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 text-xs font-bold">
                    Urgency: {urgency}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Location</span>
                    <strong className="text-foreground">
                      {district}, {stateName}
                    </strong>
                    <span className="text-muted-foreground block text-[11px] truncate">{address}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Impact & Evidence</span>
                    <strong className="text-foreground">
                      ~{affectedPopulation.toLocaleString()} citizens affected
                    </strong>
                    <span className="text-muted-foreground block text-[11px]">
                      {files.length} attached document{files.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3 text-xs text-foreground/90">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  By submitting, this challenge will be indexed on the National Innovation Platform for AI clustering, university research matching, and state government verification.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-border/70 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-bold text-foreground transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isSubmitting ? "Submitting Challenge..." : "Confirm & Submit Challenge"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
