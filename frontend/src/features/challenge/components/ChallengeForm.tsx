"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { challengeFormSchema, ChallengeFormValues } from "../schemas/challenge.schema";
import { LocationPicker } from "./LocationPicker";
import { AssetUploader } from "./AssetUploader";
import { LocationData, MediaType, CHALLENGE_CATEGORIES } from "../types/challenge.types";

interface ChallengeFormProps {
  onSubmit: (data: ChallengeFormValues, files: { file: File; mediaType: MediaType }[]) => Promise<void>;
  isSubmitting?: boolean;
}

const CATEGORIES = CHALLENGE_CATEGORIES;

export const ChallengeForm: React.FC<ChallengeFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [files, setFiles] = useState<{ file: File; mediaType: MediaType }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      status: "draft",
      visibility: "PUBLIC",
      affected_population: 100,
      location: {
        lat: 23.3441,
        lng: 85.3096,
        district: "Ranchi",
        state: "Jharkhand",
      },
    },
  });

  const currentLocation = watch("location");

  const handleAddFile = (file: File, mediaType: MediaType) => {
    if (files.length < 5) {
      setFiles((prev) => [...prev, { file, mediaType }]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: ChallengeFormValues) => {
    await onSubmit(data, files);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          Challenge Title <span className="text-[#166534]">*</span>
        </label>
        <input
          type="text"
          {...register("title")}
          placeholder="e.g. Severe Drinking Water Pipeline Leakage in Ward 12"
          className="w-full rounded-xl bg-white border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] focus:outline-none"
        />
        {errors.title && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.title.message}</p>}
      </div>

      {/* Category & Population */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            Domain Category <span className="text-[#166534]">*</span>
          </label>
          <select
            {...register("category")}
            className="w-full rounded-xl bg-white border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] focus:outline-none"
          >
            <option value="">Select a Category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            Estimated Affected Population <span className="text-[#166534]">*</span>
          </label>
          <input
            type="number"
            {...register("affected_population", { valueAsNumber: true })}
            placeholder="e.g. 500"
            className="w-full rounded-xl bg-white border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] focus:outline-none"
          />
          {errors.affected_population && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.affected_population.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          Detailed Description <span className="text-[#166534]">*</span>
        </label>
        <textarea
          rows={5}
          {...register("description")}
          placeholder="Describe the societal issue, its severity, impact on daily life, and any previous attempts to resolve it..."
          className="w-full rounded-xl bg-white border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] focus:outline-none"
        />
        {errors.description && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.description.message}</p>}
      </div>

      {/* Location Picker */}
      <LocationPicker
        value={currentLocation}
        onChange={(loc: LocationData) => setValue("location", loc)}
        error={errors.location?.lat?.message || errors.location?.lng?.message}
      />

      {/* Evidence Attachments */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">Photographic & Document Evidence</label>
          <p className="text-xs text-slate-500">Upload photos, field videos, or lab reports (up to 5 files).</p>
        </div>

        <AssetUploader
          onFileSelected={handleAddFile}
          maxAssetsReached={files.length >= 5}
        />

        {files.length > 0 && (
          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-semibold text-slate-700">Selected Files ({files.length}/5):</h5>
            <div className="space-y-1.5">
              {files.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="text-slate-800 font-medium truncate max-w-[280px]">{item.file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="text-rose-600 hover:underline text-xs font-semibold ml-2 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          onClick={() => setValue("status", "submitted")}
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 rounded-xl bg-[#166534] hover:bg-[#14532D] active:bg-[#052E16] text-white font-bold text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Submitting Challenge..." : "Submit Challenge for Evaluation"}
        </button>

        <button
          type="submit"
          onClick={() => setValue("status", "draft")}
          disabled={isSubmitting}
          className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-300 transition-all disabled:opacity-50 cursor-pointer"
        >
          Save as Private Draft
        </button>
      </div>
    </form>
  );
};
