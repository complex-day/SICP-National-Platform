"use client";

import React, { useState } from "react";
import { IndustryMentor } from "../types/partnership.types";
import { partnershipService } from "@/services/partnership.service";
import {
  X,
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  User,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  partnershipId: string;
  projectTitle: string;
  mentors: IndustryMentor[];
  selectedMentor?: IndustryMentor | null;
}

export function MentorshipSessionModal({
  isOpen,
  onClose,
  onSuccess,
  partnershipId,
  projectTitle,
  mentors,
  selectedMentor,
}: Props) {
  const [mentorId, setMentorId] = useState(
    selectedMentor?.id || (mentors.length > 0 ? mentors[0].id : "im-1")
  );
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [durationHours, setDurationHours] = useState<number>(2.0);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [actionItems, setActionItems] = useState<string[]>([
    "Finalize industrial test protocol",
  ]);
  const [newActionItem, setNewActionItem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentMentor =
    mentors.find((m) => m.id === mentorId) ||
    selectedMentor || {
      id: mentorId,
      name: "Dr. Arvind Swaminathan",
      company: "Tata Consultancy Services",
    };

  const handleAddActionItem = () => {
    if (newActionItem.trim()) {
      setActionItems([...actionItems, newActionItem.trim()]);
      setNewActionItem("");
    }
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !notes.trim() || durationHours <= 0) {
      setError("Please fill in session topic, duration, and minutes.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await partnershipService.logMentorshipSession(partnershipId, {
        mentorId: currentMentor.id,
        mentorName: currentMentor.name,
        sessionDate: new Date(sessionDate).toISOString(),
        durationHours: Number(durationHours),
        topic: topic.trim(),
        notes: notes.trim(),
        actionItems,
      });

      onSuccess(`Advisory session (${durationHours} hrs) with ${currentMentor.name} recorded!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record session log.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0F172A] text-base">
                Log Advisory & Mentorship Session
              </h3>
              <p className="text-xs text-[#64748B] truncate max-w-[280px]">
                {projectTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-300 text-[#DC2626] text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Mentor Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-[#166534]" />
              Industry Mentor <span className="text-[#DC2626]">*</span>
            </label>
            {mentors.length > 0 ? (
              <select
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              >
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.designation} • {m.company})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                value={currentMentor.name}
                className="w-full px-3.5 py-2 rounded-lg bg-[#EEF2F7] border border-[#E2E8F0] text-xs text-[#64748B]"
              />
            )}
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#166534]" />
                Session Date <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#166534]" />
                Duration (Hours) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                required
              />
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">
              Technical Discussion Topic <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Firmware optimization, ISO 14001 compliance, Edge inference"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">
              Session Minutes & Technical Guidance <span className="text-[#DC2626]">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summarize key findings, architecture recommendations, and design trade-offs discussed..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] resize-none"
              required
            />
          </div>

          {/* Action Items */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#0F172A]">
              Key Action Items & Next Steps
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newActionItem}
                onChange={(e) => setNewActionItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddActionItem();
                  }
                }}
                placeholder="Add actionable task..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-3 py-1.5 rounded-lg bg-[#EEF2F7] text-[#0F172A] text-xs font-semibold hover:bg-[#E2E8F0] transition-colors flex items-center gap-1 border border-[#E2E8F0]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            {actionItems.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs"
                  >
                    <span className="text-[#0F172A]">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveActionItem(idx)}
                      className="text-[#64748B] hover:text-[#DC2626] transition-colors p-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#EEF2F7] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !topic.trim()}
              className="px-5 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Recording Session...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Save Session Log
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
