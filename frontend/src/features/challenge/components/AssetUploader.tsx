"use client";

import React, { useState } from "react";
import { MediaType } from "../types/challenge.types";

interface AssetUploaderProps {
  onFileSelected: (file: File, mediaType: MediaType) => void;
  isUploading?: boolean;
  maxAssetsReached?: boolean;
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({
  onFileSelected,
  isUploading = false,
  maxAssetsReached = false,
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (maxAssetsReached || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    let mediaType: MediaType = "image";
    if (file.type.startsWith("image/")) {
      mediaType = "image";
    } else if (file.type === "application/pdf") {
      mediaType = "document";
    } else if (file.type.startsWith("video/")) {
      mediaType = "video";
    }
    onFileSelected(file, mediaType);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragOver
            ? "border-emerald-500 bg-emerald-500/5"
            : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
        } ${maxAssetsReached ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          type="file"
          id="asset-file-input"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={maxAssetsReached || isUploading}
          onChange={handleFileInput}
          accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-sm text-zinc-300">
            {isUploading ? (
              <span className="text-emerald-400 animate-pulse">Uploading evidence...</span>
            ) : maxAssetsReached ? (
              <span className="text-zinc-500">Maximum 5 attachments reached</span>
            ) : (
              <>
                <span className="font-semibold text-emerald-400">Click to upload</span> or drag and drop
              </>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            JPEG, PNG, WEBP (10MB), PDF (20MB), MP4 (100MB)
          </p>
        </div>
      </div>
    </div>
  );
};
