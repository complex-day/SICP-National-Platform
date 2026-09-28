"use client";

import React, { useState } from "react";
import { LocationData } from "../types/challenge.types";

interface LocationPickerProps {
  value: LocationData;
  onChange: (loc: LocationData) => void;
  error?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, error }) => {
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage("Geolocation is not supported by your browser");
      return;
    }

    setIsCapturingGPS(true);
    setGpsMessage("Locating device GPS...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          ...value,
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
        });
        setIsCapturingGPS(false);
        setGpsMessage("GPS coordinates acquired successfully");
      },
      (err) => {
        setIsCapturingGPS(false);
        setGpsMessage(`GPS Error: ${err.message}. Using fallback coordinates.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Geospatial Coordinates</h4>
          <p className="text-xs text-slate-500">Pinpoint the location of the societal challenge.</p>
        </div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isCapturingGPS}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isCapturingGPS ? (
            <span>Locating...</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use Current GPS
            </>
          )}
        </button>
      </div>

      {gpsMessage && (
        <p className="text-xs text-emerald-700 italic">{gpsMessage}</p>
      )}

      {/* Coordinate Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Latitude</label>
          <input
            type="number"
            step="0.000001"
            value={value.lat || ""}
            onChange={(e) => onChange({ ...value, lat: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] focus:outline-none"
            placeholder="e.g. 23.344100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Longitude</label>
          <input
            type="number"
            step="0.000001"
            value={value.lng || ""}
            onChange={(e) => onChange({ ...value, lng: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] focus:outline-none"
            placeholder="e.g. 85.309600"
          />
        </div>
      </div>

      {/* District & State */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-slate-700 mb-1">District</label>
          <input
            type="text"
            value={value.district || ""}
            onChange={(e) => onChange({ ...value, district: e.target.value })}
            className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] focus:outline-none"
            placeholder="e.g. Ranchi"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
          <input
            type="text"
            value={value.state || ""}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] focus:outline-none"
            placeholder="e.g. Jharkhand"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-slate-700 mb-1">Locality / Address</label>
          <input
            type="text"
            value={value.address_text || ""}
            onChange={(e) => onChange({ ...value, address_text: e.target.value })}
            className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] focus:outline-none"
            placeholder="e.g. Ward 12, Village Rampur"
          />
        </div>
      </div>

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

