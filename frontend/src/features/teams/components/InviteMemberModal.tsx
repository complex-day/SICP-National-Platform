"use client";

import React, { useState } from "react";
import { Team, TeamRole } from "@/features/teams/types/team.types";
import { teamService } from "@/services/team.service";
import { useAuthStore } from "@/store/authStore";
import { X, Send, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InviteMemberModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  team,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("MEMBER");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill in candidate name and official email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await teamService.sendInvitation(
        team.id,
        {
          name: name.trim(),
          email: email.trim(),
          role,
          message: message.trim() || undefined,
        },
        {
          id: user?.id || "usr-current",
          name: user?.full_name || "Team Lead",
        }
      );

      setIsSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Failed to send invitation.");
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
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Invite Member to Squad</h3>
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
              <h4 className="text-lg font-bold text-[#0F172A]">Invitation Dispatched!</h4>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                An invitation has been routed to <strong>{email}</strong>. Once they accept, they will automatically join the roster.
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Candidate Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Shreya Sen"
                  className="w-full rounded-lg bg-white border border-[#E2E8F0] px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shreya@iitkgp.ac.in"
                  className="w-full rounded-lg bg-white border border-[#E2E8F0] px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Target Role in Squad *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TeamRole)}
                className="w-full rounded-lg bg-white border border-[#E2E8F0] px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] cursor-pointer"
              >
                <option value="MEMBER">Core Member</option>
                <option value="CO_LEADER">Co-Leader</option>
                <option value="MENTOR">Faculty Mentor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Personalized Note / Module Assignment
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="We'd love to have you take charge of the CAD and hardware packaging module for our team..."
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
                <span>{isSubmitting ? "Sending..." : "Dispatch Invitation"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
