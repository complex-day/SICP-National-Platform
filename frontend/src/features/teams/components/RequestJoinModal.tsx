"use client";

import React, { useState } from "react";
import { Team, PRESET_SKILLS } from "@/features/teams/types/team.types";
import { teamService } from "@/services/team.service";
import { useAuthStore } from "@/store/authStore";
import { X, Send, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestJoinModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestJoinModal: React.FC<RequestJoinModalProps> = ({
  team,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const user = useAuthStore((state) => state.user);

  const [statement, setStatement] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim() || statement.trim().length < 15) {
      setError("Please write a short pitch statement explaining your relevant experience (min 15 chars).");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await teamService.requestJoin(
        team.id,
        {
          id: user?.id || "usr-current",
          name: user?.full_name || "Applicant Student",
          email: user?.email || "student@university.edu",
          institution: "University Innovation Center",
          skills: selectedSkills.length > 0 ? selectedSkills : team.requiredSkills.slice(0, 2),
        },
        statement
      );

      setIsSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Failed to submit join request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white border border-[#E2E8F0] rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-300 text-[#166534] flex items-center justify-center">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Request to Join Team</h3>
              <p className="text-xs text-[#64748B] truncate max-w-[320px]">
                {team.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-300 text-[#166534] flex items-center justify-center mx-auto animate-in zoom-in">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-[#0F172A]">Join Request Sent!</h4>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Your application has been routed to <strong>{team.leaderName}</strong> (Team Lead). You can monitor status in your Innovation Requests tab.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#166534] text-white font-semibold text-xs hover:bg-[#14532D] transition-colors cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-300 text-[#DC2626] text-xs font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Team Looking For Banner */}
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
              <span className="font-semibold text-[#64748B] block text-[11px] uppercase">
                Team is Actively Seeking:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {team.requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#166534] border border-emerald-300 text-[11px] font-bold"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Your Skills Selection */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                Select Your Skills to Contribute:
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_SKILLS.map((sk) => {
                  const isSelected = selectedSkills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                        isSelected
                          ? "bg-[#166534] text-white border-[#166534] shadow-xs"
                          : "bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#EEF2F7]"
                      )}
                    >
                      {sk}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pitch Statement */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                Why would you be a great addition to this squad? *
              </label>
              <textarea
                rows={4}
                required
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Mention past project experience, relevant coursework, hardware tools, or technical strengths..."
                className="w-full rounded-lg bg-white border border-[#E2E8F0] p-3 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] leading-relaxed"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#EEF2F7] text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-bold hover:bg-[#14532D] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Submitting..." : "Send Join Request"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
