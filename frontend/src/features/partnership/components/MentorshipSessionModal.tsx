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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                Log Advisory & Mentorship Session
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                {projectTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Mentor Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground" />
              Industry Mentor <span className="text-rose-400">*</span>
            </label>
            {mentors.length > 0 ? (
              <select
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
                className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground"
              />
            )}
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Session Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-purple-400" />
                Duration (Hours) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Technical Discussion Topic <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Firmware optimization, ISO 14001 compliance, Edge inference"
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Session Minutes & Technical Guidance <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summarize key findings, architecture recommendations, and design trade-offs discussed..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
              required
            />
          </div>

          {/* Action Items */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
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
                className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1 border border-border"
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
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40 border border-border/50 text-xs"
                  >
                    <span className="text-foreground">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveActionItem(idx)}
                      className="text-muted-foreground hover:text-rose-400 transition-colors p-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !topic.trim()}
              className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center gap-2 transition-all"
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
