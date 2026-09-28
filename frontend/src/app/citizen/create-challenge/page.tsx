"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
  FileText,
  MapPin,
  UploadCloud,
  Image as ImageIcon,
  FileCheck,
  Video,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Navigation,
  Save,
  Send,
  Info,
  Layers,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATES_LIST = [
  "Jharkhand",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Gujarat",
  "Rajasthan",
  "Madhya Pradesh",
  "West Bengal",
  "Bihar",
  "Odisha",
  "Telangana",
  "Andhra Pradesh",
  "Kerala",
  "Punjab",
  "Haryana",
  "Delhi NCR",
];

const DISTRICTS_BY_STATE: Record<string, string[]> = {
  Jharkhand: ["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Palamu", "Hazaribagh", "Deoghar", "Giridih"],
  Maharashtra: ["Pune", "Mumbai City", "Mumbai Suburban", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur"],
  Karnataka: ["Bengaluru Urban", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Tumakuru"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "Uttar Pradesh": ["Lucknow", "Varanasi", "Noida", "Kanpur", "Agra", "Prayagraj", "Meerut"],
};

export default function SubmitProblemPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Section 1: Problem Information
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ChallengeCategory>("Water Conservation");
  const [description, setDescription] = useState("");

  // Section 2: Location (PM GatiShakti style)
  const [stateName, setStateName] = useState("Jharkhand");
  const [district, setDistrict] = useState("Ranchi");
  const [block, setBlock] = useState("Kanke Block");
  const [village, setVillage] = useState("Pithoria");
  const [latitude, setLatitude] = useState<number>(23.3441);
  const [longitude, setLongitude] = useState<number>(85.3096);

  // Section 3: Evidence Uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);

  // Section 4: Impact Assessment
  const [affectedPopulation, setAffectedPopulation] = useState<number>(4500);
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");
  const [urgency, setUrgency] = useState<UrgencyLevel>("HIGH");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // State Change handler
  const handleStateChange = (selectedState: string) => {
    setStateName(selectedState);
    const districts = DISTRICTS_BY_STATE[selectedState] || ["Central District", "North District", "South District"];
    setDistrict(districts[0]);
  };

  // GPS Location Locator
  const handleGetLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
        },
        () => {
          // Default Ranchi coordinates
          setLatitude(23.3441);
          setLongitude(85.3096);
        }
      );
    }
  };

  // File Upload Helpers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...selected].slice(0, 4));
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setDocFiles((prev) => [...prev, ...selected].slice(0, 3));
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setVideoFiles((prev) => [...prev, ...selected].slice(0, 2));
    }
  };

  const validateForm = (): boolean => {
    setErrorMessage(null);
    if (!title.trim() || title.trim().length < 5) {
      setErrorMessage("Please enter a clear challenge title (minimum 5 characters).");
      return false;
    }
    if (!description.trim() || description.trim().length < 20) {
      setErrorMessage("Please provide a detailed problem description (minimum 20 characters).");
      return false;
    }
    if (!stateName || !district) {
      setErrorMessage("Please select valid State and District.");
      return false;
    }
    if (!affectedPopulation || affectedPopulation <= 0) {
      setErrorMessage("Please enter an estimated affected citizen count.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const allFiles = [...imageFiles, ...docFiles, ...videoFiles];
      const addressString = `${village ? village + ", " : ""}${block ? block + ", " : ""}${district}, ${stateName}`;

      const input: CreateChallengeInput = {
        title,
        description: description + (additionalNotes ? `\n\nAdditional Field Notes: ${additionalNotes}` : ""),
        category,
        location: {
          state: stateName,
          district,
          address: addressString,
          latitude,
          longitude,
        },
        affectedPopulation,
        urgency,
        mediaFiles: allFiles,
      };

      const created = await challengeService.createChallenge(
        input,
        user?.id || "cit-current",
        user?.full_name || "Citizen Contributor"
      );

      setSuccessId(created.id);
      router.push(`/citizen/report/${created.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit challenge. Please review form inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout requireAuth={false}>
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/" className="hover:text-[#166534]">Portal</Link>
            <span>/</span>
            <Link href="/citizen/dashboard" className="hover:text-[#166534]">Citizen Command</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Submit Challenge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#212121] tracking-tight">
            Official Grievance & Societal Problem Intake
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Submit a verified grassroots challenge for automated AI classification and university research allocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded border border-gray-300">
            Form Code: SICP-GRIEVANCE-V2
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-300 text-red-900 px-4 py-3 rounded-md text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Structured Government 4-Section Form */}
      <div className="space-y-6">
        {/* SECTION 1: PROBLEM INFORMATION */}
        <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded bg-[#166534] text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h2 className="text-sm font-bold text-[#212121] uppercase tracking-wide">
                Problem Information
              </h2>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">Mandatory Fields</span>
          </div>

          <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Challenge Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ground Water Contamination & Arsenic Toxicity in Ward 4"
                className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3.5 py-2 text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534] text-sm"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                State the core community bottleneck clearly in 5 to 100 characters.
              </p>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Primary Societal Sector / Category <span className="text-red-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ChallengeCategory)}
                className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3.5 py-2 text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534] text-sm"
              >
                {CHALLENGE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Detailed Problem Description <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what is failing, who is impacted, historical context, and any unsuccessful prior interventions..."
                className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3.5 py-2 text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534] text-sm"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Minimum 20 characters. Include physical observations and community constraints.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: LOCATION DETAILS (PM GATISHAKTI GIS STYLE) */}
        <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded bg-[#166534] text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h2 className="text-sm font-bold text-[#212121] uppercase tracking-wide">
                Geospatial Location & Administrative Jurisdiction
              </h2>
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              className="text-xs font-semibold text-[#166534] hover:text-blue-900 inline-flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded border border-blue-200"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Use GPS Location</span>
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* State */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  State / UT <span className="text-red-600">*</span>
                </label>
                <select
                  value={stateName}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3 py-2 text-[#212121] text-sm"
                >
                  {STATES_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  District <span className="text-red-600">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3 py-2 text-[#212121] text-sm"
                >
                  {(DISTRICTS_BY_STATE[stateName] || ["Ranchi", "Dhanbad", "Bokaro", "Palamu"]).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Block / Sub-District
                </label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="e.g. Kanke Block"
                  className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3 py-2 text-[#212121] text-sm"
                />
              </div>

              {/* Village */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Village / Ward / Locality
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Ward No. 14"
                  className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3 py-2 text-[#212121] text-sm"
                />
              </div>
            </div>

            {/* GPS Coordinates Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Latitude Coordinate
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3 py-1.5 font-mono text-xs text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Longitude Coordinate
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3 py-1.5 font-mono text-xs text-gray-800"
                />
              </div>
            </div>

            {/* PM GatiShakti Visual Map Simulator Box */}
            <div className="mt-4 border border-[#E2E8F0] rounded-md bg-slate-100 overflow-hidden relative">
              <div className="h-44 sm:h-56 w-full bg-[#E5E9F0] flex flex-col items-center justify-center p-4 text-center">
                <div className="h-10 w-10 rounded-full bg-[#166534] text-white flex items-center justify-center shadow-md animate-bounce mb-2">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Target Pin: {district}, {stateName}
                </div>
                <div className="text-[11px] font-mono text-slate-600">
                  Lat: {latitude}° N | Lng: {longitude}° E (PostGIS EPSG:4326)
                </div>
                <p className="text-[10px] text-slate-500 mt-1 max-w-sm">
                  Pin is locked to administrative GIS boundaries for automated university proximity matching.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: EVIDENCE UPLOAD (SEPARATE ZONES) */}
        <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded bg-[#166534] text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h2 className="text-sm font-bold text-[#212121] uppercase tracking-wide">
                Evidence Uploads
              </h2>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">Images • Documents • Videos</span>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Zone A: Images */}
              <div className="border border-dashed border-[#E2E8F0] rounded-md p-4 bg-[#F5F7FA] text-center flex flex-col items-center justify-between">
                <div className="space-y-1.5">
                  <ImageIcon className="h-7 w-7 text-[#166534] mx-auto opacity-80" />
                  <div className="font-bold text-xs text-[#212121]">Upload Images</div>
                  <div className="text-[10px] text-gray-500">JPG, PNG, WebP (Max 4 photos)</div>
                </div>
                <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs">
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Choose Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {imageFiles.length > 0 && (
                  <div className="mt-2 text-[11px] text-[#2E7D32] font-semibold">
                    {imageFiles.length} photo(s) selected
                  </div>
                )}
              </div>

              {/* Zone B: Documents */}
              <div className="border border-dashed border-[#E2E8F0] rounded-md p-4 bg-[#F5F7FA] text-center flex flex-col items-center justify-between">
                <div className="space-y-1.5">
                  <FileCheck className="h-7 w-7 text-[#F57C00] mx-auto opacity-80" />
                  <div className="font-bold text-xs text-[#212121]">Upload Documents</div>
                  <div className="text-[10px] text-gray-500">PDF, Reports, Grievance Scans</div>
                </div>
                <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs">
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Choose PDF</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocUpload}
                    className="hidden"
                  />
                </label>
                {docFiles.length > 0 && (
                  <div className="mt-2 text-[11px] text-[#2E7D32] font-semibold">
                    {docFiles.length} document(s) selected
                  </div>
                )}
              </div>

              {/* Zone C: Videos */}
              <div className="border border-dashed border-[#E2E8F0] rounded-md p-4 bg-[#F5F7FA] text-center flex flex-col items-center justify-between">
                <div className="space-y-1.5">
                  <Video className="h-7 w-7 text-[#0369A1] mx-auto opacity-80" />
                  <div className="font-bold text-xs text-[#212121]">Upload Field Video</div>
                  <div className="text-[10px] text-gray-500">MP4, WebM (Max 50MB)</div>
                </div>
                <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs">
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Choose Video</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
                {videoFiles.length > 0 && (
                  <div className="mt-2 text-[11px] text-[#2E7D32] font-semibold">
                    {videoFiles.length} video(s) selected
                  </div>
                )}
              </div>
            </div>

            {/* Uploaded manifest listing */}
            {(imageFiles.length > 0 || docFiles.length > 0 || videoFiles.length > 0) && (
              <div className="border-t border-gray-200 pt-3">
                <div className="text-xs font-bold text-gray-700 mb-2">Selected Attachments:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {imageFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 border rounded">
                      <span className="truncate max-w-[200px] text-gray-800">📷 {f.name}</span>
                      <button
                        type="button"
                        onClick={() => setImageFiles(imageFiles.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {docFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 border rounded">
                      <span className="truncate max-w-[200px] text-gray-800">📄 {f.name}</span>
                      <button
                        type="button"
                        onClick={() => setDocFiles(docFiles.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {videoFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 border rounded">
                      <span className="truncate max-w-[200px] text-gray-800">🎥 {f.name}</span>
                      <button
                        type="button"
                        onClick={() => setVideoFiles(videoFiles.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: IMPACT ASSESSMENT */}
        <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded bg-[#166534] text-white flex items-center justify-center font-bold text-xs">
                4
              </span>
              <h2 className="text-sm font-bold text-[#212121] uppercase tracking-wide">
                Impact Assessment & Urgency Metrics
              </h2>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">Prioritization Input</span>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Estimated Population */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Estimated People Affected <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={affectedPopulation}
                  onChange={(e) => setAffectedPopulation(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3 py-2 text-[#212121] text-sm"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Severity Rating
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3 py-2 text-[#212121] text-sm"
                >
                  <option value="LOW">Low (Minor Convenience)</option>
                  <option value="MEDIUM">Medium (Persistent Local Problem)</option>
                  <option value="HIGH">High (Major Public Disruption)</option>
                  <option value="CRITICAL">Critical (Life / Health Hazard)</option>
                </select>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Urgency Window
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3 py-2 text-[#212121] text-sm"
                >
                  <option value="LOW">Routine (Standard Scheduling)</option>
                  <option value="MEDIUM">Moderate (Resolve in 30 Days)</option>
                  <option value="HIGH">High Priority (Immediate Action)</option>
                  <option value="CRITICAL">Emergency Intervention</option>
                </select>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Additional Notes / Field Remarks
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any special remarks for faculty mentors or visiting engineering survey teams..."
                className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-3 py-2 text-[#212121] text-sm"
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS (RIGHT ALIGNED) */}
        <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4">
          <Link
            href="/citizen/dashboard"
            className="text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            &larr; Cancel & Return
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-md transition-colors shadow-2xs inline-flex items-center gap-1.5"
            >
              <Save className="h-4 w-4 text-gray-500" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#166534] hover:bg-[#083b7a] text-white text-xs sm:text-sm font-bold rounded-md transition-colors shadow-xs inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Challenge</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
