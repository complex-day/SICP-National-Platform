import React from "react";
import { ChallengeAsset } from "../types/challenge.types";

interface ChallengeAssetGalleryProps {
  assets: ChallengeAsset[];
}

export const ChallengeAssetGallery: React.FC<ChallengeAssetGalleryProps> = ({ assets }) => {
  if (!assets || assets.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
        No media attachments uploaded for this challenge.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between shadow-xs"
        >
          <div className="p-3 bg-slate-50 flex items-center justify-between border-b border-slate-200 text-xs">
            <span className="font-semibold text-slate-800 truncate max-w-[180px]">{asset.file_name}</span>
            <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
              {asset.media_type}
            </span>
          </div>
          <div className="p-4 flex items-center justify-center min-h-[120px] bg-slate-50/50">
            {asset.media_type === "image" ? (
              <img
                src={asset.storage_url}
                alt={asset.file_name}
                className="max-h-36 max-w-full object-contain rounded-lg border border-slate-200"
              />
            ) : asset.media_type === "document" ? (
              <div className="flex flex-col items-center gap-2 text-slate-600">
                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium">PDF Document</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-600">
                <svg className="w-8 h-8 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium">Video File</span>
              </div>
            )}
          </div>
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>{(asset.file_size_bytes / 1024).toFixed(1)} KB</span>
            <a
              href={asset.storage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#166534] hover:underline font-semibold inline-flex items-center gap-1"
            >
              View File
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
